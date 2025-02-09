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
  
  /**
 * Calcule le temps (en heures) pour recharger à 100% une batterie
 * de 'batteryKwh' kWh sur une borne de 'stationPower' kW
 * 
 * @param {number} batteryKwh - Capacité de la batterie en kWh
 * @param {number} stationPower - Puissance de la borne en kW
 * @returns {number} - Temps de recharge en heures (ex. 1.5)
 */
function calculateChargeTime(batteryKwh, stationPower) {
    if (stationPower <= 0) {
      return 2;
    }
    return batteryKwh / stationPower;
  }
  