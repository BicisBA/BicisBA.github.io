import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <MapContainer
        center={{ lat: -34.6037, lng: -58.3816 }} // Obelisco
        zoom={15}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[-34.6037, -58.3816]}>
          <Popup>
            Obelisco!
          </Popup>
        </Marker>
      </MapContainer>
    </ChakraProvider>
  );
}

export default App;
