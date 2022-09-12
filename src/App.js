import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import Map from './Map';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Map />
    </ChakraProvider>
  );
}

export default App;
