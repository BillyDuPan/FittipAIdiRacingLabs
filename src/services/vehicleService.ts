import { Vehicle } from '../types/Vehicle';

export class VehicleService {
  private static instance: VehicleService;
  private vehicles: Vehicle[] = [];

  private constructor() {
    // Initialize vehicles
    this.loadVehicles();
  }

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  public async loadVehicles(): Promise<Vehicle[]> {
    try {
      console.log('Loading vehicles...');
      const vehiclesModule = await import('../data/vehicles/vehicles.json');
      const vehiclesData = (vehiclesModule as unknown as { vehicles: Vehicle[] }).vehicles;
      
      if (!Array.isArray(vehiclesData)) {
        console.error('Invalid vehicles data format');
        return [];
      }

      this.vehicles = vehiclesData.map(vehicle => ({
        ...vehicle,
        createdAt: new Date().toISOString()
      }));

      console.log(`Loaded ${this.vehicles.length} vehicles`);
      return this.vehicles;
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      return [];
    }
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(vehicle => vehicle.id === id);
  }
} 