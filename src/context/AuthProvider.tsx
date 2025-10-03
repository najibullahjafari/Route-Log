import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage, type AuthTokens } from '../services/api';
import { AuthContext } from './AuthContext';
import type {
    AuthContextValue,
    AuthProviderProps,
    LoginPayload,
    RegisterPayload,
    UserProfile,
} from './types';

const fetchCurrentUser = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('auth/me/');
    return response.data;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    const applyTokens = useCallback((next: AuthTokens | null) => {
        tokenStorage.set(next);
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            const stored = tokenStorage.get();
            if (!stored) {
                setInitializing(false);
                return;
            }
            applyTokens(stored);
            try {
                const profile = await fetchCurrentUser();
                setUser(profile);
            } catch (error) {
                console.error('Session bootstrap failed', error);
                applyTokens(null);
                setUser(null);
            } finally {
                setInitializing(false);
            }
        };
        bootstrap();
    }, [applyTokens]);

    const login = useCallback(
        async (payload: LoginPayload): Promise<void> => {
            setAuthLoading(true);
            try {
                const { data } = await api.post<AuthTokens>('auth/token/', payload);
                applyTokens(data);
                const profile = await fetchCurrentUser();
                setUser(profile);
            } finally {
                setAuthLoading(false);
            }
        },
        [applyTokens],
    );

    const register = useCallback(
        async (payload: RegisterPayload): Promise<void> => {
            setAuthLoading(true);
            try {
                await api.post('auth/register/', payload);
                await login({ username: payload.username, password: payload.password });
            } finally {
                setAuthLoading(false);
            }
        },
        [login],
    );

    const logout = useCallback(() => {
        applyTokens(null);
        setUser(null);
    }, [applyTokens]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            initializing,
            authLoading,
            login,
            register,
            logout,
        }),
        [authLoading, initializing, login, logout, register, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
