
// React + Mapbox Heatmap for Readiness
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export default function ReadinessHeatmap({ data }) {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [0, 20],
      zoom: 2
    });

    map.on('load', () => {
      map.addSource('readiness', {
        type: 'geojson',
        data: data
      });
      map.addLayer({
        id: 'readiness-heat',
        type: 'heatmap',
        source: 'readiness',
        paint: {
          'heatmap-weight': ['get', 'severity_score'],
          'heatmap-intensity': 1,
          'heatmap-radius': 15
        }
      });
    });

    return () => map.remove();
  }, [data]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}
