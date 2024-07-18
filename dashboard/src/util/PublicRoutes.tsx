import { getAuthUserRole } from '@/layouts/AuthLayout';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const roles = getAuthUserRole();
        if (roles === 'user' || roles === null) {
            setIsAllowed(true);
        } else {
            setIsAllowed(false);
        }
    }, []);

    if (isAllowed === null) {
        return <div>Loading...</div>; // or a spinner, while determining roles
    }

    return isAllowed ? <Outlet /> : <Navigate to="/dashboard/home" />;
};

export default PublicRoutes;
