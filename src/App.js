import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import Map from './Map';
import Estaciones from './Estaciones';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Map />
      <Estaciones />
    </ChakraProvider>
  );
}

export default App;
