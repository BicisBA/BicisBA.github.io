import React, { useEffect } from "react";
import L from "leaflet";
import { BACKEND, OBELISCOU, CABA_BOUNDS } from "./Constants";

const getBackend = async (endpoint) => {
  const data = await fetch(`${BACKEND}/${endpoint}`);
  const stations = await data.json();
  const byStationId = stations.reduce((acc, station) => {
    acc[station.station_id] = station
    return acc
  }, {})
  return byStationId
}

const postBackend = async (endpoint, body) => {
  const data = await fetch(`${BACKEND}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return data.json();
}

const getColor = (probability) => {
  if (probability >= 0.6) return 'green'
  else if (probability >= 0.2) return 'yellow'
  else return 'red'
}

const useData = () => {
  const [estaciones, setEstaciones] = React.useState({})
  const [nearestEstaciones, setNearestEstaciones] = React.useState({})
  const [backendDead, setBackendDead] = React.useState(false);
  const [bicis, setBicis] = React.useState({})
  const [center, setCenter] = React.useState(OBELISCOU);
  const prevCenter = React.useRef();

  useEffect(() => {
    // On boot we fetch the station information and the bike availability
    const fetchStationInformation = async () => {
      try {
        const stationsById = await getBackend('stations')
        setEstaciones(stationsById)
      } catch (e) {
        setBackendDead(true)
      }
    }
    const fetchBicis = async () => {
      const bicisByStationId = await getBackend('stations/status')
      setBicis(bicisByStationId)
    }

    fetchStationInformation()
    fetchBicis()

    // We refresh the bike availability every 30 seconds
    const interval = setInterval(fetchBicis, 30000);
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    // We only update the predictions if we moved at least 200 meters away from our previous location
    // https://blog.logrocket.com/accessing-previous-props-state-react-hooks/
    const distance = prevCenter.current ? L.latLng(center).distanceTo(L.latLng(prevCenter.current)) : 201
    if (distance <= 200 || !Object.keys(estaciones).length) {
      return
    }
    prevCenter.current = center

    const addRankings = async (nearest) => {
      // What's going on, in the prediction endpoint?
      // We need to provide the user's ETA to the station (`user_eta`):
      //   how many minutes it will take them to walk to the station (we compute this manually)
      // (The user's location is only sent for analytics reasons, not for the prediction)
      //
      // Then, the backend will give us:
      // - The probability of a bike being available when we get there (`bike_availability_probability`)
      // - When there will be a new bike available (`bike_eta`)
      //
      // So, if we are 10 minutes away from the station and we predict that a
      //   a new bike will be available in 15 minutes, that means we should start
      //   walking in 5 minutes.
      // We provide that value as `leave_at`.
      //
      // Considering we are running two independent predictions,
      //   (what happens when we arrive vs when is the next bike available)
      //   theres a border case in which this predictions are not coherent
      //   between each other.
      // This case would be when the `bike_eta` is less than the`user_eta`,
      //   (i.e, the next bike will be available earlier than we can get there)
      // In that case, we tell the user should leave in one minute.
      //   While this is not entirely accurate, it gives our users a better
      //   experience than explaining our whole prediction method.

      const nearest_with_ranking = await Promise.all(nearest.map(async (estacion) => {
        // Ideally we would ping a service like OSRM to get the walking duration between two points
        // However, OSRM free server only computes driving duration, and there's no free walking duration service
        // We compute the walking duration, assuming a walking speed of 5km/h (average human speed, with dubious sources)
        const user_eta = (estacion.distance / 1000) * 60 / 5

        const { bike_availability_probability, bike_eta } = await postBackend(`stations/${estacion.station_id}/prediction`, {
          user_eta,
          user_lat: center.lat,
          user_lon: center.lng,
        })

        return {
          ...estacion,
          leave_at: bike_eta >= user_eta ? bike_eta - user_eta : 1,
          probability: bike_availability_probability,
          color: getColor(bike_availability_probability),
        }
      }))
      const nearestById = nearest_with_ranking.reduce((acc, station) => {
        acc[station.station_id] = station
        return acc
      }, {})

      setNearestEstaciones(nearestById)
    }

    const nearest = Object.values(estaciones).map((estacion) => {
      const distance = L.latLng(center).distanceTo(L.latLng(estacion.lat, estacion.lon))
      return {
        station_id: estacion.station_id,
        distance,
      }
    }).sort((a, b) => a.distance - b.distance).slice(0, 5)
    addRankings(nearest)
  }, [center, estaciones, setNearestEstaciones])

  const isInBounds = (latlng) => {
    const caba = L.latLngBounds(CABA_BOUNDS);
    return caba.contains(latlng);
  }

  return {
    estaciones,
    bicis,
    center,
    setCenter,
    nearestEstaciones,
    backendDead,
    isInBounds,
  };
};

export default useData;
