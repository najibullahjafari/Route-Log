import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Avatar,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'radial-gradient(130% 140% at 15% 15%, rgba(20, 33, 61, 0.92) 0%, #0F172A 50%, #020617 100%)',
                color: '#F8FAFC',
            }}
        >
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'linear-gradient(120deg, rgba(12, 19, 36, 0.9) 0%, rgba(20, 33, 61, 0.8) 60%, rgba(15, 23, 42, 0.95) 100%)',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                    backdropFilter: 'blur(18px)',
                }}
            >
                <Toolbar sx={{ py: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '14px',
                            backgroundColor: alpha('#F97316', 0.18),
                            display: 'grid',
                            placeItems: 'center',
                            mr: 2,
                        }}
                    >
                        <MenuIcon sx={{ color: '#F97316' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="rgba(248, 250, 252, 0.65)">
                            Fleet operations dashboard
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="#F8FAFC">
                            RouteLog Pro
                        </Typography>
                    </Box>
                    <Tooltip title={user?.email ?? user?.username ?? 'Account'}>
                        <IconButton onClick={handleMenuOpen} size="large" sx={{ color: '#F8FAFC' }}>
                            <Avatar
                                sx={{
                                    bgcolor: '#F97316',
                                    color: '#1F2933',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                }}
                            >
                                {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Container
                component="main"
                maxWidth="xl"
                sx={{
                    flexGrow: 1,
                    py: { xs: 4, md: 6 },
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'space-between',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography variant="h3" fontWeight={700} color="#F8FAFC">
                            Precision hours-of-service planning
                        </Typography>
                        <Typography variant="body1" color="rgba(226, 232, 240, 0.72)" sx={{ maxWidth: 600, mt: 1 }}>
                            Generate compliant routes, visualize mandated breaks, and brief drivers with FMCSA-backed guidance before wheels roll.
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: alpha('#F97316', 0.12),
                            border: '1px solid rgba(249, 115, 22, 0.24)',
                            color: '#F8FAFC',
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 3,
                            backdropFilter: 'blur(14px)',
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle2" color="rgba(248, 250, 252, 0.72)">
                                Latest guidance
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                FMCSA HOS Update · Apr 2022
                            </Typography>
                        </Box>
                        <ArrowOutwardIcon sx={{ color: '#F97316' }} />
                    </Box>
                </Box>
                <Outlet />
            </Container>
        </Box>
    );
};

export default DashboardLayout;
