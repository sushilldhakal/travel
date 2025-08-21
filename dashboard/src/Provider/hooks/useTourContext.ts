import { useContext } from 'react';
import { TourContext, TourContextType } from '../TourContextDefinition';

// Hook for accessing the complete tour context
export const useTourContext = (): TourContextType => {
  const context = useContext(TourContext);
  
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  
  return context;
};

// Simplified hook to access just the form state
export const useTourForm = () => {
  const context = useTourContext();
  return {
    form: context.form,
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
