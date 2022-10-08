import React, { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-easybutton/src/easy-button.js";
import "leaflet-easybutton/src/easy-button.css";
import L, { Point } from "leaflet";
import "font-awesome/css/font-awesome.min.css";
import { DataContext } from "./Contexts";
import { Text, useToast } from "@chakra-ui/react";

import './styles.css'
import { CABA_BOUNDS, OBELISCOU } from "./Constants";

function LeafletPlugins() {
  const map = useMap();
  const toast = useToast()
  const id = 'non-caba-toast'

  const { setCenter } = React.useContext(DataContext);

  const changeCenter = React.useCallback((latlng) => {
    const caba = L.latLngBounds(CABA_BOUNDS);
    if (caba.contains(latlng)) {
      setCenter(latlng);
      return true
    } else {
      if (!toast.isActive(id)) {
        toast({
          id,
          isClosable: true,
          status: 'warning',
          description: 'Perdón, el servicio de ecobici solo esta disponible en CABA.\nQuejate con Larreta!',
        })
      }
      return false
    }
  }, [setCenter, toast]);

  const followUser = React.useCallback(() => {
    map.locate({
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 15000,
    }).once("locationfound", (e) => {
      map.flyTo(e.latlng, 16);
    }).on('locationfound', (e) => {
      changeCenter(e.latlng)
    })
  }, [map, changeCenter]);

  const stopFollowingUser = React.useCallback(() => {
    map.stopLocate().off('locationfound')
  }, [map]);

  // On boot, we follow the user
  useEffect(() => {
    followUser(map)
  }, [followUser, map])

  // Search Bar
  useEffect(() => {
    if (!map) return

    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: 'ar',
      }
    });
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      searchLabel: 'Dirección',
      updateMap: false,
    });

    map.addControl(searchControl);
    map.on('geosearch/showlocation', function (e) {
      if (changeCenter({ lat: e.location.y, lng: e.location.x })) {
        map.flyTo({ lat: e.location.y, lng: e.location.x }, 16);
        stopFollowingUser()
      };
    });
    return () => { map.removeControl(searchControl); map.off('geosearch/showlocation'); }
  }, [map, changeCenter, stopFollowingUser]);

  // Locate-me button
  useEffect(() => {
    if (!map) return
    const btn = L.easyButton("fa-crosshairs", () => {
      followUser()
    });
    map.addControl(btn);
    return () => map.removeControl(btn);
  }, [map, followUser]);

  // Set location on tap+hold (mobile) and right-click (desktop)
  useEffect(() => {
    if (!map) return

    map.on('contextmenu', (e) => {
      if (changeCenter(e.latlng)) {
        stopFollowingUser()
      }
    });

    return () => { map.off('contextmenu'); }// map.off('mousedown'); map.off('mouseup') };
  }, [map, changeCenter, stopFollowingUser]);

  // TO DO: Refresh estaciones button

  return null;
}

function Map() {
  const { estaciones, center, setCenter, nearestEstaciones, bicis } = React.useContext(DataContext);

  const BiciIconGen = (n) => new L.DivIcon({
    // Recibir ranking por parametro y cambiar el border color en base a eso
    iconSize: [55, 40],
    className: 'bici-icon',
    html: `
      <span>${n}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path d="M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h25.7l34.6 64H222.9l-27.4-38C191 99.7 183.7 96 176 96H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h43.7l22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112h49c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32H312zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368h65c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1H166.8zm90.6-128H365.9L317 274.8 257.4 192z" />
      </svg>
    `
  })

  return (
    <MapContainer
      center={OBELISCOU}
      maxBounds={CABA_BOUNDS}
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
        const icon = BiciIconGen(bicis_disponibles)
        const offset = new Point(0, -5)
        return (<Marker
          icon={icon}
          opacity={Object.keys(nearestEstaciones).includes(estacion.station_id) ? 1 : 0.4}
          position={[estacion.lat, estacion.lon]} key={estacion.station_id}>
          <Popup closeButton={false} offset={offset}>
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
