'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/utils/api_client';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login function — POST /api/auth/login
    const login = async (email, password) => {
        try {
            const { data } = await apiClient.post('/auth/login', { email, password });

            if (!data.status) {
                throw new Error(data.message || 'Login failed');
            }

            const { user: userData, token: authToken } = data.data;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setToken(authToken);
            setUser(userData);

            return { success: true, data: data.data };
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return { success: false, error: message };
        }
    };

    // Register function — POST /api/auth/register (name, email, password, role?, station?)
    const register = async (name, email, password, role = 'user', station = null) => {
        try {
            const body = { name, email, password, role };
            if (station) body.station = station;

            const { data } = await apiClient.post('/auth/register', body);

            if (!data.status) {
                throw new Error(data.message || 'Registration failed');
            }

            const { user: userData, token: authToken } = data.data;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setToken(authToken);
            setUser(userData);

            return { success: true, data: data.data };
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return { success: false, error: message };
        }
    };

    // Logout function — POST /api/auth/logout
    const logout = async () => {
        try {
            if (token) {
                await apiClient.post('/auth/logout', null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            router.push('/auth/login');
        }
    };

    // Get current user from API — GET /api/auth/check
    const getCurrentUser = async () => {
        if (!token) return null;

        try {
            const { data } = await apiClient.get('/auth/check', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.status && data.data?.user) {
                const userData = data.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Get current user error:', error);
            logout();
        }
        return null;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        getCurrentUser,
        isAuthenticated: !!token && !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
