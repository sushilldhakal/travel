import { createContext } from 'react';
import { TourContextType } from './TourContextTypes';

// Create and export the context
export const TourContext = createContext<TourContextType | undefined>(undefined);
