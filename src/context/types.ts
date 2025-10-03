import type { ReactNode } from 'react';

export type UserProfile = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
};

export type LoginPayload = {
    username: string;
    password: string;
};

export type RegisterPayload = {
    username: string;
    password: string;
    confirm_password: string;
    email: string;
    first_name: string;
    last_name: string;
};

export type AuthContextValue = {
    user: UserProfile | null;
    isAuthenticated: boolean;
    initializing: boolean;
    authLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
};

export type AuthProviderProps = {
    children: ReactNode;
};
