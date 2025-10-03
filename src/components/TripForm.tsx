import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { api } from '../services/api';
import LocationPicker from './LocationPicker';
import type { TripRequestPayload, TripResponse } from '../types/trip';

const initialFormState: TripRequestPayload = {
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 0,
};

type TripFormProps = {
    onTripCreated: (trip: TripResponse) => void;
};

const TripForm: React.FC<TripFormProps> = ({ onTripCreated }) => {
    const [formState, setFormState] = useState<TripRequestPayload>(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormState((prev) => ({
            ...prev,
            [name]: name === 'current_cycle_used' ? Number(value) : value,
        }));
    };

    const handleLocationChange = (name: string, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (!Number.isFinite(formState.current_cycle_used) || formState.current_cycle_used < 0) {
            setError('Current cycle used must be a positive number.');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await api.post<TripResponse>('trips/', formState);
            onTripCreated(data);
            setFormState(initialFormState);
        } catch (err) {
            console.error('Trip creation failed', err);
            setError('Unable to generate trip plan. Please verify the locations and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'rgba(20, 33, 61, 0.9)',
                color: 'primary.contrastText',
                minHeight: 420,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(120% 120% at 100% 0%, rgba(249, 115, 22, 0.35) 0%, rgba(20, 33, 61, 0) 60%)',
                    pointerEvents: 'none',
                }}
            />
            <Stack spacing={2.5} position="relative">
                <Stack direction="row" gap={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            bgcolor: 'rgba(255,255,255,0.12)',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <RouteIcon color="secondary" />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="inherit">
                            Plan a compliant trip
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(241, 245, 249, 0.8)' }}>
                            Capture origin, pickup, and drop to render routing, cycle hours, and ELD-ready duty logs in seconds.
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <Chip
                        icon={<SpeedIcon />}
                        label="Fastest: choose a city"
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'inherit' }}
                    />
                    <Chip
                        icon={<TrendingUpIcon />}
                        label="Precise: drop a map pin"
                        sx={{ bgcolor: 'rgba(249, 115, 22, 0.18)', color: 'secondary.contrastText' }}
                    />
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                        bgcolor: '#F8FAFC',
                        borderRadius: 3,
                        p: 3,
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
                    }}
                >
                    <Stack spacing={2.5}>
                        <LocationPicker
                            label="Current location"
                            name="current_location"
                            value={formState.current_location}
                            onChange={handleLocationChange}
                            placeholder="Search by city or drop a pin"
                            required
                        />
                        <LocationPicker
                            label="Pickup location"
                            name="pickup_location"
                            value={formState.pickup_location}
                            onChange={handleLocationChange}
                            placeholder="Search major freight hubs"
                            required
                        />
                        <LocationPicker
                            label="Drop-off location"
                            name="dropoff_location"
                            value={formState.dropoff_location}
                            onChange={handleLocationChange}
                            placeholder="Search destination or drop pin"
                            required
                        />

                        <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.1)' }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                            <TextField
                                label="Current cycle used"
                                name="current_cycle_used"
                                type="number"
                                fullWidth
                                required
                                inputProps={{ min: 0, step: 0.25 }}
                                value={formState.current_cycle_used}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                                }}
                                helperText="Enter how many hours the driver has already used in the 60/70-hour cycle."
                            />
                            <Tooltip title="Reset form">
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setFormState(initialFormState)}
                                    disabled={submitting}
                                    sx={{ minWidth: 140 }}
                                >
                                    Clear
                                </Button>
                            </Tooltip>
                        </Stack>

                        <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
                            {submitting ? 'Generating…' : 'Generate route and logs'}
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
};

export default TripForm;
