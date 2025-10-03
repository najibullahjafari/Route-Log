import { PersonAddAlt1 } from '@mui/icons-material';
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, authLoading } = useAuth();
    const [formState, setFormState] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (formState.password !== formState.confirm_password) {
            setError('Passwords do not match.');
            return;
        }
        try {
            await register(formState);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('Registration failed. Please review your details.');
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#eef2fb">
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
                        <PersonAddAlt1 />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Create Your Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Build compliant route plans, generate ELD logs, and stay audit ready.
                    </Typography>
                </Box>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Box
                        display="grid"
                        gap={2}
                        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}
                    >
                        <TextField
                            name="first_name"
                            required
                            fullWidth
                            label="First Name"
                            value={formState.first_name}
                            onChange={handleChange}
                        />
                        <TextField
                            name="last_name"
                            required
                            fullWidth
                            label="Last Name"
                            value={formState.last_name}
                            onChange={handleChange}
                        />
                        <TextField
                            name="email"
                            type="email"
                            required
                            fullWidth
                            label="Business Email"
                            value={formState.email}
                            onChange={handleChange}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                        <TextField
                            name="username"
                            required
                            fullWidth
                            label="Username"
                            value={formState.username}
                            onChange={handleChange}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                        <TextField
                            name="password"
                            type="password"
                            required
                            fullWidth
                            label="Password"
                            value={formState.password}
                            onChange={handleChange}
                        />
                        <TextField
                            name="confirm_password"
                            type="password"
                            required
                            fullWidth
                            label="Confirm Password"
                            value={formState.confirm_password}
                            onChange={handleChange}
                        />
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={authLoading}
                    >
                        {authLoading ? 'Creating account…' : 'Create account'}
                    </Button>
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Already have credentials?{' '}
                            <Link component={RouterLink} to="/login">
                                Back to sign in.
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default RegisterPage;
