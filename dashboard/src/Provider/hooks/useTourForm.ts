import { UseFormReturn } from 'react-hook-form';
import { useTourContext } from './useTourContext';
import { Tour as TourFormValues } from '@/Provider/types';

// Returns only the form-related helpers from the unified context
export const useTourForm = () => {
  const context = useTourContext();
  return {
    form: context.form as UseFormReturn<TourFormValues, TourFormValues, TourFormValues>,
    onSubmit: context.onSubmit,
    tripCode: context.tripCode,
    setTripCode: context.setTripCode,
    isEditing: context.isEditing,
    editorContent: context.editorContent,
    setEditorContent: context.setEditorContent,
    inclusionsContent: context.inclusionsContent,
    setInclusionsContent: context.setInclusionsContent,
    exclusionsContent: context.exclusionsContent,
    setExclusionsContent: context.setExclusionsContent,
    itineraryContent: context.itineraryContent,
    setItineraryContent: context.setItineraryContent,
    itineraryFields: context.itineraryFields,
    itineraryAppend: context.itineraryAppend,
    itineraryRemove: context.itineraryRemove,
    factsFields: context.factsFields,
    factsAppend: context.factsAppend,
    factsRemove: context.factsRemove,
    faqFields: context.faqFields,
    faqAppend: context.faqAppend,
    faqRemove: context.faqRemove,
    pricingOptionsFields: context.pricingOptionsFields,
    pricingOptionsAppend: context.pricingOptionsAppend,
    pricingOptionsRemove: context.pricingOptionsRemove,
    dateRangeFields: context.dateRangeFields,
    dateRangeAppend: context.dateRangeAppend,
    dateRangeRemove: context.dateRangeRemove,
    handleGenerateCode: context.handleGenerateCode
  };
};
