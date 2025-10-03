import { LockOutlined } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Link,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, authLoading } = useAuth();
    const [formState, setFormState] = useState({ username: '', password: '' });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        try {
            await login(formState);
            const redirect = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
            navigate(redirect, { replace: true });
        } catch {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#f5f7fb">
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to plan compliant routes in minutes.
                    </Typography>
                </Box>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formState.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formState.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        size="large"
                        disabled={authLoading}
                    >
                        {authLoading ? 'Signing in…' : 'Sign In'}
                    </Button>
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Need an account?{' '}
                            <Link component={RouterLink} to="/register">
                                Create one now.
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;
