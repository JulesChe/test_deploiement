const axios = require('axios');
const { ORS_API_KEY } = require('../../config/env'); // Assurez-vous que votre clé est dans .env

// Fonction pour obtenir un itinéraire
const getRoute = async (coordinates) => {
  const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  try {
    console.log('Envoi de la requête POST à OpenRouteService...');
    const response = await axios.post(apiUrl, { coordinates }, {
      headers: {
        Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: '5b3ce3597851110001cf6248226b37505aa2458ebb5c2891f9a98e08',
      },
    });

    
    // Retourne les données de l'itinéraire
    return response.data;
  } catch (err) {
    console.error('Erreur lors de la récupération de l’itinéraire :', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Response:', err.response.data);
    }
    throw new Error('Impossible de récupérer l’itinéraire. Vérifiez les paramètres et la clé API.');
  }
};

module.exports = { getRoute };
