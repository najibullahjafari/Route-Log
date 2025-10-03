import { Box, Paper, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { MapData } from '../types/trip';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

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

    const center = mapData.polyline[Math.floor(mapData.polyline.length / 2)];

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Route overview
            </Typography>
            <Box height={360} borderRadius={2} overflow="hidden">
                <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline positions={mapData.polyline.map(([lat, lng]) => [lat, lng])} color="#F97316" weight={4} />
                    {mapData.markers.map((marker) => (
                        <Marker key={`${marker.label}-${marker.latitude}-${marker.longitude}`} position={[marker.latitude, marker.longitude]}>
                            <Popup>
                                <Typography variant="subtitle2">{marker.label}</Typography>
                                {marker.approximate && (
                                    <Typography variant="caption" color="text.secondary">
                                        Location estimated due to offline geocoding.
                                    </Typography>
                                )}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>
        </Paper>
    );
};

export default RouteMap;
