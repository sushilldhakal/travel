import { UseFormReturn, FieldValues } from 'react-hook-form';
import { JSONContent } from 'novel';
import { Itinerary, FactData, FaqData, pricingOptions, DateRange } from './types';

export interface TourContextType {
  // Editor content state
  editorContent: JSONContent | null;
  setEditorContent: (content: JSONContent | null) => void;
  inclusionsContent: JSONContent | null;
  setInclusionsContent: (content: JSONContent | null) => void;
  exclusionsContent: JSONContent | null;
  setExclusionsContent: (content: JSONContent | null) => void;
  itineraryContent: JSONContent | null;
  setItineraryContent: (content: JSONContent | null) => void;

  // Form handling
  form: UseFormReturn<FieldValues>;
  onSubmit: (values: FieldValues, mutateFunction?: (data: FormData) => void) => Promise<void>;
  isEditing?: boolean;

  // Field arrays
  itineraryFields: Partial<Itinerary>[];
  itineraryAppend: (value: Partial<Itinerary> | Partial<Itinerary>[]) => void;
  itineraryRemove: (index: number) => void;

  factsFields: Partial<FactData>[];
  factsAppend: (value: Partial<FactData> | Partial<FactData>[]) => void;
  factsRemove: (index: number) => void;

  faqFields: Partial<FaqData>[];
  faqAppend: (value: Partial<FaqData> | Partial<FaqData>[]) => void;
  faqRemove: (index: number) => void;

  pricingOptionsFields: Partial<pricingOptions>[];
  pricingOptionsAppend: (value: Partial<pricingOptions> | Partial<pricingOptions>[]) => void;
  pricingOptionsRemove: (index: number) => void;

  dateRangeFields: Partial<DateRange>[];
  dateRangeAppend: (value: Partial<DateRange> | Partial<DateRange>[]) => void;
  dateRangeRemove: (index: number) => void;

  // Helper functions
  handleGenerateCode: () => string;
}
