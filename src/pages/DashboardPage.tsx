import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import TripForm from '../components/TripForm';
import TripSummary from '../components/TripSummary';
import RouteMap from '../components/RouteMap';
import ELDLogViewer from '../components/ELDLogViewer';
import ComplianceInsights from '../components/ComplianceInsights';
import type { TripResponse } from '../types/trip';

const DashboardPage: React.FC = () => {
    const [trip, setTrip] = useState<TripResponse | null>(null);

    return (
        <Stack spacing={4} pb={6}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: 'minmax(380px, 480px) minmax(0, 1fr)',
                    },
                    gap: 4,
                }}
            >
                <TripForm onTripCreated={setTrip} />
                <Stack spacing={3.5}>
                    <TripSummary summary={trip?.route_summary ?? null} />
                    <ComplianceInsights />
                </Stack>
            </Box>
            <RouteMap mapData={trip?.map_data ?? null} />
            <ELDLogViewer logs={trip?.hos_logs ?? []} />
        </Stack>
    );
};

export default DashboardPage;
