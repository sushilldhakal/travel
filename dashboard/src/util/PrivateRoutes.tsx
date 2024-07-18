import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthUserRoles } from '@/layouts/AuthLayout';

const PrivateRoutes: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Initial loading state
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        try {
            const roles = getAuthUserRoles();
            if (roles === 'admin' || roles === 'seller') {
                setIsAllowed(true);
            } else {
                setIsAllowed(false);
            }
        } catch (e) {
            console.error('Error fetching user roles:', e);
            setError('Failed to determine user roles.');
        } finally {
            setLoading(false); // Roles are determined, set loading to false
        }
    }, []); // Empty dependency array since getAuthUserRoles doesn't change

    if (loading) {
        return <div>Loading...</div>; // Show loading indicator while roles are being determined
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error message if there's an error
    }

    return isAllowed ? <Outlet /> : <Navigate to="/" />; // Render based on role permissions
};

export default PrivateRoutes;
