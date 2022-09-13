import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import Map from './Map';
import Estaciones from './Estaciones';
import useData from "./useData";
import { DataContext } from "./Contexts"

function App() {
  const dataHook = useData();
  return (
    <DataContext.Provider value={dataHook}>
      <ChakraProvider theme={theme}>
        <Map />
        <Estaciones />
      </ChakraProvider>
    </DataContext.Provider>
  );
}

export default App;
