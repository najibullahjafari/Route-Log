import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import { useMemo } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import type { HosDayLog } from '../types/trip';

dayjs.extend(durationPlugin);

type ELDLogViewerProps = {
    logs: HosDayLog[];
};

const formatDuration = (hours: number) => {
    const duration = dayjs.duration(hours, 'hours');
    const hoursPart = Math.floor(duration.asHours());
    const minutesPart = Math.round(duration.minutes());
    return `${hoursPart}h ${minutesPart}m`;
};

const STATUS_PALETTE: Record<string, string> = {
    Driving: '#F97316',
    'On Duty': '#14213D',
    'Off Duty': '#94A3B8',
    'Sleeper Berth': '#0EA5E9',
};

const ELDLogViewer: React.FC<ELDLogViewerProps> = ({ logs }) => {
    const chartData = useMemo(() => {
        const statusKeys = ['Driving', 'On Duty', 'Off Duty', 'Sleeper Berth'];
        if (!logs || logs.length === 0) {
            return { statusKeys, dataset: [] as Record<string, number | string>[] };
        }
        const dataset = logs.map((day) => {
            const aggregates: Record<string, number> = Object.fromEntries(statusKeys.map((key) => [key, 0]));
            day.entries.forEach((entry) => {
                if (aggregates[entry.status] !== undefined) {
                    aggregates[entry.status] += entry.duration_hours;
                }
            });
            return {
                label: `Day ${day.day}`,
                ...aggregates,
            };
        });

        return { statusKeys, dataset };
    }, [logs]);

    if (!logs || logs.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Daily log sheets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Create a trip to automatically fill compliant daily log sheets with on-duty, drive, break, and sleeper berth events.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Daily log sheets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review how each duty status stacks across the day. Hover to inspect total hours and confirm compliance against daily limits.
            </Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <BarChart
                    height={320}
                    dataset={chartData.dataset}
                    xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
                    series={chartData.statusKeys.map((status) => ({
                        dataKey: status,
                        label: status,
                        stack: 'hours',
                        color: STATUS_PALETTE[status] ?? '#334155',
                    }))}
                    margin={{ top: 16, bottom: 24, left: 24, right: 16 }}
                    legend={{ hidden: false }}
                    sx={{
                        svg: {
                            text: {
                                fontFamily: 'Inter, sans-serif',
                            },
                        },
                    }}
                />
            </Box>
            {logs.map((day) => (
                <Accordion key={day.day} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={600}>Day {day.day}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            {day.entries.length} duty segments · starts {dayjs(day.start).format('MMM D, YYYY')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Table size="small" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Activity</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell align="right">Duration</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {day.entries.map((entry, index) => (
                                    <TableRow key={`${day.day}-${index}`}>
                                        <TableCell>{entry.status}</TableCell>
                                        <TableCell>{entry.activity}</TableCell>
                                        <TableCell>{dayjs(entry.start).format('MMM D, h:mm A')}</TableCell>
                                        <TableCell>{dayjs(entry.end).format('MMM D, h:mm A')}</TableCell>
                                        <TableCell align="right">{formatDuration(entry.duration_hours)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Paper>
    );
};

export default ELDLogViewer;
