import axios, { type AxiosRequestHeaders } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/';
const TOKEN_STORAGE_KEY = 'routelog_pro_tokens';

type AuthTokens = {
    access: string;
    refresh: string;
};

const tokenStorage = {
    get(): AuthTokens | null {
        try {
            const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
            return raw ? (JSON.parse(raw) as AuthTokens) : null;
        } catch (error) {
            console.error('Failed to read auth tokens from storage', error);
            return null;
        }
    },
    set(tokens: AuthTokens | null) {
        try {
            if (!tokens) {
                window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            } else {
                window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
            }
        } catch (error) {
            console.error('Failed to persist auth tokens', error);
        }
    },
};

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const tokens = tokenStorage.get();
    if (tokens?.access) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${tokens.access}`;
        config.headers = headers;
    }
    return config;
});

export { api, tokenStorage };
export type { AuthTokens };
