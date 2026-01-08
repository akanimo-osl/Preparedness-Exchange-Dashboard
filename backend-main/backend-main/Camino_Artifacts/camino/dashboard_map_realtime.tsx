
// React + WebSocket Mapbox updater
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import mapboxgl from 'mapbox-gl';

export const useRealtimeMapUpdates = (map: mapboxgl.Map) => {
  useEffect(() => {
    const WS_URL = (import.meta as any).env?.VITE_INGEST_WS_URL || '';
    const TOKEN = (import.meta as any).env?.VITE_INGEST_WS_TOKEN || '';

    if (!WS_URL) {
      // No endpoint configured; do nothing
      return;
    }

    const socket = io(WS_URL, {
      transports: ['websocket'],
      auth: TOKEN ? { token: TOKEN } : undefined,
      // Alternative header-based auth (some proxies):
      extraHeaders: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
    });

    const ensureSource = () => {
      if (!map.getSource('alerts')) {
        map.addSource('alerts', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        if (!map.getLayer('alerts-circle')) {
          map.addLayer({
            id: 'alerts-circle',
            type: 'circle',
            source: 'alerts',
            paint: {
              'circle-radius': 6,
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.8,
            },
          });
        }
      }
    };

    const onHazardUpdate = (payload: any) => {
      try {
        ensureSource();
        const geojson = payload?.geojson ?? payload;
        (map.getSource('alerts') as mapboxgl.GeoJSONSource).setData(geojson);
      } catch (e) {
        console.warn('Failed to apply hazard update', e);
      }
    };

    socket.on('hazard_update', onHazardUpdate);
    socket.on('connect', () => console.info('WS connected'));
    socket.on('connect_error', (err) => console.error('WS error', err));

    return () => socket.disconnect();
  }, [map]);
};
