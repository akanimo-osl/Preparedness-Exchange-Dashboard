
// React + WebSocket Mapbox updater
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import mapboxgl from 'mapbox-gl';

export const useRealtimeMapUpdates = (map: mapboxgl.Map) => {
  useEffect(() => {
    const socket = io('https://your-signalr-endpoint');
    socket.on('newData', (data) => {
      // Update map with data
      map.getSource('alerts').setData(data.geojson);
    });
    return () => socket.disconnect();
  }, [map]);
};
