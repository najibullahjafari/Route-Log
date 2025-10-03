import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/useAuth';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, initializing } = useAuth();
    const location = useLocation();

    if (initializing) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
