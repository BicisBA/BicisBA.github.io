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
import { DataContext } from "./Contexts";
import { Text } from "@chakra-ui/react";

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
  const { estaciones, center, setCenter, nearestEstaciones, bicis } = React.useContext(DataContext);

  return (
    <MapContainer
      center={{ lat: -34.6037, lng: -58.3816 }} // Obelisco
      maxBounds={[[-34.524197, -58.552391], [-34.715765, -58.265415]]} // A manopla
      maxBoundsViscosity={0.9}
      zoom={17}
      minZoom={13}
      maxZoom={18}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.values(estaciones).map((estacion) => {
        const bicis_disponibles = bicis[estacion.station_id].num_bikes_available
        return (<Marker
          opacity={Object.keys(nearestEstaciones).includes(estacion.station_id) ? 1 : 0.4}
          position={[estacion.lat, estacion.lon]} key={estacion.station_id}>
          <Popup closeButton={false}>
            <Text textAlign={'center'}>
              <strong>{estacion.name} </strong>
              <br />
              <strong>{bicis_disponibles}</strong> {bicis_disponibles === 1 ? 'bici' : 'bicis'}
            </Text>
          </Popup>
        </Marker>)
      })}
      <Marker position={center} draggable={true}
        eventHandlers={{
          moveend: (e) => {
            setCenter(e.target.getLatLng());
          },
        }}
      >
      </Marker>
      <LeafletPlugins />

    </MapContainer>
  );
}

export default Map;
