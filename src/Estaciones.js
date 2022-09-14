import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
  Box, Collapse, Flex, Heading, Stat,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";
import React from "react";
import { DataContext } from "./Contexts";

function Estacion({ estacion }) {
  const { estaciones } = React.useContext(DataContext);

  return (
    <>
      <Flex direction={'row'} justifyContent="space-between">
        <Stat size="sm" textAlign="left">
          <StatNumber>{estaciones[estacion.station_id].name}</StatNumber>
          <StatHelpText>Estación a {Math.round(estacion.distance, 2)}m</StatHelpText>
        </Stat>

        <Stat size="sm" textAlign="right">
          <StatNumber>10</StatNumber>
          <StatHelpText>Bicicletas</StatHelpText>
        </Stat>

      </Flex>
      <Divider />
    </>
  );
}

function Estaciones() {
  const [expand, setExpand] = React.useState(false)
  const { nearestEstaciones } = React.useContext(DataContext);


  return (
    <Box position="absolute" bottom="0" zIndex={1000} w="100%" bg="orange.50" p={4} rounded="lg" borderTop="2px solid orange">
      <Flex direction={'row'} w="100%" justifyContent="space-between" onClick={() => setExpand(!expand)} cursor="pointer" my={2}>
        <Heading>Estaciones 🚲</Heading>
        {expand ? <ArrowRightIcon transform="rotate(90deg)" boxSize={8} /> : <ArrowLeftIcon transform="rotate(90deg)" boxSize={8} />}
      </Flex>

      <Collapse startingHeight={50} in={expand}>
        {Object.values(nearestEstaciones).sort((a, b) => a.ranking - b.ranking).map((estacion) => (
          <Estacion estacion={estacion} key={estacion.station_id} />))
        }
      </Collapse>
    </Box>
  );
}

export default Estaciones;
