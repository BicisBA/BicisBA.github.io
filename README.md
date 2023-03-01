# [BicisBA.github.io](https://bicisba.github.io/)

Predictor de disponibilidad de bicis de la Ciudad de Buenos Aires

This repo contains the front web client of [BicisBA](https://github.com/BicisBA), a project that consists of predicting the best rental bike station to go to while you on the move.

The web app predicts on which of your nearest stations you have the best chance of finding a bike for you to ride.

The stations are classified in three categories

- Green: your safest bet
- Yellow: tread lightly
- Red: not recommended

![](./screenshots/classic.png)

Apart from their color, each station provides a little bit more of information: if not now, when is the best time for me to go to this station?

![](./screenshots/drawer.png)

---

This client is built on React and uses the [Chakra-UI](https://chakra-ui.com/) component library.

```bash
# Run it on localhost:3000
## Dockerized
make
## Locally
npm install
npm start
```
