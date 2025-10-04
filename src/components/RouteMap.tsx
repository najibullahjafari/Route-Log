import { Box, Paper, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { MapData } from '../types/trip';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Create custom icons for different marker types
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const currentLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to fit map bounds to polyline
const FitBounds: React.FC<{ polyline: [number, number][] }> = ({ polyline }) => {
    const map = useMap();
    
    useEffect(() => {
        if (polyline.length > 0) {
            const bounds = L.latLngBounds(polyline.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, polyline]);
    
    return null;
};

type RouteMapProps = {
    mapData: MapData | null;
};

const RouteMap: React.FC<RouteMapProps> = ({ mapData }) => {
    if (!mapData || mapData.polyline.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 3, minHeight: 360 }}>
                <Typography variant="h6" gutterBottom>
                    Route overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Generate a trip to visualize the optimized route, required stops, and rest periods.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Route overview
            </Typography>
            <Box height={360} borderRadius={2} overflow="hidden">
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FitBounds polyline={mapData.polyline} />
                    <Polyline positions={mapData.polyline.map(([lat, lng]) => [lat, lng])} color="#F97316" weight={4} />
                    {mapData.markers.map((marker) => {
                        let icon = L.Icon.Default.prototype;
                        if (marker.label === 'Pickup') {
                            icon = pickupIcon;
                        } else if (marker.label === 'Dropoff') {
                            icon = dropoffIcon;
                        } else if (marker.label === 'Current Location') {
                            icon = currentLocationIcon;
                        }
                        
                        return (
                            <Marker 
                                key={`${marker.label}-${marker.latitude}-${marker.longitude}`} 
                                position={[marker.latitude, marker.longitude]}
                                icon={icon}
                            >
                                <Popup>
                                    <Typography variant="subtitle2">{marker.label}</Typography>
                                    {marker.approximate && (
                                        <Typography variant="caption" color="text.secondary">
                                            Location estimated due to offline geocoding.
                                        </Typography>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </Box>
        </Paper>
    );
};

export default RouteMap;
