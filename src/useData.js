import React, { useEffect } from "react";
import L from "leaflet";
import { BACKEND, OBELISCOU } from "./Constants";

const fecthBackend = async (endpoint) => {
  const data = await fetch(`${BACKEND}/${endpoint}`);
  const stations = await data.json();
  const byStationId = stations.reduce((acc, station) => {
    acc[station.station_id] = station
    return acc
  }, {})
  return byStationId
}


const useData = () => {
  const [estaciones, setEstaciones] = React.useState({})
  const [nearestEstaciones, setNearestEstaciones] = React.useState({})
  const [bicis, setBicis] = React.useState({})
  const [center, setCenter] = React.useState(OBELISCOU);

  useEffect(() => {
    const fetchStationInformation = async () => {
      const stationsById = await fecthBackend('stations')
      setEstaciones(stationsById)
    }
    fetchStationInformation()
  }, [])

  useEffect(() => {
    const fetchBicis = async () => {
      const bicisByStationId = await fecthBackend('stations/status')
      setBicis(bicisByStationId)
    }
    fetchBicis()
    // We call it on boot, and then set a timer to call it every 30 seconds
    const interval = setInterval(fetchBicis, 30000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    const nearest = Object.values(estaciones).map((estacion) => {
      const distance = L.latLng(center).distanceTo(L.latLng(estacion.lat, estacion.lon))

      // Ideally we would ping a service like OSRM to get the walking duration between two points
      // However, OSRM free server only computes driving duration, and there's no free walking duration service
      // We compute the walking duration, assuming a walking speed of 5km/h (average human speed, with dubious sources)
      const duration = (estacion.distance / 1000) * 60 / 5

      // TODO: compute ranking based on available bikes!
      const ranking = distance

      return {
        station_id: estacion.station_id,
        distance,
        duration,
        ranking
      }
    }).sort((a, b) => a.distance - b.distance).slice(0, 7)

    const nearestById = nearest.reduce((acc, station) => {
      acc[station.station_id] = station
      return acc
    }, {})

    setNearestEstaciones(nearestById)
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
