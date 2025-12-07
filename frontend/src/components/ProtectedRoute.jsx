import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component that redirects unauthenticated users to the welcome page
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show nothing while checking authentication status
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to welcome page if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/welcome" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
