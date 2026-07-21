import { RouteOptimizationResult } from '../types';

const OSRM_URL = 'https://router.project-osrm.org';

export async function calculateRoute(waypoints: { lat: number; lng: number }[]): Promise<RouteOptimizationResult | null> {
  if (waypoints.length < 2) return null;
  try {
    const coordinates = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const response = await fetch(`${OSRM_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=true`);
    if (!response.ok) return null;
    const data: any = await response.json();
    if (!data.routes || data.routes.length === 0) return null;
    const route = data.routes[0];
    return { waypoints, totalDistance: route.distance, totalDuration: route.duration, geometry: route.geometry, legs: route.legs };
  } catch { return null; }
}

export async function calculateRouteWithOptimization(waypoints: { lat: number; lng: number }[]): Promise<RouteOptimizationResult | null> {
  if (waypoints.length < 2) return null;
  try {
    const coordinates = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const response = await fetch(`${OSRM_URL}/trip/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&source=first&destination=last`);
    if (!response.ok) return null;
    const data: any = await response.json();
    if (!data.trips || data.trips.length === 0) return null;
    const trip = data.trips[0];
    const orderedWaypoints = data.waypoints ? data.waypoints.map((wp: any) => ({ lat: parseFloat(wp.location[1]), lng: parseFloat(wp.location[0]) })) : waypoints;
    return { waypoints: orderedWaypoints, totalDistance: trip.distance, totalDuration: trip.duration, geometry: trip.geometry, legs: trip.legs };
  } catch { return null; }
}

export async function getDistanceMatrix(origins: { lat: number; lng: number }[], destinations: { lat: number; lng: number }[]): Promise<number[][] | null> {
  try {
    const allPoints = [...origins, ...destinations];
    const coordinates = allPoints.map(w => `${w.lng},${w.lat}`).join(';');
    const sources = origins.map((_, i) => i).join(';');
    const dests = destinations.map((_, i) => i + origins.length).join(';');
    const response = await fetch(`${OSRM_URL}/table/v1/driving/${coordinates}?sources=${sources}&destinations=${dests}`);
    if (!response.ok) return null;
    const data: any = await response.json();
    return data.durations;
  } catch { return null; }
}
