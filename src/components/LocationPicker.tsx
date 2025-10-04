import RoomIcon from '@mui/icons-material/Room';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type { LocationOption } from '../data/locations';
import { MAJOR_US_LOCATIONS } from '../data/locations';

const DEFAULT_POSITION: [number, number] = [20, 0]; // global center showing most continents

const MapPinSelector: React.FC<{
    value: [number, number] | null;
    onSelect: (coords: [number, number]) => void;
}> = ({ value, onSelect }) => {
    useMapEvents({
        click: (event) => {
            onSelect([event.latlng.lat, event.latlng.lng]);
        },
    });

    return value ? <Marker position={value} /> : null;
};

type LocationPickerProps = {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    onChange: (name: string, value: string) => void;
    required?: boolean;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
    label,
    name,
    value,
    placeholder,
    onChange,
    required = false,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [coords, setCoords] = useState<[number, number] | null>(() => {
        const match = value.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        return match ? [parseFloat(match[1]), parseFloat(match[2])] : null;
    });

    const curatedOptions = useMemo(() => MAJOR_US_LOCATIONS, []);

    const matchedOption = useMemo(
        () => curatedOptions.find((option) => option.value === value) ?? null,
        [curatedOptions, value],
    );

    const handleSelect = (
        _: SyntheticEvent<Element, Event>,
        option: LocationOption | string | null,
        reason: string,
    ) => {
        if (reason === 'clear') {
            onChange(name, '');
            return;
        }
        if (typeof option === 'string') {
            onChange(name, option);
            return;
        }
        if (option) {
            onChange(name, option.value);
        }
    };

    const handleInputChange = (
        _: SyntheticEvent<Element, Event>,
        newValue: string,
        reason: string,
    ) => {
        if (reason === 'input') {
            onChange(name, newValue);
        }
    };

    const handleMapConfirm = () => {
        if (coords) {
            const formatted = `Pinned location (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`;
            onChange(name, formatted);
        }
        setDialogOpen(false);
    };

    const performanceTip =
        'Selecting a known city keeps routing lightning fast. Dropping a map pin gives precise coordinates if your location is more remote.';

    return (
        <Box>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Autocomplete<LocationOption, false, false, true>
                    freeSolo
                    options={curatedOptions}
                    value={matchedOption ?? (value ? value : null)}
                    onChange={handleSelect}
                    onInputChange={handleInputChange}
                    fullWidth
                    autoHighlight
                    selectOnFocus
                    clearOnEscape
                    blurOnSelect
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                    }
                    isOptionEqualToValue={(option, val) =>
                        (typeof val === 'string' ? option.value === val : option.value === val.value)
                    }
                    renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.value} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography fontWeight={600}>{option.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {option.state}
                            </Typography>
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            required={required}
                            label={label}
                            placeholder={placeholder}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {value ? <RoomIcon color="secondary" /> : <RoomOutlinedIcon color="disabled" />}
                                    </InputAdornment>
                                ),
                            }}
                            helperText={performanceTip}
                        />
                    )}
                />
                <Tooltip title="Drop a map pin">
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setDialogOpen(true)}
                        sx={{
                            flexShrink: 0,
                            minWidth: 48,
                            borderRadius: '14px',
                            px: 2.25,
                            py: 1,
                        }}
                        startIcon={<MapIcon />}
                    >
                        Map
                    </Button>
                </Tooltip>
            </Stack>
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="md"
                aria-labelledby={`${name}-dialog-title`}
            >
                <DialogTitle id={`${name}-dialog-title`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Select {label} on the map</Typography>
                    <IconButton onClick={() => setDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{ height: 400 }}>
                        <MapContainer
                            center={coords ?? DEFAULT_POSITION}
                            zoom={coords ? 7 : 2}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapPinSelector value={coords} onSelect={setCoords} />
                        </MapContainer>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Click anywhere on the map to drop a pin. We’ll use the precise coordinates while the backend resolves the
                            nearest serviceable route.
                        </Typography>
                        {coords && (
                            <Typography variant="subtitle2" sx={{ mt: 1.5 }} color="text.primary">
                                Selected coordinates: {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5 }}>
                    <Button color="inherit" onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleMapConfirm} variant="contained" color="secondary" disabled={!coords}>
                        Use pinned location
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LocationPicker;
