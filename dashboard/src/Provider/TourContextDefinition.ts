import { createContext } from 'react';
import { JSONContent } from 'novel';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import type { pricingOptions } from './types';
import { Category, DateRange, FactData, FaqData, Itinerary } from './types';
import type { Tour as TourFormValues } from './types'; // or the correct path

// Combined context type with editor content and form handling
export interface TourContextType {
  // Editor content (from EditorContext)
  editorContent: JSONContent | null;
  setEditorContent: (content: JSONContent | null) => void;
  inclusionsContent: JSONContent | null;
  setInclusionsContent: (content: JSONContent | null) => void;
  exclusionsContent: JSONContent | null;
  setExclusionsContent: (content: JSONContent | null) => void;
  itineraryContent: JSONContent | null;
  setItineraryContent: (content: JSONContent | null) => void;

  // Form handling
  form: UseFormReturn<TourFormValues, TourFormValues, TourFormValues>;
  onSubmit?: (values: FieldValues, mutate: (data: FormData) => void) => Promise<void>;
  tripCode?: string;
  setTripCode?: (code: string) => void;
  handleGenerateCode?: () => string;

  // Arrays for each section (all Partial<T>[] for type safety)
  itineraryFields?: Partial<Itinerary>[];
  itineraryAppend?: (value: Partial<Itinerary> | Partial<Itinerary>[]) => void;
  itineraryRemove?: (index: number) => void;

  factsFields?: Partial<FactData>[];
  factsAppend?: (value: Partial<FactData> | Partial<FactData>[]) => void;
  factsRemove?: (index: number) => void;

  faqFields?: Partial<FaqData>[];
  faqAppend?: (value: Partial<FaqData> | Partial<FaqData>[]) => void;
  faqRemove?: (index: number) => void;

  pricingOptionsFields?: Partial<pricingOptions>[];
  pricingOptionsAppend?: (value: Partial<pricingOptions> | Partial<pricingOptions>[]) => void;
  pricingOptionsRemove?: (index: number) => void;

  dateRangeFields?: Partial<DateRange>[];
  dateRangeAppend?: (value: Partial<DateRange> | Partial<DateRange>[]) => void;
  dateRangeRemove?: (index: number) => void;

  // Data for each section
  categories?: Category;
  facts?: FactData[];
  faq?: FaqData;
  isEditing?: boolean;

  // --- MIGRATED FORM LOGIC ---
  tourId?: string;
  tourData?: unknown;
}

// Create the context
export const TourContext = createContext<TourContextType | undefined>(undefined);
