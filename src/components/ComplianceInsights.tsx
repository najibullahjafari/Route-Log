import InfoIcon from '@mui/icons-material/Info';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';

const keyLimits = [
    {
        title: '14-hour driving window',
        description:
            'Clock starts when the driver comes on duty. Driving must stop after 14 consecutive hours regardless of breaks.',
    },
    {
        title: '11-hour driving cap',
        description:
            'Within the window a driver may log up to 11 hours of drive time provided cumulative driving does not exceed 8 hours without a 30-minute break.',
    },
    {
        title: '30-minute rest requirement',
        description: 'Mandatory break after 8 cumulative hours of driving. Break can be off-duty, on-duty not driving, or sleeper berth.',
    },
    {
        title: '60/70-hour cycle limits',
        description:
            'Property carriers choose 60 hours in 7 days or 70 hours in 8 days. A 34-hour reset restarts the selected cycle.',
    },
];

const exceptionHighlights = [
    'Adverse driving conditions can extend both driving and duty limits by 2 hours when unexpected events occur.',
    'Short-haul operations within 150 air miles may qualify for logbook and break exemptions (CDL and non-CDL variants).',
    'Sleeper berth splits (7/3 or 8/2) pause the 14-hour clock when paired properly, enabling team operations to stay compliant.',
];

const ComplianceInsights: React.FC = () => {
    return (
        <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
                avatar={
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            bgcolor: 'rgba(20, 33, 61, 0.08)',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <MenuBookIcon color="primary" />
                    </Box>
                }
                title={
                    <Typography variant="h6" fontWeight={700}>
                        FMCSA hours-of-service essentials
                    </Typography>
                }
                subheader={
                    <Typography variant="body2" color="text.secondary">
                        Curated from the April 2022 Interstate Truck Driver’s Guide to HOS (FMCSA-HOS-395-DRIVERS-GUIDE-TO-HOS).
                    </Typography>
                }
            />
            <CardContent>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 3,
                    }}
                >
                    <Box>
                        <Stack spacing={2.5}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <TimelineIcon color="secondary" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Daily operating limits
                                </Typography>
                            </Stack>
                            <Stack spacing={2}>
                                {keyLimits.map((limit) => (
                                    <Box key={limit.title}>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {limit.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {limit.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack spacing={2.5}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <WarningAmberIcon color="warning" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    High-impact exceptions
                                </Typography>
                            </Stack>
                            <List dense disablePadding>
                                {exceptionHighlights.map((item) => (
                                    <ListItem key={item} sx={{ alignItems: 'flex-start', px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 32, color: 'secondary.main', mt: 0.5 }}>
                                            <InfoIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2">{item}</Typography>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 1.5 }} />
                            <Chip
                                label="View the full FMCSA guide"
                                color="secondary"
                                component="a"
                                href="https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations"
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                            />
                        </Stack>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ComplianceInsights;
