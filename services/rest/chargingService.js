const axios = require('axios');
const { CHARGING_STATIONS_API } = require('../../config/env');

const getChargingStations = async (latitude, longitude, initialRadius = 20000) => {
  let radius = initialRadius; // Rayon initial en mètres
  let stations = [];

  while (stations.length === 0 && radius <= 50000) { // Augmenter jusqu'à 50 km si nécessaire
    const apiUrl = `${CHARGING_STATIONS_API}&geofilter.distance=${latitude},${longitude},${radius}`;

    try {
      const response = await axios.get(apiUrl);

      // Formatage des données récupérées
      stations = response.data.records.map((record) => {
        const fields = record.fields;
        return {
          id: fields.id_station || 'Unknown ID', // ID de la station
          name: fields.n_station || 'Unknown Station', // Nom de la station
          operator: fields.n_operateur || 'Unknown Operator', // Nom de l'opérateur
          accessibility: fields.accessibilite || 'Unknown Accessibility', // Accessibilité
          address: fields.ad_station || 'Unknown Address', // Adresse
          city: fields.n_enseigne || 'Unknown City', // Ville ou enseigne
          region: fields.region || 'Unknown Region', // Région
          latitude: fields.ylatitude || null, // Latitude
          longitude: fields.xlongitude || null, // Longitude
          charging_type: fields.type_prise || 'Unknown', 
          power_max: fields.puiss_max || 'Unknown', 
          distance: fields.dist ? `${parseFloat(fields.dist).toFixed(2)} m` : 'Unknown Distance', 
        };
      });
    } catch (error) {
      console.error(`Error fetching charging stations (radius: ${radius}m):`, error.message);
      throw new Error('Failed to fetch charging stations.');
    }

    radius += 5000; // Augmenter le rayon de 5 km à chaque itération
  }

  return stations;
};

module.exports = { getChargingStations };