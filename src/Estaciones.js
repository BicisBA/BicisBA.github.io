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
  Link,
} from "@chakra-ui/react";
import React from "react";
import { RESULTS } from "./Constants";
import { DataContext } from "./Contexts";

function Result({ station_id }) {
  const { nearestEstaciones } = React.useContext(DataContext);
  const { color, probability, eta } = nearestEstaciones[station_id]

  return (
    <Popover placement="bottom-start" trigger="hover" strategy="fixed">
      <PopoverTrigger>
        <Badge colorScheme={color} cursor="pointer">{RESULTS[color].badgeText}</Badge>
      </PopoverTrigger>
      <PopoverContent width="fit-content" textAlign="center" borderWidth="2px" borderColor="brown.500" bg="brown.50">
        <PopoverArrow bg="brown.500" />
        {color !== 'green' && (
          <PopoverHeader>
            Te conviene salir en <strong>{Math.round(eta, 1)} {Math.round(eta, 1) === 1 ? 'minuto' : 'minutos'}</strong>
          </PopoverHeader>
        )}

        <PopoverBody px={2} py={1}>
          Hay un <strong>{Math.round(probability * 100, 2)}%</strong> de chances de que consigas
          <br />
          una bici saliendo ahora
        </PopoverBody>
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
      <Flex px={4} direction={'row'} justifyContent="space-between" my={1}>
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

  const spaceBar = React.useCallback(
    (event) => {
      if (event.target.tagName.toLowerCase() === 'input') {
        return
      }
      if (event.keyCode === 32) {
        setExpand(!expand);
      }
    },
    [expand]
  );

  React.useEffect(() => {
    document.addEventListener("keydown", spaceBar, false);

    return () => {
      document.removeEventListener("keydown", spaceBar, false);
    };
  }, [spaceBar]);

  return (
    <Box position="absolute" color="black" bottom="0" zIndex={1000} w="100%" bg="brown.50" pt={4} rounded="lg" borderTop="2px solid" borderColor="brown.400">
      <Flex direction={'row'} w="100%" justifyContent="space-between" onClick={() => setExpand(!expand)} cursor="pointer" my={2}>
        <Heading ml={4}>
          Estaciones
          <Icon viewBox="0 0 640 512" ml={2}>
            <path fill="currentColor" d="M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h25.7l34.6 64H222.9l-27.4-38C191 99.7 183.7 96 176 96H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h43.7l22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112h49c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32H312zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368h65c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1H166.8zm90.6-128H365.9L317 274.8 257.4 192z" />
          </Icon>
        </Heading>
        {expand ? <ArrowRightIcon mr={4} transform="rotate(90deg)" boxSize={8} /> : <ArrowLeftIcon mr={4} transform="rotate(90deg)" boxSize={8} />}
      </Flex>

      <Collapse startingHeight={62} in={expand}>
        {Object.values(nearestEstaciones).sort((a, b) => {
          const groupOrder = ['green', 'yellow', 'red']
          if (a.color === b.color) {
            return a.distance - b.distance
          }
          return groupOrder.indexOf(a.color) - groupOrder.indexOf(b.color)
        }).map(({ station_id }) => (
          <Estacion station_id={station_id} key={station_id} />
        ))}
        <Flex mr={4} justifyContent="flex-end">
          <Link isExternal={true} href="https://github.com/BicisBA/BicisBA.github.io">
            <Icon my={1} color="brown.600" boxSize={7} viewBox="0 0 496 512">
              <path
                fill="currentColor"
                d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
            </Icon>
          </Link>
        </Flex>
      </Collapse>
    </Box>
  );
}

export default Estaciones;
