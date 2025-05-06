import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthUserRoles } from '@/util/authUtils';

const PrivateRoutes: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const roles = getAuthUserRoles();
        if (roles === 'admin' || roles === 'seller') {
            setIsAllowed(true);
        } else {
            setIsAllowed(false);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAllowed ? <Outlet /> : <Navigate to="/" state={{ path: location.pathname }} />;
};

export default PrivateRoutes;
