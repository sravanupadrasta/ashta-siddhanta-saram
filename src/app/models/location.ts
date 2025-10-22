export interface StateConfig {
  id: string;
  name: string;
}

export interface DistrictConfig {
  id: string;
  name: string;
  stateId: string;
  population: number;
  villages: number;
  houses: number;
}

export interface PrimaryHealthCenter {
  id: string;
  name: string;
  address: string;
  districtId: string;
  stateId: string;
  estimatedHouses: number;
  estimatedPopulation: number;
}

export interface VillageConfig {
  id: string;
  name: string;
  phcId: string;
  districtId: string;
  stateId: string;
}
