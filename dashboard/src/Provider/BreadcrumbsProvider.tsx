import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Breadcrumb {
    title: string;
    href?: string;
    type?: 'link' | 'page';
    link?: string; // Adjust if your Breadcrumb type expects this
}

interface BreadcrumbsContextType {
    breadcrumbs: Breadcrumb[];
    updateBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) => void;
}

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

export const useBreadcrumbs = () => useContext(BreadcrumbsContext);
