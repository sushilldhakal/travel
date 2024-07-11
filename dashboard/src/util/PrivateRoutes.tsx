import { getAuthUserRoles } from '@/layouts/AuthLayout';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const roles = getAuthUserRoles();
        if (roles === 'admin' || roles === 'seller') {
            setIsAllowed(true);
        } else {
            setIsAllowed(false);
        }
    }, []);

    if (isAllowed === null) {
        return <div>Loading...</div>; // or a spinner, while determining roles
    }

    return isAllowed ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default PrivateRoutes;
