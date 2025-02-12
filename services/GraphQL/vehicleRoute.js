const axios = require('axios');
const { VEHICLE_API_KEY } = require('../../config/env');



const GRAPHQL_ENDPOINT = 'https://api.chargetrip.io/graphql';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-client-id': '67ab59ed4802aaa070546d8c', 
  'x-app-id': '67ab59ed4802aaa070546d8e',
};

// Fonction pour récupérer la liste des véhicules
const getVehicles = async ({ page, size, search }) => {
    const query = `query vehicleList($page: Int, $size: Int, $search: String) {
        vehicleList(
          page: $page,
          size: $size,
          search: $search,
        ) {
          id
          naming {
            make
            model
            chargetrip_version
          }
          media {
            image {
              thumbnail_url
            }
          }
          battery {
            usable_kwh
          }
          range {
            chargetrip_range {
              best
              worst
            }
          }
        }
      }`;
      

  const variables = {
    page,
    size,
    search,
  };

  try {
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      { headers: HEADERS }
    );


    return response.data.data.vehicleList;
  } catch (error) {
    console.error('Erreur lors de la requête GraphQL:', error.message);
    throw new Error('Impossible de récupérer la liste des véhicules.');
  }
};

module.exports = { getVehicles };
