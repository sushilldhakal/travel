import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Breadcrumb, BreadcrumbsContextType } from './types';



const BreadcrumbsContext = createContext<BreadcrumbsContextType>({
    breadcrumbs: [],
    updateBreadcrumbs: () => { },
});

interface BreadcrumbsProviderProps {
    children: ReactNode;
}

export const BreadcrumbsProvider: React.FC<BreadcrumbsProviderProps> = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

    const updateBreadcrumbs = useCallback((newBreadcrumbs: Breadcrumb[]) => {
        setBreadcrumbs(newBreadcrumbs);
    }, []);

    return (
        <BreadcrumbsContext.Provider value={{ breadcrumbs, updateBreadcrumbs }}>
            {children}
        </BreadcrumbsContext.Provider>
    );
};

// Create the custom hook for using the BreadcrumbsContext
export const useBreadcrumbs = () => useContext(BreadcrumbsContext);
