import React, { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbsContext = createContext({ breadcrumbs: [], updateBreadcrumbs: (newBreadcrumbs: any) => { } });

export const BreadcrumbsProvider: React.FC = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const updateBreadcrumbs = useCallback((newBreadcrumbs) => {
        setBreadcrumbs(newBreadcrumbs);
    }, []);

    return (
        <BreadcrumbsContext.Provider value={{ breadcrumbs, updateBreadcrumbs }}>
            {children}
        </BreadcrumbsContext.Provider>
    );
};

export const useBreadcrumbs = () => useContext(BreadcrumbsContext);
