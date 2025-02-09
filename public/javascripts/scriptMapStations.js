document.addEventListener("DOMContentLoaded", () => {
    let chargingStops = [];
    let chargingMarkers = [];
  
    async function loadVehicles() {
        try {
          console.log('[loadVehicles] Envoi requête GET /api/vehicles...');
          const response = await fetch('https://projet-info802.azurewebsites.net/api/vehicles');
          console.log('[loadVehicles] Status de la réponse :', response.status);
  
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des véhicules.');
          }
  
          const vehicles = await response.json();
          console.log('[loadVehicles] Véhicules récupérés :', vehicles);
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
        const autonomyKm = getVehicleRange(selectedVehicle);
        const batteryKwh = getVehicleBattery(selectedVehicle);
  
        try {
          console.log('[submit] Envoi requête POST /api/simulate-journey', { startAddress, endAddress, autonomyKm, batteryKwh });
          const routeResponse = await fetch('https://projet-info802.azurewebsites.net/api/simulate-journey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startAddress, endAddress, autonomyKm, batteryKwh })
          });
  
          console.log('[submit] Status de la réponse simulate-journey :', routeResponse.status);
      
          if (!routeResponse.ok) {
            throw new Error('Erreur lors de la récupération de l’itinéraire.');
          }
      
          const jsonData = await routeResponse.json();
          console.log('[submit] Données reçues de /simulate-journey :', jsonData);
      
          const { route, stops: chargingStops, totalTime } = jsonData;
          console.log('[submit] route =', route);
          console.log('[submit] chargingStops =', chargingStops);
          console.log('[submit] Temps total estimé =', totalTime, 'heures');
  
          // Décoder la polyline
          const decodedPolyline = polyline.decode(route.routes[0].geometry);
  
          // Supprimer les anciens éléments de la carte
          window.map.eachLayer((layer) => {
              if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                  window.map.removeLayer(layer);
              }
          });
  
          // Affichage du trajet en bleu
          const routeLayer = L.polyline(decodedPolyline, { color: 'blue', weight: 4 }).addTo(window.map);
          window.map.fitBounds(routeLayer.getBounds());
  
          
            // Affichage des bornes de recharge
            chargingStops.forEach(station => {
                const marker = L.marker([station.chosenStation.latitude, station.chosenStation.longitude])
                    .addTo(window.map)
                    .bindPopup(`
                        <strong>${station.chosenStation.name || 'Borne de recharge'}</strong><br>
                        ${station.chosenStation.address || 'Adresse inconnue'}<br>
                        <em>Puissance : ${getStationPower(station.chosenStation)} kW</em><br>
                        <em>Temps de recharge estimé : ${station.rechargeTime.toFixed(2)} h</em>
                    `);
                chargingMarkers.push(marker);
            });

  
          // Affichage du temps total estimé
          document.getElementById('totalTime').innerText = `Temps total estimé : ${totalTime.toFixed(2)} heures`;
  
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
  
  /**
   * Retourne l'autonomie du véhicule en km.
   * 
   * @param {Object} vehicle - L'objet véhicule renvoyé par /vehicles
   * @returns {number} - Autonomie estimée en km
   */
  function getVehicleRange(vehicle) {
      if (vehicle.range?.chargetrip_range?.worst) {
        return vehicle.range.chargetrip_range.worst;
      }
  
      if (vehicle.battery?.usable_kwh) {
        return vehicle.battery.usable_kwh * 5;
      }
  
      return 200; 
  }
  
  /**
   * Retourne la capacité de la batterie en kWh du véhicule.
   * 
   * @param {Object} vehicle - L'objet véhicule renvoyé par /vehicles
   * @returns {number} - Capacité de la batterie en kWh
   */
  function getVehicleBattery(vehicle) {
      if (vehicle.battery?.usable_kwh) {
        return vehicle.battery.usable_kwh;
      }
      return 50; 
  }
  
  /**
   * Retourne la puissance en kW de la borne, si disponible.
   * 
   * @param {Object} station - L'objet station retourné par getChargingStations
   * @returns {number} - Puissance en kW (ex. 50), ou 22 si inconnu
   */
  function getStationPower(station) {
      if (typeof station.power_max === 'number') {
        return station.power_max;
      }
  
      if (typeof station.power_max === 'string' && !isNaN(Number(station.power_max))) {
        return Number(station.power_max);
      }
  
      return 22; 
  }
  
  