import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getAccessToken, getAuthUserRoles, AccessTokenType } from './authUtils';
import { jwtDecode } from 'jwt-decode';

export type { AccessTokenType } from './authUtils';

export const AdminProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    const userWithRoles = jwtDecode<AccessTokenType>(accessToken);
    const userRole = userWithRoles.roles;

    if (userRole !== 'admin') {
        return <Navigate to="/dashboard/users" />;
    }

    return children ? <>{children}</> : <Outlet />;
};

// For backward compatibility - maintain the original name
export const AdminRoute = AdminProtectedRoute;

const AuthLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    
    // Use useEffect for navigation instead of conditional rendering
    // This prevents infinite rendering loops
    React.useEffect(() => {
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            // Handle unauthenticated users - allow access to public routes
            // Only redirect if trying to access protected routes
            if (currentPath.startsWith('/dashboard')) {
                navigate('/auth/login', { state: { path: currentPath } });
            }
            return;
        }
        
        const roles = getAuthUserRoles();
        
        // Redirect based on role and current path
        if (roles === 'admin' || roles === 'seller') {
            // Admin/seller should be on dashboard routes
            if (!currentPath.startsWith('/dashboard')) {
                navigate('/dashboard/home', { state: { path: currentPath } });
            }
        } else if (roles === 'user') {
            // Regular users shouldn't access dashboard or auth routes
            if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/auth')) {
                navigate('/', { state: { path: currentPath } });
            }
        } else if (!roles) {
            // No valid role, redirect to login
            navigate('/auth/login', { state: { path: currentPath } });
        }
    }, [currentPath, navigate]); // Only re-run when path or navigate changes
    
    return <Outlet />; // Always render the Outlet, redirects handled by useEffect
};

export default AuthLayout;
