document.addEventListener("DOMContentLoaded", () => {
  let chargingStops = [];
  let chargingMarkers = [];

  async function loadVehicles() {
      try {
        const response = await fetch('https://projet-info802.azurewebsites.net/api/vehicles');
        if (!response.ok) {
              throw new Error('Erreur lors de la récupération des véhicules.');
          }
          const vehicles = await response.json();
          const vehicleSelect = document.getElementById('vehicle');
          vehicleSelect.innerHTML = '';

          vehicles.forEach(vehicle => {
              const option = document.createElement('option');
              option.value = JSON.stringify(vehicle);
              option.textContent = `${vehicle.naming?.make || ''} ${vehicle.naming?.model || ''} (${vehicle.battery?.usable_kwh || 'N/A'} kWh)`;
              vehicleSelect.appendChild(option);
          });
      } catch (error) {
          console.error('Erreur :', error.message);
          alert('Impossible de charger la liste des véhicules.');
      }
  }

  async function loadChargingStations(routeCoordinates) {
      try {
          if (!routeCoordinates || routeCoordinates.length === 0) {
              console.warn("Aucun itinéraire fourni, utilisation des coordonnées par défaut.");
              routeCoordinates = [[45.7640, 4.8357]]; // Coordonnées par défaut (Lyon)
          }

          const lat = routeCoordinates[0][0];
          const lon = routeCoordinates[0][1];
          const response = await fetch(`https://projet-info802.azurewebsites.net/api/charging-stations?lat=${lat}&lon=${lon}`);
          
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des bornes.');
          }
          const stations = await response.json();

          // Supprimer les anciens marqueurs
          chargingMarkers.forEach(marker => window.map.removeLayer(marker));
          chargingMarkers = [];

          stations.forEach(station => {
              const isNearRoute = routeCoordinates.some(([lat, lon]) => 
                  Math.abs(lat - station.latitude) < 0.05 && Math.abs(lon - station.longitude) < 0.05);

              if (isNearRoute) {
                  const marker = L.marker([station.latitude, station.longitude])
                      .addTo(window.map)
                      .bindPopup(`<strong>${station.name || 'Borne de recharge'}</strong><br>${station.address || 'Adresse inconnue'}`);
                  chargingMarkers.push(marker);
              }
          });
      } catch (error) {
          console.error('Erreur :', error.message);
          alert('Impossible de charger les bornes.');
      }
  }

  document.getElementById('routeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      chargingStops = [];

      const startAddress = document.getElementById('start').value.trim();
      const endAddress = document.getElementById('end').value.trim();
      const vehicleStr = document.getElementById('vehicle').value;
      const submitButton = document.getElementById('submitButton');
      const spinner = document.getElementById('spinner');

      if (!startAddress || !endAddress || !vehicleStr) {
          alert('Veuillez remplir tous les champs et sélectionner un véhicule.');
          return;
      }

      submitButton.style.display = 'none';
      spinner.style.display = 'block';

      const selectedVehicle = JSON.parse(vehicleStr);
      if (!selectedVehicle?.battery?.usable_kwh) {
          alert('Véhicule invalide (batterie manquante).');
          submitButton.style.display = 'block';
          spinner.style.display = 'none';
          return;
      }

      try {
        const routeResponse = await fetch('https://projet-info802.azurewebsites.net/api/route-with-stations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startAddress, endAddress })
          });

          if (!routeResponse.ok) {
              throw new Error('Erreur lors de la récupération de l’itinéraire.');
          }

          const { route } = await routeResponse.json();
          const decodedPolyline = polyline.decode(route.routes[0].geometry);

          window.map.eachLayer((layer) => {
              if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                  window.map.removeLayer(layer);
              }
          });

          const routeLayer = L.polyline(decodedPolyline, { color: 'blue', weight: 4 }).addTo(window.map);
          window.map.fitBounds(routeLayer.getBounds());

          loadChargingStations(decodedPolyline);
      } catch (error) {
          console.error('Erreur :', error.message);
          alert('Impossible de calculer l’itinéraire.');
      } finally {
          submitButton.style.display = 'block';
          spinner.style.display = 'none';
      }
  });

  loadVehicles();
});
