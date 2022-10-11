import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
  Box, Collapse, Flex, Heading, Stat,
  StatNumber,
  StatHelpText,
  Divider,
  Icon,
  Badge,
  PopoverBody,
  Popover,
  PopoverArrow,
  PopoverHeader,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import React from "react";
import { RESULTS } from "./Constants";
import { DataContext } from "./Contexts";

function Result({ station_id }) {
  const { nearestEstaciones } = React.useContext(DataContext);
  const { color, probability, eta } = nearestEstaciones[station_id]

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <Badge colorScheme={color} cursor="pointer">{RESULTS[color].badgeText}</Badge>
      </PopoverTrigger>
      <PopoverContent width="fit-content" textAlign="center" borderWidth="2px" borderColor="gray.500" bg="gray.50">
        <PopoverArrow bg="gray.500" />
        <PopoverHeader>
          Hay un <strong>{Math.round(probability * 100, 2)}%</strong> de chances de que consigas
          <br />
          una bici cuando llegues a la estación
        </PopoverHeader>
        {color !== 'green' && (<PopoverBody>
          Nuestro algoritmo dice que te conviene salir en
          <br />
          <strong>{Math.round(eta, 1)} minutos</strong> a esta estación
        </PopoverBody>)}
      </PopoverContent>
    </Popover >
  )
}

function Estacion({ station_id }) {
  const { estaciones, bicis, nearestEstaciones } = React.useContext(DataContext);
  const estacion = estaciones[station_id];
  const bicis_disponibles = bicis[station_id]?.num_bikes_available

  return (
    <>
      <Flex direction={'row'} justifyContent="space-between" my={1}>
        <Stat size="sm" textAlign="left">
          <StatNumber>{estacion.name.split('-')[1]}</StatNumber>
          <StatHelpText m={0}>Estación a {Math.round(nearestEstaciones[station_id].distance, 2)} metros</StatHelpText>
        </Stat>

        {!isNaN(bicis_disponibles) && <Stat size="sm" textAlign="right">
          <Result station_id={station_id} />
          <StatHelpText m={0}><strong>{bicis_disponibles} </strong>{bicis_disponibles === 1 ? 'bicicleta' : 'bicicletas'} ahora mismo</StatHelpText>
        </Stat>}
      </Flex>
      <Divider />
    </>
  );
}

function Estaciones() {
  const [expand, setExpand] = React.useState(false)
  const { nearestEstaciones } = React.useContext(DataContext);

  return (
    <Box position="absolute" bottom="0" zIndex={1000} w="100%" bg="gray.50" p={4} rounded="lg" borderTop="2px solid" borderColor="gray.400">
      <Flex direction={'row'} w="100%" justifyContent="space-between" onClick={() => setExpand(!expand)} cursor="pointer" my={2}>
        <Heading display="flex">
          Estaciones
          <Icon viewBox="0 0 640 512" ml={2}>
            <path fill="currentColor" d="M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h25.7l34.6 64H222.9l-27.4-38C191 99.7 183.7 96 176 96H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h43.7l22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112h49c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32H312zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368h65c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1H166.8zm90.6-128H365.9L317 274.8 257.4 192z" />
          </Icon>
        </Heading>
        {expand ? <ArrowRightIcon transform="rotate(90deg)" boxSize={8} /> : <ArrowLeftIcon transform="rotate(90deg)" boxSize={8} />}
      </Flex>

      <Collapse startingHeight={50} in={expand}>
        {Object.values(nearestEstaciones).map(({ station_id }) => (
          <Estacion station_id={station_id} key={station_id} />
        ))}
      </Collapse>
    </Box>
  );
}

export default Estaciones;
