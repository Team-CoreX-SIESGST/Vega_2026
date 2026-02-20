'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Save the attempted URL to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', pathname);
            router.push('/auth/login');
        }
    }, [isAuthenticated, loading, router, pathname]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render children (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}
