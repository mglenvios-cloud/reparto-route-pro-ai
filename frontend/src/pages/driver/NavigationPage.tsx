import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orderApi, routeApi } from '../../services/api';
import { emitDriverLocation } from '../../services/socket';
import { Navigation, MapPin, Clock, Info } from 'lucide-react';

const driverIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-8 h-8 bg-primary-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"><div class="w-3 h-3 bg-white rounded-full"></div></div>', iconSize: [32, 32], iconAnchor: [16, 16] });
const stopIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
const destinationIcon = new L.DivIcon({ className: 'custom-marker', html: '<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}

export default function NavigationPage() {
  const { id } = useParams();
  const [position, setPosition] = useState<[number, number]>([19.4326, -99.1332]);
  const [route, setRoute] = useState<any>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [eta, setEta] = useState('');

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        emitDriverLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed || 0, heading: pos.coords.heading || 0 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
    loadRoute();
  }, [id]);

  const loadRoute = async () => {
    if (!id) return;
    try { const { data } = await routeApi.get(id); setRoute(data.data); } catch {}
  };

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-dark-400">
        <Navigation size={48} className="mb-4" />
        <p>Selecciona una ruta para navegar</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-0 bottom-16 flex flex-col">
      <div className="flex-1 relative">
        <MapContainer center={position} zoom={15} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater center={position} />
          <Marker position={position} icon={driverIcon}>
            <Popup><span className="text-dark-900 font-medium">Tu ubicación</span></Popup>
          </Marker>
          {route.routeStops?.map((stop: any, i: number) => (
            <Marker key={stop.id} position={[stop.latitude || 19.4326, stop.longitude || -99.1332]} icon={i === currentStop ? destinationIcon : stopIcon}>
              <Popup><span className="text-dark-900 font-medium">Parada {stop.sequence}: {stop.address?.street}</span></Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 left-4 right-4 glass rounded-2xl p-4 z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{route.name}</h3>
            <span className="bg-primary-500/20 text-primary-400 px-2 py-1 rounded-lg text-xs font-medium">Parada {currentStop + 1}/{route.routeStops?.length || 0}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-dark-300">
            <span className="flex items-center gap-1"><MapPin size={14} /> {route.routeStops?.[currentStop]?.address?.street || 'Siguiente parada'}</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 z-[1000]">
          <div className="flex gap-3">
            <button onClick={() => setCurrentStop(Math.max(0, currentStop - 1))} disabled={currentStop === 0} className="btn-secondary flex-1 text-sm py-2">Anterior</button>
            <button onClick={() => setCurrentStop(Math.min(route.routeStops?.length - 1 || 0, currentStop + 1))} disabled={currentStop >= (route.routeStops?.length || 1) - 1} className="btn-primary flex-1 text-sm py-2">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
