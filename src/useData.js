import React, { useEffect } from "react";
import stationStatusMock from './mocks/stationStatus.json'
import stationInformationMock from './mocks/stationInformation.json'

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
  const [topEstaciones, setTopEstaciones] = React.useState([])

  useEffect(() => {
    const fetchStationInformation = async () => {
      const stationInformation = await getAPITransporte('stationInformation')
      setEstaciones(stationInformation.data.stations)
    }
    fetchStationInformation()
  }, [])

  useEffect(() => {
    // TODO: Update topEstaciones con un KNN de walking distance
    setTopEstaciones(estaciones.slice(0, 10))
  }, [center, estaciones, setTopEstaciones])

  return {
    estaciones,
    center,
    setCenter,
    topEstaciones,
  };
};

export default useData;
