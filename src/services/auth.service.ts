import api from '@/lib/api';
import { LoginInput } from '@/schemas';
import Cookies from 'js-cookie';

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    accessToken: string;
}

export const authService = {
    login: async (credentials: LoginInput) => {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        if (data.accessToken) {
            const isProduction = process.env.NODE_ENV === 'production';
            const cookieOptions = {
                expires: 7,
                path: '/',
                secure: isProduction,
                sameSite: 'strict' as const,
            };
            Cookies.set('token', data.accessToken, cookieOptions);
            Cookies.set('user', JSON.stringify(data.user), cookieOptions);
        }
        return data;
    },
    logout: () => {
        Cookies.remove('token');
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },
    getCurrentUser: () => {
        const user = Cookies.get('user');
        return user ? JSON.parse(user) : null;
    },
};
