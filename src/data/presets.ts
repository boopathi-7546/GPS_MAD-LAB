import { PresetLocation } from '../types/location';

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'vsb-karur',
    title: 'VSB Engineering College',
    subtitle: 'Karudayampalayam, Karur',
    category: 'college',
    latitude: 10.97682,
    longitude: 78.00523,
    cityName: 'Karur',
    subLocality: 'Karudayampalayam',
    fullAddress: 'VSB Engineering College, NH 67 (Covai Road), Karudayampalayam, Karur, Tamil Nadu 639111',
    district: 'Karur',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '639111',
    badge: 'Your Current Spot (VSB Karur)',
    description: 'Autonomous engineering college campus located along NH 67 at Karudayampalayam, Karur district.'
  },
  {
    id: 'karur-city',
    title: 'Karur City Center',
    subtitle: 'Textile Capital & Bus Terminal',
    category: 'district',
    latitude: 10.9601,
    longitude: 78.0766,
    cityName: 'Karur',
    subLocality: 'Vengamedu / Central',
    fullAddress: 'Collectorate Road / Central Bus Stand, Karur, Tamil Nadu 639001',
    district: 'Karur',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '639001',
    badge: 'District HQ',
    description: 'Renowned textile hub on the banks of Amaravathi River, central Karur district.'
  },
  {
    id: 'erode',
    title: 'Erode City',
    subtitle: 'Turmeric City & Periyar Junction',
    category: 'district',
    latitude: 11.3410,
    longitude: 77.7172,
    cityName: 'Erode',
    subLocality: 'Brough Road / Junction',
    fullAddress: 'Central Bus Terminal & Railway Junction, Erode, Tamil Nadu 638001',
    district: 'Erode',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '638001',
    badge: 'North-West (approx 55 km)',
    description: 'Major commercial city located on the banks of Bhavani & Kaveri rivers.'
  },
  {
    id: 'namakkal',
    title: 'Namakkal City',
    subtitle: 'Transport Hub & Anjaneyar Fort',
    category: 'district',
    latitude: 11.2189,
    longitude: 78.1674,
    cityName: 'Namakkal',
    subLocality: 'Fort Road / Bus Stand',
    fullAddress: 'Sri Anjaneyar Temple / Rock Fort, Namakkal, Tamil Nadu 637001',
    district: 'Namakkal',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '637001',
    badge: 'North-East (approx 42 km)',
    description: 'Historic city known for the single-stone Rock Fort and monolithic Anjaneyar temple.'
  },
  {
    id: 'dindigul',
    title: 'Dindigul City',
    subtitle: 'Lock City & Rock Fort',
    category: 'district',
    latitude: 10.3673,
    longitude: 77.9803,
    cityName: 'Dindigul',
    subLocality: 'Rock Fort / Clock Tower',
    fullAddress: 'Dindigul Rock Fort, Nagal Nagar, Dindigul, Tamil Nadu 624001',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '624001',
    badge: 'South (approx 68 km)',
    description: 'Historic gateway city famous for locks, biryani, and the 17th-century hill fortress.'
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatDMS(deg: number, isLat: boolean): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}
