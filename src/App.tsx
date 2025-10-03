import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './context/useAuth';

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
            </Route>
            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
        </Routes>
    );
}

export default App;
