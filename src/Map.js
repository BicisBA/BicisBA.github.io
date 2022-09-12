import React, { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

function LeafletgeoSearch() {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      searchLabel: 'Dirección',
    });
    map.addControl(searchControl);
    // Actualizar lista de estaciones que se muestran en el drawer
    // - cuando se elige un search result // - cuando se mueve el mapaks
    // map.on('geosearch/showlocation', yourEventHandler);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}

function Map() {
  return (
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
      <LeafletgeoSearch />

    </MapContainer>
  );
}

export default Map;
