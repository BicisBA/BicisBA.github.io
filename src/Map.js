import React, { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-easybutton/src/easy-button.js";
import "leaflet-easybutton/src/easy-button.css";
import L from "leaflet";
import "font-awesome/css/font-awesome.min.css";

function LeafletPlugins() {
  const map = useMap();

  // Search Bar
  useEffect(() => {
    if (!map) return

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      searchLabel: 'Dirección',
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  // Locate-me button
  useEffect(() => {
    if (!map) return

    const btn = L.easyButton("fa-crosshairs", () => {
      map.locate().on("locationfound", function (e) {
        map.flyTo(e.latlng, map.getZoom());
      });
    });
    map.addControl(btn);
    return () => map.removeControl(btn);
  }, [map]);

  // TO DO: Refresh estaciones button

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
      <LeafletPlugins />

    </MapContainer>
  );
}

export default Map;
