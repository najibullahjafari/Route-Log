import { Alert, Box, Divider, Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import type { RouteSummary } from '../types/trip';

dayjs.extend(durationPlugin);

type TripSummaryProps = {
    summary: RouteSummary | null;
};

const formatHours = (hours: number): string => {
    const duration = dayjs.duration(hours, 'hours');
    const hoursPart = Math.floor(duration.asHours());
    const minutesPart = Math.round(duration.minutes());
    return `${hoursPart}h ${minutesPart}m`;
};

const TripSummary: React.FC<TripSummaryProps> = ({ summary }) => {
    if (!summary) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Trip summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    After generating a trip, routing insights and key compliance metrics will appear here.
                </Typography>
            </Paper>
        );
    }

    const approximateLocations = summary.geocoding.filter((note) => note.approximate);

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Trip summary
            </Typography>
            {(approximateLocations.length > 0 || summary.fallback_route) && (
                <Stack spacing={1} mb={2}>
                    {approximateLocations.length > 0 && (
                        <Alert severity="warning">
                            Some stops are mapped using approximate coordinates due to network limits: {' '}
                            {approximateLocations.map((note) => note.query).join(', ')}.
                        </Alert>
                    )}
                    {summary.fallback_route && (
                        <Alert severity="info">
                            The distance and drive time use an estimated fallback calculation because the live routing
                            service was unavailable.
                        </Alert>
                    )}
                </Stack>
            )}
            <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' }}
                gap={2}
                mb={2}
            >
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Total distance
                    </Typography>
                    <Typography variant="h5">{summary.distance_miles.toLocaleString()} mi</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Estimated drive time
                    </Typography>
                    <Typography variant="h5">{formatHours(summary.duration_hours)}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Planned stops
                    </Typography>
                    <Typography variant="h5">{summary.stops.length}</Typography>
                </Paper>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Route segments
            </Typography>
            <Stack spacing={1.5} mb={2}>
                {summary.legs.map((leg) => (
                    <Paper key={leg.segment} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2">Segment {leg.segment}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {leg.distance_miles.toFixed(1)} mi · {formatHours(leg.duration_hours)}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Planned events
            </Typography>
            <Stack spacing={1}>
                {summary.stops.map((stop, index) => (
                    <Paper key={`${stop.type}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2">{stop.type}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stop.details}
                            {stop.timestamp && ` · ${dayjs(stop.timestamp).format('MMM D, YYYY h:mm A')}`}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
};

export default TripSummary;
