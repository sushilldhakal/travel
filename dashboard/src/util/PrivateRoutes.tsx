import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthUserRoles, getAccessToken, isValidToken } from '@/util/authUtils';
import useTokenExpiration from '@/hooks/useTokenExpiration';

const PrivateRoutes: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const location = useLocation();

    // Use token expiration hook
    useTokenExpiration({
        checkInterval: 60000, // Check every minute
        redirectTo: '/',
        onTokenExpired: () => {
            console.log('Token expired in PrivateRoutes, redirecting to home page');
            setIsAllowed(false);
        }
    });

    useEffect(() => {
        const checkTokenAndRoles = () => {
            const token = getAccessToken();
            
            // Check if token exists and is valid
            if (!token || !isValidToken(token)) {
                console.log('Token expired or invalid, redirecting to home page');
                setIsAllowed(false);
                setLoading(false);
                return;
            }

            // Check user roles
            const roles = getAuthUserRoles();
            if (roles === 'admin' || roles === 'seller') {
                setIsAllowed(true);
            } else {
                console.log('User does not have required roles, redirecting to home page');
                setIsAllowed(false);
            }
            setLoading(false);
        };

        checkTokenAndRoles();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    return isAllowed ? <Outlet /> : <Navigate to="/" state={{ path: location.pathname, reason: 'token_expired' }} replace />;
};

export default PrivateRoutes;
