const express = require('express');
const { getChargingStations } = require('./rest/chargingService');
const { getRoute } = require('./rest/mapRoutes')
const { getVehicles } = require('./GraphQL/vehicleRoute')
const { geocodeAddress } = require('./rest/geocodeRoute')
const polyline = require('@mapbox/polyline');

const router = express.Router();


/**
 * @swagger
 * /geocode:
 *   get:
 *     summary: Géocoder une adresse en coordonnées géographiques.
 *     description: Retourne les coordonnées géographiques (latitude et longitude) pour une adresse donnée.
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         description: L'adresse à géocoder.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "10 Downing Street, London"
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       example: 51.503364
 *                     lon:
 *                       type: number
 *                       example: -0.127625
 *       400:
 *         description: Adresse non fournie.
 *       500:
 *         description: Erreur serveur.
 */
// Route pour géocoder une adresse
router.get('/geocode', async (req, res) => {
  const { address } = req.query;

  // Vérifier si l'adresse est fournie
  if (!address) {
    return res.status(400).json({ error: 'Une adresse est requise pour le géocodage.' });
  }

  try {
    // Appeler la fonction de géocodage
    const coordinates = await geocodeAddress(address);

    // Retourner les coordonnées géographiques
    res.json({ address, coordinates });
  } catch (error) {
    console.error('Erreur lors du géocodage :', error.message);
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /charging-stations:
 *   get:
 *     summary: Récupérer les bornes de recharge proches d'une position.
 *     description: Retourne une liste de bornes de recharge situées dans un rayon autour des coordonnées fournies.
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         description: Latitude de la position de recherche.
 *         schema:
 *           type: number
 *           example: 45.764043
 *       - in: query
 *         name: lon
 *         required: true
 *         description: Longitude de la position de recherche.
 *         schema:
 *           type: number
 *           example: 4.835659
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   operator:
 *                     type: string
 *                   address:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *       400:
 *         description: Coordonnées non fournies.
 *       500:
 *         description: Erreur serveur.
 */

// Route pour récupérer les bornes de recharge
router.get('/charging-stations', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const stations = await getChargingStations(lat, lon);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /route:
 *   post:
 *     summary: Calculer un itinéraire entre deux points.
 *     description: Retourne les détails d'un itinéraire basé sur des coordonnées géographiques.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coordinates:
 *                 type: array
 *                 description: Tableau de points de départ et d'arrivée [longitude, latitude].
 *                 example: [[4.835659, 45.764043], [2.3522219, 48.856614]]
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Coordonnées invalides.
 *       500:
 *         description: Erreur serveur.
 */

// Route pour calculer un itinéraire
router.post('/route', async (req, res) => {
  const { coordinates } = req.body;
  console.log(coordinates)

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return res.status(400).json({ error: 'Les coordonnées doivent être un tableau de points [longitude, latitude].' });
  }

  try {
    const route = await getRoute(coordinates);
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Obtenir une liste de véhicules avec leurs caractéristiques.
 *     description: Retourne une liste de véhicules électriques avec des informations détaillées.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Numéro de la page à récupérer.
 *         schema:
 *           type: integer
 *           example: 0
 *       - in: query
 *         name: size
 *         required: false
 *         description: Nombre de véhicules par page.
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Terme de recherche pour filtrer les véhicules.
 *         schema:
 *           type: string
 *           example: "Tesla"
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   naming:
 *                     type: object
 *                     properties:
 *                       make:
 *                         type: string
 *                       model:
 *                         type: string
 *                       chargetrip_version:
 *                         type: string
 *                   media:
 *                     type: object
 *                     properties:
 *                       image:
 *                         type: object
 *                         properties:
 *                           thumbnail_url:
 *                             type: string
 *       500:
 *         description: Erreur serveur.
 */
router.get('/vehicles', async (req, res) => {
  const { page = 0, size = 10, search = '' } = req.query; 

  try {
    const vehicles = await getVehicles({ page: Number(page), size: Number(size), search });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/**
 * @swagger
 * /route-with-stations:
 *   post:
 *     summary: Calculer un itinéraire avec des stations de recharge.
 *     description: Calcule un itinéraire entre deux adresses et retourne les bornes de recharge sur le trajet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startAddress:
 *                 type: string
 *                 example: "10 Downing Street, London"
 *               endAddress:
 *                 type: string
 *                 example: "Eiffel Tower, Paris"
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 route:
 *                   type: object
 *                   description: Les détails de l'itinéraire.
 *                 stations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       city:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *       400:
 *         description: Adresses invalides ou manquantes.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/route-with-stations', async (req, res) => {
  const { startAddress, endAddress } = req.body;

  if (!startAddress || !endAddress) {
    return res.status(400).json({ error: 'Les adresses de départ et d’arrivée sont requises.' });
  }

  try {
    // Convertir les adresses en coordonnées avec geocoding
    const [startCoords, endCoords] = await Promise.all([
      geocodeAddress(startAddress),
      geocodeAddress(endAddress),
    ]);


   const formattedCoordinates = [
  [startCoords.lon, startCoords.lat],
  [endCoords.lon, endCoords.lat],
];

    if (!startCoords || !endCoords) {
      return res.status(400).json({ error: 'Impossible de géocoder les adresses fournies.' });
    }

    // Calculer l'itinéraire entre les deux coordonnées
    const route = await getRoute(formattedCoordinates);

    // Extraire les coordonnées de l'itinéraire
    const decodedPolyline = polyline.decode(route.routes[0].geometry);

    // Récupérer les stations proches des points de l'itinéraire
    const stationsPromises = decodedPolyline.map(async ([lat, lon]) => {
      return await getChargingStations(lat, lon);
    });

    // Attendre toutes les réponses des stations
    const stationsResults = await Promise.all(stationsPromises);

    // Fusionner et dédupliquer les bornes
    const allStations = stationsResults.flat();
    const uniqueStations = allStations.filter(
      (station, index, self) => index === self.findIndex((s) => s.id === station.id)
    );

    res.json({ route, stations: uniqueStations });
  } catch (error) {
    console.error('Erreur lors de la récupération des bornes sur l’itinéraire :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des bornes sur l’itinéraire.' });
  }
});


/**
 * @swagger
 * /calculate-travel-time:
 *   post:
 *     summary: Calcul du temps de trajet avec arrêts recharge
 *     description: Retourne le temps total du trajet en tenant compte de l'autonomie et du temps de charge du véhicule.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               distance:
 *                 type: number
 *                 example: 550
 *               autonomy:
 *                 type: number
 *                 example: 200
 *               chargeTime:
 *                 type: number
 *                 example: 0.5
 *     responses:
 *       200:
 *         description: Temps total du trajet calculé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTime:
 *                   type: number
 *                   example: 6.5
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/calculate-travel-time', (req, res) => {
  const { distance, autonomy, chargeTime } = req.body;

  if (!distance || !autonomy || !chargeTime) {
      return res.status(400).json({ error: 'Les paramètres distance, autonomy et chargeTime sont requis.' });
  }

  try {
      // Vitesse moyenne du véhicule (en km/h)
      const averageSpeed = 100.0;

      // Nombre d'arrêts de recharge nécessaires (on ne recharge pas avant de partir)
      const stops = Math.max(Math.ceil(distance / autonomy) - 1, 0);

      // Temps de conduite (distance / vitesse)
      const drivingTime = distance / averageSpeed;

      // Temps total de recharge
      const totalChargeTime = stops * chargeTime;

      // Temps total du trajet
      const totalTime = drivingTime + totalChargeTime;

      res.json({ totalTime: totalTime.toFixed(2) });
  } catch (error) {
      console.error('Erreur lors du calcul du trajet:', error);
      res.status(500).json({ error: 'Erreur lors du calcul du temps de trajet' });
  }
});


module.exports = router;
