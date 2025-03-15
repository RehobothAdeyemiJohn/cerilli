
import { Vehicle, Filter } from '@/types';

export const filterVehicles = (vehicles: Vehicle[], filters: Filter): Vehicle[] => {
  return vehicles.filter(vehicle => {
    if (filters.models.length > 0 && !filters.models.includes(vehicle.model)) {
      return false;
    }
    
    if (filters.trims.length > 0 && !filters.trims.includes(vehicle.trim)) {
      return false;
    }
    
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuelType)) {
      return false;
    }
    
    if (filters.colors.length > 0 && !filters.colors.includes(vehicle.exteriorColor)) {
      return false;
    }
    
    if (filters.locations.length > 0 && !filters.locations.includes(vehicle.location)) {
      return false;
    }
    
    if (filters.dealers && filters.dealers.length > 0 && !filters.dealers.includes(vehicle.reservedBy)) {
      return false;
    }
    
    if (filters.status.length > 0 && !filters.status.includes(vehicle.status)) {
      return false;
    }
    
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchTerm = filters.searchText.toLowerCase();
      const vehicleValues = [
        vehicle.model,
        vehicle.trim,
        vehicle.fuelType,
        vehicle.exteriorColor,
        vehicle.location,
        vehicle.telaio,
        ...vehicle.accessories
      ].map(val => String(val).toLowerCase());
      
      const matchesSearch = vehicleValues.some(val => val.includes(searchTerm));
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  });
};
