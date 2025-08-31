import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { TourProvider } from '@/Provider/TourContext';

interface TourEditorWrapperProps {
    children: React.ReactNode;
}

const TourEditorWrapper: React.FC<TourEditorWrapperProps> = ({ children }) => {
    const location = useLocation();
    const { tourId } = useParams<{ tourId: string }>();

    // Detect if we're in editing mode based on the route
    const isEditing = location.pathname.includes('/edit_tour/') && !!tourId;

    return (
        <TourProvider
            isEditing={isEditing}
        >
            {children}
        </TourProvider>
    );
};

export default TourEditorWrapper;
