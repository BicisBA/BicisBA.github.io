import React, { useEffect } from "react";
import stationStatusMock from './mocks/stationStatus.json'
import stationInformationMock from './mocks/stationInformation.json'
import L from "leaflet";

const API_TRANSPORTE_BASE_URL = 'https://apitransporte.buenosaires.gob.ar/ecobici/gbfs'
const API_TRANSPORTE_CLIENT_ID = 'xxx'
const API_TRANSPORTE_SECRET = 'xxx'

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

const useData = () => {
  const [estaciones, setEstaciones] = React.useState([])
  const [center, setCenter] = React.useState({ lat: -34.6037, lng: -58.3816 }); // Obeliscou
  const [nearestEstaciones, setNearestEstaciones] = React.useState([])

  useEffect(() => {
    const fetchStationInformation = async () => {
      const stationInformation = await getAPITransporte('stationInformation')
      const stationsById = stationInformation.data.stations.reduce((acc, station) => {
        acc[station.station_id] = station
        return acc
      }, {})
      setEstaciones(stationsById)
    }
    fetchStationInformation()
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
    }
    ).sort((a, b) => a.distance - b.distance).slice(0, 7)

    const nearestById = nearest.reduce((acc, station) => {
      acc[station.station_id] = station
      return acc
    }, {})

    setNearestEstaciones(nearestById)
  }, [center, estaciones, setNearestEstaciones])

  return {
    estaciones,
    center,
    setCenter,
    nearestEstaciones,
  };
};

export default useData;
