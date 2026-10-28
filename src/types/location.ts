export interface LocationData {
  latitude: number;
  longitude: number;
  cityName: string;
  subLocality?: string;
  fullAddress: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  accuracy: number; // in meters
  altitude?: number; // in meters
  speed?: number; // in m/s
  provider: 'gps' | 'fused' | 'network' | 'mock';
  timestamp: number;
  isRealDeviceGps?: boolean;
}

export interface PresetLocation {
  id: string;
  title: string;
  subtitle: string;
  category: 'college' | 'district';
  latitude: number;
  longitude: number;
  cityName: string;
  subLocality: string;
  fullAddress: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  badge?: string;
  description: string;
}

export interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}
