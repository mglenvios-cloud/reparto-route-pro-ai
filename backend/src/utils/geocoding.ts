import { GeocodingResult } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({ q: address, format: 'json', limit: '1', addressdetails: '1' });
    const response = await fetch(`${NOMINATIM_URL}/search?${params}`, { headers: { 'User-Agent': 'RouteProAI/1.0' } });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (!data || data.length === 0) return null;
    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      street: result.address?.road || result.address?.street,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state,
      zipCode: result.address?.postcode,
      country: result.address?.country,
    };
  } catch { return null; }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lng.toString(), format: 'json', addressdetails: '1' });
    const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, { headers: { 'User-Agent': 'RouteProAI/1.0' } });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (!data) return null;
    return {
      latitude: lat, longitude: lng,
      formattedAddress: data.display_name,
      street: data.address?.road || data.address?.street,
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      zipCode: data.address?.postcode, country: data.address?.country,
    };
  } catch { return null; }
}
