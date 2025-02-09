const axios = require('axios');

const geocodeAddress = async (address) => {
  const apiUrl = 'https://api.openrouteservice.org/geocode/search';
  const apiKey = '5b3ce3597851110001cf6248226b37505aa2458ebb5c2891f9a98e08';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        api_key: apiKey,
        text: address,
      },
    });

    if (response.data.features && response.data.features.length > 0) {
      const { coordinates } = response.data.features[0].geometry;
      return { lon: coordinates[0], lat: coordinates[1] };
    } else {
      throw new Error(`Aucune coordonnée trouvée pour l'adresse : ${address}`);
    }
  } catch (error) {
    console.error('Erreur lors du géocodage :', error.message);
    throw new Error(`Impossible de géocoder l'adresse : ${address}`);
  }
};

module.exports = { geocodeAddress };
