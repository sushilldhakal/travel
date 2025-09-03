import React, { useState, useEffect } from 'react';
import { JSONContent } from 'novel';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { getTourWithDefaults } from '../pages/Dashboard/Tours/Components/defaultTourValues';
import makeId from '@/pages/Dashboard/Tours/Components/randomId';
import { TourContext } from './TourContextDefinition';
import { TourContextType } from './TourContextTypes';
import { DateRange, departures, FactData, FaqData, Itinerary, ItineraryItem, pricingOptions, Tour } from './types';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Use tourApi directly to ensure multipart/form-data behavior
import { createTour, getSingleTour, updateTour } from '@/http/tourApi';
import { toast } from '@/components/ui/use-toast';

import { useMutation, useQueryClient } from '@tanstack/react-query';


// Provider props interface
interface TourProviderProps {
  children: React.ReactNode;
  defaultValues?: Partial<Tour>;
  isEditing?: boolean;
}

// The Provider component that manages state and context values
export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  defaultValues,
  isEditing = false,
}) => {
  // Use provided default values or get empty defaults
  const initialValues = defaultValues || getTourWithDefaults({});
  // Editor content state - initialize with null instead of empty object
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null);
  const [inclusionsContent, setInclusionsContent] = useState<JSONContent | null>(null);
  const [exclusionsContent, setExclusionsContent] = useState<JSONContent | null>(null);
  const [itineraryContent, setItineraryContent] = useState<JSONContent | null>(null);
  const queryClient = useQueryClient();

  // Initialize form with initial values
  const form = useForm<Tour & FieldValues>({
    defaultValues: initialValues as Tour & FieldValues
  });

  // Get tour ID from URL params - using a unique variable name to avoid conflicts
  const urlParams = useParams<{ tourId: string }>();
  const currentTourId = urlParams.tourId;
  const navigate = useNavigate();


  // Fetch tour data if in edit mode
  const { data: fetchedTourData, error: tourError } = useQuery<Tour, Error>({
    queryKey: ['tours', currentTourId],
    queryFn: async () => {
      if (!currentTourId) throw new Error('No tour ID provided');
      return getSingleTour(currentTourId);
    },
    enabled: !!currentTourId && isEditing,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  const { mutate: updateTourMutation } = useMutation({
    mutationFn: (formData: FormData) => updateTour(tourId!, formData),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tour updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        variant: "destructive",
        title: "Error updating tour",
        description: error.response?.data?.message || "Failed to update tour",
      });
    },
  });

  const { mutate: createTourMutation } = useMutation({
    mutationFn: (formData: FormData) => createTour(formData),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Tour created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      // Optionally redirect to the edit page
      if (data?.data?.tour?._id) {
        navigate(`/dashboard/tours/edit_tour/${data.data.tour._id}`);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        variant: "destructive",
        title: "Error creating tour",
        description: error.response?.data?.message || "Failed to create tour",
      });
    },
  });

  // Effect to handle successful data fetch
  useEffect(() => {
    if (fetchedTourData) {
      // Extract the actual tour data from the API response wrapper
      const responseData = (fetchedTourData as Record<string, any>).data || fetchedTourData;
      const actualTourData = (responseData as Record<string, any>).tour || responseData;

      // Process special fields before merging
      const processCategories = (categories: unknown) => {
        if (categories === null || categories === undefined) return categories;
        if (typeof categories === 'string') {
          try {
            return JSON.parse(categories);
          } catch (e) {
            return categories;
          }
        }
        if (Array.isArray(categories)) {
          return categories.map((cat: Record<string, unknown>) => ({
            id: cat.value || cat.id,
            name: cat.label || cat.name,
            isActive: !cat.disable
          }));
        }
        return categories;
      };

      const processItinerary = (itinerary: unknown) => {
        if (itinerary === null || itinerary === undefined) return itinerary;
        if (typeof itinerary === 'string') {
          try {
            return JSON.parse(itinerary);
          } catch (e) {
            return itinerary;
          }
        }
        if (Array.isArray(itinerary)) {
          return itinerary.map((item: Record<string, unknown>) => ({
            day: item.day,
            title: item.title,
            description: item.description,
            destination: item.destination || '',
            accommodation: item.accommodation || '',
            meals: item.meals || '',
            activities: item.activities || ''
          }));
        }
        return itinerary;
      };

      const processPricingOptions = (pricingOptions: unknown) => {
        if (pricingOptions === null || pricingOptions === undefined) return pricingOptions;
        if (Array.isArray(pricingOptions)) {
          return pricingOptions.map((option: unknown, index: number) => {
            const opt = option as Record<string, any>;
            return {
              id: opt.id || `pricing_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
              name: opt.name || '',
              category: opt.category || 'adult',
              customCategory: opt.customCategory || '',
              price: opt.price || 0,
              paxRange: {
                minPax: opt.paxRange?.minPax || opt.paxRange?.from || opt.minPax || 1,
                maxPax: opt.paxRange?.maxPax || opt.paxRange?.to || opt.maxPax || 10
              },
              minPax: opt.paxRange?.from || opt.minPax || 1,
              maxPax: opt.paxRange?.to || opt.maxPax || 10,
              discount: {
                discountEnabled: opt.discount?.discountEnabled || opt.discountEnabled || false,
                percentageOrPrice: opt.discount?.percentageOrPrice || opt.percentageOrPrice || false,
                discountPercentage: opt.discount?.discountPercentage || opt.discountPercentage || 0,
                discountPrice: opt.discount?.discountPrice || opt.discountPrice || 0,
                dateRange: opt.discount?.discountDateRange ? {
                  from: new Date(opt.discount.discountDateRange.from),
                  to: new Date(opt.discount.discountDateRange.to)
                } : (opt.discountDateRange ? {
                  from: new Date(opt.discountDateRange.from),
                  to: new Date(opt.discountDateRange.to)
                } : { from: new Date(), to: new Date() })
              }
            };
          });
        }
        return pricingOptions;
      };

      // Process tour dates from server response
      const processTourDates = (tourDates: any) => {
            
        if (!tourDates) return undefined;
        
        const processedDates = {
          days: tourDates.days || 0,
          nights: tourDates.nights || 0,
          scheduleType: tourDates.scheduleType || 'flexible',
          pricingCategory: Array.isArray(tourDates.pricingCategory) 
            ? tourDates.pricingCategory 
            : (tourDates.pricingCategory ? [tourDates.pricingCategory] : []),
          isRecurring: Boolean(tourDates.isRecurring),
          recurrencePattern: tourDates.recurrencePattern || 'weekly',
          recurrenceInterval: tourDates.recurrenceInterval || 1,
          recurrenceEndDate: tourDates.recurrenceEndDate ? new Date(tourDates.recurrenceEndDate) : undefined,
          // Process defaultDateRange for fixed dates
          dateRange: tourDates.defaultDateRange ? {
            from: new Date(tourDates.defaultDateRange.from),
            to: new Date(tourDates.defaultDateRange.to)
          } : undefined,
          // Process departures array for multiple departure dates
          departures: Array.isArray(tourDates.departures) ? tourDates.departures.map((dep: any) => {
                  
            return {
              id: dep.id || crypto.randomUUID(),
              label: dep.label || 'Departure',
              dateRange: dep.dateRange ? {
                from: new Date(dep.dateRange.from),
                to: new Date(dep.dateRange.to)
              } : undefined,
              days: dep.days || 0,
              nights: dep.nights || 0,
              isRecurring: Boolean(dep.isRecurring),
              recurrencePattern: dep.recurrencePattern || undefined,
              recurrenceInterval: dep.recurrenceInterval || undefined,
              recurrenceEndDate: dep.recurrenceEndDate ? new Date(dep.recurrenceEndDate) : undefined,
              pricingCategory: Array.isArray(dep.selectedPricingOptions) 
                ? dep.selectedPricingOptions 
                : (Array.isArray(dep.pricingCategory) 
                  ? dep.pricingCategory 
                  : (dep.pricingCategory ? [dep.pricingCategory] : [])),
              capacity: dep.capacity || undefined
            };
          }) : []
        };
        
            return processedDates;
      };

      const processedTourData = {
        ...actualTourData,
        category: processCategories(actualTourData.category),
        itinerary: processItinerary(actualTourData.itinerary),
        pricingOptions: processPricingOptions(actualTourData.pricingOptions),
        // Process tour dates from server
        dates: processTourDates(actualTourData.tourDates),
        include: Array.isArray(actualTourData.include) && actualTourData.include.length > 0
          ? JSON.parse(actualTourData.include[0])
          : actualTourData.include,
        exclude: Array.isArray(actualTourData.exclude) && actualTourData.exclude.length > 0
          ? JSON.parse(actualTourData.exclude[0])
          : actualTourData.exclude,
        // Transform facts from API format to form format
        facts: Array.isArray(actualTourData.facts)
          ? actualTourData.facts.map((fact: any) => {
            return {
              title: fact.title || fact.name || '',
              field_type: fact.field_type || 'Plain Text',
              value: fact.value || '',
              icon: fact.icon || ''
            };
          })
          : actualTourData.facts,
        // Transform pricing structure to match form expectations
        pricing: {
          price: actualTourData.price || 0,
          pricePerPerson: actualTourData.pricePerPerson !== undefined ? actualTourData.pricePerPerson : true,
          minSize: actualTourData.minSize || 1,
          maxSize: actualTourData.maxSize || 10,
          pricingOptionsEnabled: actualTourData.pricingOptionsEnabled || false,
          // Map server discount data to form structure
          discount: {
            discountEnabled: actualTourData.discount?.discountEnabled || false,
            isActive: actualTourData.discount?.isActive || false,
            percentageOrPrice: actualTourData.discount?.percentageOrPrice || false,
            discountPercentage: actualTourData.discount?.discountPercentage || 0,
            discountPrice: actualTourData.discount?.discountPrice || 0,
            discountCode: actualTourData.discount?.discountCode || '',
            maxDiscountAmount: actualTourData.discount?.maxDiscountAmount || 0,
            description: actualTourData.discount?.description || '',
            dateRange: actualTourData.discount?.discountDateRange || actualTourData.discountDateRange || { from: new Date(), to: new Date() }
          },
          // Map price lock date from server
          priceLockedUntil: actualTourData.priceLockDate ? new Date(actualTourData.priceLockDate) : undefined
        },
        // Move pricingOptions to top level to match new structure
        pricingOptions: processPricingOptions(actualTourData.pricingOptions)
      };


      // Use getTourWithDefaults with the processed tour data
      const mergedData = getTourWithDefaults(processedTourData);

      form.reset(mergedData);


      // Update editor content if available
      if (processedTourData.description) {
        try {
          const description = typeof processedTourData.description === 'string'
            ? JSON.parse(processedTourData.description)
            : processedTourData.description;
          setEditorContent(description);

        } catch (e) {
          console.error('❌ Error parsing description:', e);
          setEditorContent({});
        }
      }
      if (processedTourData.include) {
        try {
          const include = typeof processedTourData.include === 'string'
            ? JSON.parse(processedTourData.include)
            : processedTourData.include;
          setInclusionsContent(include);
        } catch (e) {
          console.error('Error parsing include:', e);
          setInclusionsContent({});
        }
      }
      if (processedTourData.exclude) {
        try {
          const exclude = typeof processedTourData.exclude === 'string'
            ? JSON.parse(processedTourData.exclude)
            : processedTourData.exclude;
          setExclusionsContent(exclude);
        } catch (e) {
          console.error('Error parsing exclusions:', e);
          setExclusionsContent({});
        }
      }
    }
  }, [fetchedTourData, form]);

  // Handle tour loading errors
  useEffect(() => {
    if (tourError) {
      console.error('Error loading tour:', tourError);
      toast({
        title: 'Error',
        description: 'Failed to load tour data',
        variant: 'destructive',
      });
    }
  }, [tourError]);

  // Set up field arrays for dynamic form fields
  // These will be populated after the form is reset with the API data
  const {
    fields: itineraryFields,
    append: itineraryAppend,
    remove: itineraryRemove,
  } = useFieldArray({
    control: form.control,
    name: 'itinerary.options' as any,
  });

  const {
    fields: factsFields,
    append: factsAppend,
    remove: factsRemove,
  } = useFieldArray({
    control: form.control,
    name: 'facts',
  });

  const {
    fields: faqFields,
    append: faqAppend,
    remove: faqRemove,
  } = useFieldArray({
    control: form.control,
    name: 'faqs',
  });

  const {
    fields: pricingOptionsFields,
    append: pricingOptionsAppend,
    remove: pricingOptionsRemove,
  } = useFieldArray({
    control: form.control,
    name: 'pricingOptions' as any,
  });

  const {
    fields: dateRangeFields,
    append: dateRangeAppend,
    remove: dateRangeRemove,
  } = useFieldArray({
    control: form.control,
    name: 'dates.departures',
  });

  // Helper function to generate code
  const handleGenerateCode = () => {
    const generatedCode = makeId(6);
    form.setValue('code', generatedCode);
    return generatedCode;
  };

  // Create type-safe wrapper functions to handle the field array operations
  // This allows us to provide proper type safety while maintaining compatibility
  const appendItinerary = (value: Partial<ItineraryItem> | Partial<ItineraryItem>[]) => {
    const processItem = (item: Partial<ItineraryItem>): ItineraryItem => {
      const processedItem = { ...item };
      // Ensure required fields have default values
      if (!processedItem.day) processedItem.day = '';
      if (!processedItem.title) processedItem.title = '';
      if (!processedItem.description) processedItem.description = '';
      if (!processedItem.destination) processedItem.destination = '';
      if (!processedItem.dateTime) processedItem.dateTime = new Date();
      return processedItem as ItineraryItem;
    };

    if (Array.isArray(value)) {
      value.forEach((v: Partial<ItineraryItem>) => itineraryAppend(processItem(v)));
    } else {
      itineraryAppend(processItem(value));
    }
  };

  const appendFacts = (data: Partial<FactData> | Partial<FactData>[]) => {
    const processItem = (item: Partial<FactData>) => {
      // Create a new object with required fields
      return {
        title: item.title || '',
        icon: item.icon || 'info',
        value: item.value || ''
      } as FactData;
    };

    if (Array.isArray(data)) {
      data.forEach(item => factsAppend(processItem(item)));
    } else {
      factsAppend(processItem(data));
    }
  };

  const appendFaq = (data: Partial<FaqData> | Partial<FaqData>[]) => {
    const processItem = (item: Partial<FaqData>) => {
      const processedItem = { ...item };
      // Ensure required fields have default values
      if (!processedItem.question) processedItem.question = '';
      if (!processedItem.answer) processedItem.answer = '';
      return processedItem as FaqData;
    };

    if (Array.isArray(data)) {
      data.forEach(item => faqAppend(processItem(item)));
    } else {
      faqAppend(processItem(data));
    }
  };

  const appendPricingOptions = (data: Partial<pricingOptions> | Partial<pricingOptions>[]) => {
    const processItem = (item: Partial<pricingOptions>) => {
      const processedItem = { ...item };
      // Ensure required fields have default values
      if (!processedItem.name) processedItem.name = '';
      if (!processedItem.category) processedItem.category = 'adult';
      if (!processedItem.customCategory) processedItem.customCategory = '';
      if (!processedItem.price) processedItem.price = 0;
      if (!processedItem.discount) {
        processedItem.discount = {
          discountEnabled: false,
          isActive: false,
          percentageOrPrice: false,
          discountPercentage: 0,
          discountPrice: 0,
          description: '',
          discountCode: '',
          maxDiscountAmount: 0,
          dateRange: { from: undefined, to: undefined }
        } as any;
      }
      if (!processedItem.paxRange) processedItem.paxRange = { minPax: 1, maxPax: 10 };
      return processedItem as pricingOptions;
    };

    if (Array.isArray(data)) {
      data.forEach(item => pricingOptionsAppend(processItem(item)));
    } else {
      pricingOptionsAppend(processItem(data));
    }
  };

  const appendDateRange = (data: Partial<departures> | Partial<departures>[]) => {
    const processItem = (item: Partial<departures>) => {
      const now = new Date();
      const toDate = new Date();
      toDate.setDate(now.getDate() + 7);

      // Create a proper departures object with all required fields
      const departure: departures = {
        id: item.id || makeId(),
        label: item.label || 'New Departure',
        dateRange: {
          from: item.dateRange?.from ? new Date(item.dateRange.from) : now,
          to: item.dateRange?.to ? new Date(item.dateRange.to) : toDate,
        },
        isRecurring: item.isRecurring || false,
        recurrencePattern: item.isRecurring ?
          (item.recurrencePattern || "weekly") : undefined,
        recurrenceEndDate: item.isRecurring ?
          (item.recurrenceEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1))) : undefined,
        // Only include capacity if it exists
        ...(item.capacity !== undefined ? { capacity: item.capacity } : {})
      };

      return departure;
    };

    if (Array.isArray(data)) {
      data.forEach(item => dateRangeAppend(processItem(item)));
    } else {
      dateRangeAppend(processItem(data));
    }
  };

  // Get tourId from params (if editing)
  const { tourId } = useParams();
  // fetchedTourData is now used instead of tourData

  // Helper: recursively process values to remove functions, etc.
  const processValue = (value: unknown): unknown => {
    if (value === null || value === undefined) return value;
    if (typeof value === "function") {
      if (value === String) return "";
      if (value === Number) return 0;
      if (value === Boolean) return false;
      if (value === Date) return new Date();
      if (value === Array) return [];
      if (value === Object) return {};
      return null;
    }
    if (Array.isArray(value)) return value.map(processValue);
    if (typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = processValue((value as Record<string, unknown>)[key]);
        }
      }
      return result;
    }
    return value;
  };

  // Helper: check if a field has changed
  const hasChanged = (key: string, newValue: unknown): boolean => {
    const originalTour = fetchedTourData || getTourWithDefaults({});

    // Special handling for gallery
    if (key === 'gallery') {
      return JSON.stringify(newValue) !== JSON.stringify(originalTour.gallery);
    }

    const parts = key.split(".");
    let origValue: unknown = originalTour;
    for (const part of parts) {
      if (origValue === null || origValue === undefined) {
        return true;
      }
      origValue = (origValue as Record<string, unknown>)[part];
    }
    if (origValue === undefined) return newValue !== undefined;
    if (Array.isArray(newValue)) {
      return (
        origValue === undefined ||
        !Array.isArray(origValue) ||
        origValue.length !== newValue.length ||
        JSON.stringify(origValue) !== JSON.stringify(newValue)
      );
    }
    if (typeof newValue === "object" && newValue !== null) {
      if (newValue instanceof Date) {
        return !(origValue instanceof Date) || (origValue as Date).getTime() !== (newValue as Date).getTime();
      }
      return JSON.stringify(origValue) !== JSON.stringify(newValue);
    }
    return origValue !== newValue;
  };

  // Helper: should a field be included in the submit
  const shouldIncludeField = (field: string, value: unknown, isCreating: boolean) => {

    // Always include gallery field if it has values
    if (field === 'gallery' && Array.isArray(value) && value.length > 0) {
      return true;
    }

    const shouldInclude = isCreating || hasChanged(field, value);
    return shouldInclude;
  };

  // Main onSubmit handler
  const onSubmit = async (values: FieldValues, mutateFunction?: (data: FormData) => void) => {


    // Update the mutate function to handle both create and update
    const mutate = mutateFunction || ((data: FormData) => {

      // Create an object to more easily visualize the form data structure
      const formDataObj: Record<string, any> = {};
      for (const [key, value] of data.entries()) {
        // Try to parse JSON strings for better visualization
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try {
            formDataObj[key] = JSON.parse(value);
          } catch (e) {
            formDataObj[key] = value;
          }
        } else {
          formDataObj[key] = value;
        }
      }

      if (isEditing && tourId) {
        return updateTourMutation(data);
      } else {
        return createTourMutation(data);
      }
    });

    const formData = new FormData();
    const processedValues = processValue(values) as Record<string, unknown>;
    const isCreating = !tourId;
    const originalTour = fetchedTourData || getTourWithDefaults({});

    const topLevelFields = [
      "title", "code", "excerpt", "description", "tourStatus", "coverImage", "file", "outline-solid", "include", "exclude", "map", "destination", "gallery"
    ];
    formData.append("id", tourId || "");
    let changedFieldCount = 0;
    topLevelFields.forEach((field) => {
      if (processedValues[field] !== undefined && shouldIncludeField(field, processedValues[field], isCreating)) {
        changedFieldCount++;

        // Handle special fields
        if (field === "description" && editorContent) {
          formData.append(field, JSON.stringify(editorContent));
        } else if (field === "include" && inclusionsContent) {
          formData.append(field, JSON.stringify(inclusionsContent));
        } else if (field === "exclude" && exclusionsContent) {
          formData.append(field, JSON.stringify(exclusionsContent));
        } else if (field === "gallery") {
          // Handle gallery data
          const galleryData = processedValues[field];
          if (Array.isArray(galleryData)) {
            // Process gallery items to make them server-compatible
            const processedGallery = galleryData.map(item => {
              // If it's a string, just return it
              if (typeof item === 'string') {
                return item;
              }

              // For objects, create a clean version without temporary properties
              const cleanItem = { ...item };

              // Remove client-side temporary ID if it exists
              if (cleanItem.tempId) {
                delete cleanItem.tempId;
              }

              // Only include _id if it's a valid MongoDB ObjectId (24 chars)
              if (cleanItem._id && (typeof cleanItem._id !== 'string' || cleanItem._id.length !== 24)) {
                delete cleanItem._id;
              }

              return cleanItem;
            });

            formData.append('gallery', JSON.stringify(processedGallery));
          }
        } else if (field === "file") {
          const fileValue = processedValues.file;
          if (Array.isArray(fileValue) && fileValue.length > 0) {
            formData.append(field, String(fileValue[0] || ""));
          } else {
            formData.append(field, String(fileValue || ""));
          }
        } else {
          formData.append(field, String(processedValues[field] || ""));
        }
      }
    });

    if (values.facts && hasChanged('facts', values.facts)) {
      changedFieldCount++;
      formData.append("facts", JSON.stringify(values.facts));
    }

    // Handle FAQs if present
    if (values.faqs && hasChanged('faqs', values.faqs)) {
      changedFieldCount++;
      formData.append("faqs", JSON.stringify(values.faqs));
    }

    // Handle discount fields separately - backend expects individual fields, not a JSON object
    // Prioritize pricing.discount over direct discount field as it contains the correct UI values
    const discountData = values.pricing?.discount || values.discount;

    if (discountData) {
      changedFieldCount++;

      // Send individual discount fields instead of a JSON object
      if (discountData.discountEnabled !== undefined) {
        formData.append("discountEnabled", String(discountData.discountEnabled));
      }
      if (discountData.discountPrice !== undefined) {
        formData.append("discountPrice", String(discountData.discountPrice));
      }
      if (discountData.dateRange) {
        formData.append("discountDateRange", JSON.stringify(discountData.dateRange));
      }
    }



  // Helper function to calculate days and nights from date range
  const calculateDaysNights = (dateRange: { from: Date; to: Date }) => {
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      nights: Math.max(0, diffDays - 1)
    };
  };

  // Process dates data with automatic days/nights calculation
  if (shouldIncludeField('dates', values.dates, isCreating)) {
    console.log('🔍 Processing dates data:', values.dates);
    console.log('🔍 Raw dateRange from form:', values.dates?.dateRange);
    console.log('🔍 Schedule type:', values.dates?.scheduleType);
    changedFieldCount++;
    
    const datesData = values.dates || {};
    let calculatedDays: number | undefined;
    let calculatedNights: number | undefined;

    // Calculate days/nights based on schedule type - handle both new and legacy data structures
    if (datesData.scheduleType === 'flexible') {
      // For flexible dates, use manually entered days/nights
      calculatedDays = datesData.days ? Number(datesData.days) : undefined;
      calculatedNights = datesData.nights ? Number(datesData.nights) : undefined;
    } else if (datesData.scheduleType === 'fixed' && datesData.dateRange) {
      // For fixed dates, calculate from date range
      const dateRange = {
        from: new Date(datesData.dateRange.from),
        to: new Date(datesData.dateRange.to)
      };
      const calculated = calculateDaysNights(dateRange);
      calculatedDays = calculated.days;
      calculatedNights = calculated.nights;
      console.log('🔢 Calculated from fixed date range:', { days: calculatedDays, nights: calculatedNights });
    } else if (datesData.scheduleType === 'multiple' && Array.isArray(datesData.departures) && datesData.departures.length > 0) {
      // For multiple departures, calculate from first departure's date range
      const firstDeparture = datesData.departures[0];
      if (firstDeparture?.dateRange) {
        const dateRange = {
          from: new Date(firstDeparture.dateRange.from),
          to: new Date(firstDeparture.dateRange.to)
        };
        const calculated = calculateDaysNights(dateRange);
        calculatedDays = calculated.days;
        calculatedNights = calculated.nights;
        console.log('🔢 Calculated from multiple departures:', { days: calculatedDays, nights: calculatedNights });
      }
    } else {
      // Fallback: use existing days/nights values if available
      calculatedDays = datesData.days ? Number(datesData.days) : undefined;
      calculatedNights = datesData.nights ? Number(datesData.nights) : undefined;
      console.log('🔄 Using existing days/nights values:', { days: calculatedDays, nights: calculatedNights });
    }
    
    // Create formatted dates object
    const formattedDates = {
      scheduleType: datesData.scheduleType || 'flexible',
      days: calculatedDays,
      nights: calculatedNights,
      dateRange: datesData.dateRange ? {
        from: new Date(datesData.dateRange.from),
        to: new Date(datesData.dateRange.to)
      } : undefined,
      isRecurring: Boolean(datesData.isRecurring),
      recurrencePattern: datesData.recurrencePattern || undefined,
      recurrenceInterval: datesData.recurrenceInterval ? Number(datesData.recurrenceInterval) : undefined,
      recurrenceEndDate: datesData.recurrenceEndDate ? new Date(datesData.recurrenceEndDate) : undefined,
      pricingCategory: datesData.pricingCategory || undefined,
      departures: Array.isArray(datesData.departures) ? datesData.departures.map((departure: any) => {
        // Calculate days/nights for each departure
        let depDays: number | undefined;
        let depNights: number | undefined;
        
        if (departure.dateRange) {
          const depDateRange = {
            from: new Date(departure.dateRange.from),
            to: new Date(departure.dateRange.to)
          };
          const calculated = calculateDaysNights(depDateRange);
          depDays = calculated.days;
          depNights = calculated.nights;
        }

        return {
          id: departure.id || crypto.randomUUID(),
          label: departure.label || 'Departure',
          dateRange: departure.dateRange ? {
            from: new Date(departure.dateRange.from),
            to: new Date(departure.dateRange.to)
          } : undefined,
          days: depDays,
          nights: depNights,
          isRecurring: Boolean(departure.isRecurring),
          recurrencePattern: departure.recurrencePattern || undefined,
          recurrenceInterval: departure.recurrenceInterval ? Number(departure.recurrenceInterval) : undefined,
          recurrenceEndDate: departure.recurrenceEndDate ? new Date(departure.recurrenceEndDate) : undefined,
          pricingCategory: departure.pricingCategory || undefined,
          capacity: departure.capacity ? Number(departure.capacity) : undefined
        };
      }) : []
    };

    console.log('🎯 Formatted dates being sent to server:', formattedDates);
    formData.append("dates", JSON.stringify(formattedDates));
  }

  // Process pricing data and ensure minSize and maxSize are sent under pricing object
    if (shouldIncludeField('price', values.price, isCreating) ||
      shouldIncludeField('minSize', values.minSize, isCreating) ||
      shouldIncludeField('maxSize', values.maxSize, isCreating) ||
      shouldIncludeField('discountEnabled', values.discountEnabled, isCreating) ||
      shouldIncludeField('priceLockedUntil', values.pricing?.priceLockedUntil, isCreating)) {
      changedFieldCount++;

      // First, determine where to get minSize and maxSize from
      // Try to get values from the form, then from the pricing object, then use defaults
      let minSizeValue = 1;
      let maxSizeValue = 10;

      // Check if values exist directly on the form
      if (values.minSize !== undefined && values.minSize !== null) {
        minSizeValue = Number(values.minSize);
      }
      // Otherwise check if values exist in the pricing object
      else if (values.pricing?.minSize !== undefined && values.pricing.minSize !== null) {
        minSizeValue = Number(values.pricing.minSize);
      }

      // Same for maxSize
      if (values.maxSize !== undefined && values.maxSize !== null) {
        maxSizeValue = Number(values.maxSize);
      }
      else if (values.pricing?.maxSize !== undefined && values.pricing.maxSize !== null) {
        maxSizeValue = Number(values.pricing.maxSize);
      }


      // Create a pricing object to bundle all pricing-related data
      const pricingObject: {
        price: number;
        originalPrice: number;
        basePrice: number;
        minSize: number;
        maxSize: number;
        discountEnabled: boolean;
        discountPrice: number;
        pricePerPerson: boolean;
        priceLockDate?: Date;
        discountDateRange?: {
          from: Date;
          to: Date;
        };
      } = {
        // Basic pricing fields
        price: Number(values.price) || 0,
        originalPrice: Number(values.originalPrice) || 0,
        basePrice: Number(values.basePrice) || 0,

        // Include minSize and maxSize under pricing object
        minSize: minSizeValue,
        maxSize: maxSizeValue,

        // Discount fields - use pricing.discount data as it contains the correct UI values
        discountEnabled: Boolean(values.pricing?.discount?.discountEnabled || values.discountEnabled),
        discountPrice: Number(values.pricing?.discount?.discountPrice || values.discountPrice || 0),

        // Pricing type
        pricePerPerson: values.pricing?.pricePerPerson !== undefined ? Boolean(values.pricing.pricePerPerson) : true
      };

      // Add price lock date if available
      if (values.pricing?.priceLockedUntil) {
        pricingObject.priceLockDate = new Date(values.pricing.priceLockedUntil);
      }

      // Also add discount date range if available
      const discountForDates = values.pricing?.discount;
      if (discountForDates?.dateRange) {
        const fromDate = discountForDates.dateRange.from ? new Date(discountForDates.dateRange.from) : new Date();
        const toDate = discountForDates.dateRange.to ? new Date(discountForDates.dateRange.to) : new Date();

        pricingObject.discountDateRange = {
          from: !isNaN(fromDate.getTime()) ? fromDate : new Date(),
          to: !isNaN(toDate.getTime()) ? toDate : new Date()
        };
      }


      // Append the pricing object to formData
      formData.append("pricing", JSON.stringify(pricingObject));

      // Also append individual fields for backward compatibility
      formData.append("price", String(Number(values.price) || 0));
      formData.append("minSize", String(Number(values.minSize) || 1));
      formData.append("maxSize", String(Number(values.maxSize) || 10));
      formData.append("pricePerPerson", String(Boolean(pricingObject.pricePerPerson)));
      if (values.discountEnabled !== undefined) {
        formData.append("discountEnabled", String(Boolean(values.discountEnabled)));
      }
    }



    // Use individual form fields for pricing options (like we did for main pricing)
    if (values.pricingOptions && Array.isArray(values.pricingOptions) && values.pricingOptions.length > 0) {
      // Log the raw pricing options for debugging

      const flatPricingOptions = values.pricingOptions.map((option: any, index: number) => {
        // Generate unique ID for each pricing option
        const optionId = option.id || `option_${Date.now()}_${index}`;

        // Use individual pricing option discount data (not main discount)
        const optionDiscount = option.discount;
        const hasOptionDiscount = optionDiscount && optionDiscount.discountEnabled;

        // Get pax range values - handle different possible paxRange formats
        // Start with user-specified values if already present
        let minPax = option.minPax ? Number(option.minPax) : 1;
        let maxPax = option.maxPax ? Number(option.maxPax) : 22;

        // Extract from paxRange array if available
        if (Array.isArray(option.paxRange)) {
          if (option.paxRange[0] !== undefined && option.paxRange[0] !== null) {
            minPax = Number(option.paxRange[0]) || minPax;
          }
          if (option.paxRange[1] !== undefined && option.paxRange[1] !== null) {
            maxPax = Number(option.paxRange[1]) || maxPax;
          }
        }
        // Extract from paxRange object if available
        else if (option.paxRange && typeof option.paxRange === 'object') {
          if (option.paxRange.from !== undefined) {
            minPax = Number(option.paxRange.from) || minPax;
          }
          if (option.paxRange.to !== undefined) {
            maxPax = Number(option.paxRange.to) || maxPax;
          }
        }

        return {
          id: optionId, // Add unique ID for pricing option
          name: option.name || "",
          category: option.category || "adult",
          customCategory: option.customCategory || "",
          price: option.price ? Number(option.price) : 0,
          // Send discount as nested object to match server schema
          discount: hasOptionDiscount ? {
            discountEnabled: true,
            discountPrice: optionDiscount.discountPrice ? Number(optionDiscount.discountPrice) : 0,
            discountDateRange: optionDiscount.dateRange ? {
              from: new Date(optionDiscount.dateRange.from),
              to: new Date(optionDiscount.dateRange.to)
            } : undefined,
            percentageOrPrice: Boolean(optionDiscount.percentageOrPrice),
            discountPercentage: optionDiscount.percentageOrPrice ? Number(optionDiscount.discountPercentage) : undefined,
          } : {
            discountEnabled: false
          },
          // Send both paxRange object and individual minPax/maxPax fields
          paxRange: {
            from: minPax,
            to: maxPax
          },
          // Add explicit minPax and maxPax fields
          minPax: minPax,
          maxPax: maxPax
        };
      });

      // Pricing options are enabled if we have any
      const pricingOptionsEnabled = true;

      formData.append("pricingOptions", JSON.stringify(flatPricingOptions));
      formData.append("pricingOptionsEnabled", String(pricingOptionsEnabled));
    }


    // Handle boolean fields - only if they changed
    ['enquiry', 'features'].forEach(key => {

      // Use shouldIncludeField instead of hasChanged for creation mode
      if (values[key] !== undefined && shouldIncludeField(key, values[key], isCreating)) {
        changedFieldCount++;
        const boolValue = values[key] ? "true" : "false";
        formData.append(key, boolValue);
      }
    });
    // Handle category if present
    if (values.category && Array.isArray(values.category) && hasChanged('category', values.category)) {
      changedFieldCount++;
      // Process the category array to ensure each item has proper string values
      const formattedCategory = values.category.map((item: {
        id?: string;
        name?: string;
        label?: string;
        value?: string;
        categoryId?: string | (() => string);
        categoryName?: string | (() => string);
        disable?: boolean;
        isActive?: boolean;
      }) => ({
        categoryId: typeof item.categoryId === 'function' ? item.categoryId() :
          item.categoryId || item.id || item.value || '',
        categoryName: typeof item.categoryName === 'function' ? item.categoryName() :
          item.categoryName || item.name || item.label || '',
        disable: Boolean(item.disable || !item.isActive)
      }));
      formData.append("category", JSON.stringify(formattedCategory));
    }

    // Handle itinerary if present

    if (values.itinerary !== undefined && shouldIncludeField('itinerary', values.itinerary, isCreating)) {
      changedFieldCount++;

      // Handle itinerary structure - it might be { options: [...] } or just [...]
      let itineraryItems = [];

      // Check for options property FIRST (even if it's also an array)
      if (values.itinerary && typeof values.itinerary === 'object' && Array.isArray(values.itinerary.options)) {
        // If it has options property, use that
        itineraryItems = values.itinerary.options;
      } else if (Array.isArray(values.itinerary)) {
        // If it's a direct array, use it
        itineraryItems = values.itinerary;
      } else if (values.itinerary && values.itinerary.length !== undefined) {
        // If it looks like an array-like object, try to convert
        itineraryItems = Array.from(values.itinerary);
      }

      // Ensure all itinerary items have proper data types
      const formattedItinerary = itineraryItems.map((item) => {
        return {
          day: item.day || '',
          title: typeof item.title === 'string' ? item.title : String(item.title || ''),
          description: typeof item.description === 'string' ? item.description : String(item.description || ''),
          dateTime: item.dateTime instanceof Date ? item.dateTime : new Date(),
          destination: item.destination || '',
        };
      });

      formData.append("itinerary", JSON.stringify(formattedItinerary));
    }
    // Handle location if present
    if (processedValues.location && shouldIncludeField("location", processedValues.location, isCreating)) {
      changedFieldCount++;
      const locationData = processedValues.location as Record<string, unknown>;
      const fullLocation = {
        map: locationData.map || originalTour.location?.map || "",
        zip: locationData.zip || originalTour.location?.zip || "",
        street: locationData.street || originalTour.location?.street || "",
        city: locationData.city || originalTour.location?.city || "",
        state: locationData.state || originalTour.location?.state || "",
        country: locationData.country || originalTour.location?.country || "",
        lat: locationData.lat?.toString() || "0",
        lng: locationData.lng?.toString() || "0",
      };
      formData.append("location", JSON.stringify(fullLocation));
    }
    // Call mutate (API) if there are changed fields
    if (changedFieldCount > 0) {
      mutate(formData);
    }
  };


  // Create the context value object
  const contextValue: TourContextType = {
    editorContent,
    setEditorContent,
    inclusionsContent,
    setInclusionsContent,
    exclusionsContent,
    setExclusionsContent,
    itineraryContent,
    setItineraryContent,
    form,
    onSubmit,
    // Field arrays with proper type handling
    itineraryFields: itineraryFields as Partial<Itinerary>[],
    itineraryAppend: appendItinerary,
    itineraryRemove,

    factsFields: factsFields as Partial<FactData>[],
    factsAppend: appendFacts,
    factsRemove,

    faqFields: faqFields as Partial<FaqData>[],
    faqAppend: appendFaq,
    faqRemove,

    pricingOptionsFields: pricingOptionsFields as Partial<pricingOptions>[],
    pricingOptionsAppend: appendPricingOptions,
    pricingOptionsRemove,

    dateRangeFields: dateRangeFields as Partial<DateRange>[],
    dateRangeAppend: appendDateRange as (value: Partial<DateRange> | Partial<DateRange>[]) => void,
    dateRangeRemove,

    // Helper functions
    handleGenerateCode,
    isEditing,
  };


  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
};

export default TourProvider;

