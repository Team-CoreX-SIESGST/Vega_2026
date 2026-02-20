'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

    // Login function
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setToken(data.data.token);
            setUser(data.data.user);

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (name, email, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token and user
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setToken(data.data.token);
            setUser(data.data.user);

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch('http://localhost:8000/api/users/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call success
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            router.push('/auth/login');
        }
    };

    // Get current user from API
    const getCurrentUser = async () => {
        if (!token) return null;

        try {
            const response = await fetch('http://localhost:8000/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status) {
                setUser(data.data);
                localStorage.setItem('user', JSON.stringify(data.data));
                return data.data;
            }
        } catch (error) {
            console.error('Get current user error:', error);
            // If token is invalid, logout
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
