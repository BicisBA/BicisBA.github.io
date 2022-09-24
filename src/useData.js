import React, { useEffect } from "react";
import stationStatusMock from './mocks/stationStatus.json'
import stationInformationMock from './mocks/stationInformation.json'
import L from "leaflet";

// const API_TRANSPORTE_BASE_URL = 'https://apitransporte.buenosaires.gob.ar/ecobici/gbfs'
// const API_TRANSPORTE_CLIENT_ID = 'xxx'
// const API_TRANSPORTE_SECRET = 'xxx'

const getAPITransporte = async (endpoint) => {
  // const res = fetch(
  //   `${API_TRANSPORTE_BASE_URL}/${endpoint}?` + new URLSearchParams({
  //     client_id: API_TRANSPORTE_CLIENT_ID,
  //     client_secret: [API_TRANSPORTE_SECRET]
  //   })
  // );
  // return res.json()
  if (endpoint === 'stationInformation') {
    return stationInformationMock
  }
  if (endpoint === 'stationStatus') {
    return stationStatusMock
  }
}

const fetchAPITransporte = async (endpoint) => {
  const info = await getAPITransporte(endpoint)
  const byStationId = info.data.stations.reduce((acc, station) => {
    acc[station.station_id] = station
    return acc
  }, {})
  return byStationId
}


const useData = () => {
  const [estaciones, setEstaciones] = React.useState({})
  const [nearestEstaciones, setNearestEstaciones] = React.useState({})
  const [bicis, setBicis] = React.useState({})
  const [geoLoading, setGeoLoading] = React.useState(true)
  const [geoAllowed, setGeoAllowed] = React.useState("prompt")
  const [center, setCenter] = React.useState({ lat: -34.6037, lng: -58.3816 }); // Obeliscou

  useEffect(() => {
    const fetchStationInformation = async () => {
      const stationsById = await fetchAPITransporte('stationInformation')
      setEstaciones(stationsById)
    }
    fetchStationInformation()
  }, [])

  useEffect(() => {
    const fetchBicis = async () => {
      const bicisByStationId = await fetchAPITransporte('stationStatus')
      setBicis(bicisByStationId)
    }
    fetchBicis() // We call it on boot, and then set a timer to call it every 30 seconds
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

  useEffect(() => {
    const askGeoLocation = async () => {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setGeoAllowed(result.state);
      result.addEventListener('change', () => {
        setGeoAllowed(result.state);
      });
    }
    askGeoLocation()
    setGeoLoading(false)
  }, [])


  return {
    estaciones,
    bicis,
    center,
    setCenter,
    nearestEstaciones,
    geoAllowed,
    geoLoading
  };
};

export default useData;
