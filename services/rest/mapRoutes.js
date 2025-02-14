const axios = require('axios');

// Fonction pour obtenir un itinéraire
const getRoute = async (coordinates) => {
  const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  try {
    console.log('Envoi de la requête POST à OpenRouteService...');
    const response = await axios.post(apiUrl, { coordinates }, {
      headers: {
        Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: process.env.ORS_API_KEY,
      },
    });

    
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
