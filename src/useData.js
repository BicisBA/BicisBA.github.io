import React, { useEffect } from "react";
import L from "leaflet";
import { BACKEND, OBELISCOU } from "./Constants";

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
  const [bicis, setBicis] = React.useState({})
  const [center, setCenter] = React.useState(OBELISCOU);

  useEffect(() => {
    const fetchStationInformation = async () => {
      const stationsById = await getBackend('stations')
      setEstaciones(stationsById)
    }
    fetchStationInformation()
  }, [])

  useEffect(() => {
    const fetchBicis = async () => {
      const bicisByStationId = await getBackend('stations/status')
      setBicis(bicisByStationId)
    }
    fetchBicis()
    // We call it on boot, and then set a timer to call it every 30 seconds
    const interval = setInterval(fetchBicis, 30000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    const addRankings = async (nearest) => {
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
          user_eta,
          eta: bike_eta >= user_eta ? bike_eta - user_eta : user_eta,
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

  return {
    estaciones,
    bicis,
    center,
    setCenter,
    nearestEstaciones,
  };
};

export default useData;
