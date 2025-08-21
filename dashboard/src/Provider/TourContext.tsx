import React, { useState, useEffect } from 'react';
import { JSONContent } from 'novel';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { getTourWithDefaults } from '../pages/Dashboard/Tours/Components/defaultTourValues';
import makeId from '@/pages/Dashboard/Tours/Components/randomId';
import { TourContext } from './TourContextDefinition';
import { TourContextType } from './TourContextTypes';
import { DateRange, departures, FactData, FaqData, Itinerary, ItineraryItem, pricingOptions, Tour } from './types';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Use tourApi directly to ensure multipart/form-data behavior
import { createTour, getSingleTour, updateTour } from '@/http/tourApi';
import { toast } from '@/components/ui/use-toast';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';


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


  // Fetch tour data if in edit mode
  const { data: fetchedTourData, error: tourError, isLoading: isFetchingTour } = useQuery<Tour, Error>({
    queryKey: ['tours', currentTourId],
    queryFn: async () => {
      if (!currentTourId) throw new Error('No tour ID provided');
      return getSingleTour(currentTourId);
    },
    enabled: !!currentTourId && isEditing,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  const { mutate: updateTourMutation, isPending: isUpdating } = useMutation({
    mutationFn: (formData: FormData) => updateTour(tourId!, formData),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tour updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating tour",
        description: error.response?.data?.message || "Failed to update tour",
      });
    },
  });

  const { mutate: createTourMutation, isPending: isCreating } = useMutation({
    mutationFn: (formData: FormData) => createTour(formData),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Tour created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      // Optionally redirect to the edit page
      if (data?.tour?._id) {
        navigate(`/dashboard/tours/edit_tour/${data.tour._id}`);
      }
    },
    onError: (error: any) => {
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
      const responseData = (fetchedTourData as any).data || fetchedTourData;
      const actualTourData = responseData.tour || responseData;

      // Process special fields before merging
      const processedTourData = {
        ...actualTourData,
        // Transform category from API format {label, value, disable} to form format {id, name, isActive}
        category: Array.isArray(actualTourData.category)
          ? actualTourData.category.map((cat: any) => ({
            id: cat.value || cat.id,
            name: cat.label || cat.name,
            isActive: !cat.disable
          }))
          : actualTourData.category,
        // Transform itinerary from API format (flat array) to form format (nested object with options)
        itinerary: Array.isArray(actualTourData.itinerary)
          ? {
            options: actualTourData.itinerary.map((item: any) => ({
              day: item.day,
              title: item.title,
              description: item.description,
              destination: item.destination || '',
              accommodation: item.accommodation || '',
              meals: item.meals || '',
              activities: item.activities || ''
            }))
          }
          : actualTourData.itinerary,
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
          pricingOptionsEnabled: actualTourData.pricingOptionsEnabled || false,
          pricingOptions: Array.isArray(actualTourData.pricingOptions) 
            ? actualTourData.pricingOptions.map((option: any) => ({
                id: option.id || Date.now().toString(),
                name: option.name || '',
                category: option.category || 'adult',
                customCategory: option.customCategory || '',
                price: option.price || 0,
                discount: {
                  discountEnabled: option.discountEnabled || false,
                  isActive: option.discount?.isActive || false,
                  percentageOrPrice: option.discount?.percentageOrPrice || false,
                  percentage: option.discount?.percentage || 0,
                  discountPrice: option.discount?.discountPrice || 0,
                  discountCode: option.discount?.discountCode || '',
                  maxDiscountAmount: option.discount?.maxDiscountAmount || 0,
                  description: option.discount?.description || '',
                  dateRange: option.discount?.dateRange || { from: new Date(), to: new Date() }
                },
                paxRange: Array.isArray(option.paxRange) ? option.paxRange : [1, 10]
              }))
            : [],
          discount: {
            discountEnabled: actualTourData.discountEnabled || false,
            isActive: actualTourData.discount?.isActive || false,
            percentageOrPrice: actualTourData.discount?.percentageOrPrice || false,
            percentage: actualTourData.discount?.percentage || 0,
            discountPrice: actualTourData.discountPrice || 0,
            discountCode: actualTourData.discount?.discountCode || '',
            maxDiscountAmount: actualTourData.discount?.maxDiscountAmount || 0,
            description: actualTourData.discount?.description || '',
            dateRange: actualTourData.discountDateRange || { from: new Date(), to: new Date() }
          }
        }
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
          console.log('✅ Description editor content set');

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
          console.log('Set inclusions content:', include);
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
          console.log('Set exclusions content:', exclude);
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
    name: 'pricing.pricingOptions.options' as any,
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
          enabled: false,
          options: [{
            isActive: false,
            percentageOrPrice: false,
            percentage: 0,
            discountPrice: 0,
            description: '',
            discountCode: '',
            maxDiscountAmount: 0,
            dateRange: { from: undefined, to: undefined }
          }]
        };
      }
      if (!processedItem.paxRange) processedItem.paxRange = [1, 10];
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
        recurrencePattern: item.recurrencePattern as "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" | undefined,
        recurrenceEndDate: item.recurrenceEndDate ? new Date(item.recurrenceEndDate) : undefined,
        selectedPricingOptions: item.selectedPricingOptions || [],
        capacity: item.capacity || 10
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
    console.log('=== ALL FORM VALUES ===');
    console.log('values.price:', values.price);
    console.log('values.minSize:', values.minSize);
    console.log('values.maxSize:', values.maxSize);
    console.log('values.groupSize:', values.groupSize);
    console.log('values.originalPrice:', values.originalPrice);
    console.log('values.basePrice:', values.basePrice);
    console.log('values.discountEnabled:', values.discountEnabled);
    console.log('values.discountPrice:', values.discountPrice);

    // Check for ALL discount-related fields
    console.log('=== DISCOUNT FIELDS SEARCH ===');
    Object.keys(values).forEach(key => {
      if (key.toLowerCase().includes('discount')) {
        console.log(`DISCOUNT FIELD - ${key}:`, values[key]);
      }
    });
    console.log('=== END DISCOUNT SEARCH ===');

    // Check for pricing option fields
    console.log('=== PRICING OPTION FIELDS ===');
    Object.keys(values).forEach(key => {
      if (key.includes('pricing') && key.includes('options')) {
        console.log(`${key}:`, values[key]);
      }
      // Also check for any field that might contain option price data
      if (key.includes('option') || key.includes('pricingOptions') || (key.includes('pricing') && key.includes('price'))) {
        console.log(`POTENTIAL OPTION FIELD - ${key}:`, values[key]);
      }
    });

    // Detailed analysis of individual pricingOptions field
    if (values.pricingOptions) {
      console.log('=== INDIVIDUAL PRICING OPTIONS ANALYSIS ===');
      console.log('values.pricingOptions:', values.pricingOptions);
      if (Array.isArray(values.pricingOptions)) {
        values.pricingOptions.forEach((option: any, index: number) => {
          console.log(`IndividualOption[${index}]:`, {
            name: option.name,
            price: option.price,
            category: option.category,
            discount: option.discount,
            paxRange: option.paxRange
          });
        });
      }
      console.log('=== END INDIVIDUAL ANALYSIS ===');
    }

    console.log('=== END PRICING OPTION FIELDS ===');

    console.log('=== END FORM VALUES ===');


    // Update the mutate function to handle both create and update
    const mutate = mutateFunction || ((data: FormData) => {
      console.log('Form data being submitted:');
      for (const [key, value] of data.entries()) {
        console.log(`FormData[${key}]:`, value);
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
      "title", "code", "excerpt", "description", "tourStatus", "coverImage", "file", "outline", "include", "exclude", "map", "destination", "discount", "gallery"
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



    // Handle the unified dates structure
    if (values.dates && hasChanged('dates', values.dates)) {
      changedFieldCount++;
      // Ensure the departures have proper date formats and properties
      const formattedDates = {
        ...values.dates,
        days: values.dates.days || 0,
        nights: values.dates.nights || 0,
        scheduleType: values.dates.scheduleType || 'flexible',
        fixedDeparture: Boolean(values.dates.fixedDeparture),
        multipleDates: Boolean(values.dates.multipleDates),
        departures: Array.isArray(values.dates.departures) ? values.dates.departures.map((departure: any) => ({
          id: departure.id || String(Date.now()),
          label: departure.label || '',
          dateRange: departure.dateRange || { from: new Date(), to: new Date() },
          selectedPricingOptions: Array.isArray(departure.selectedPricingOptions) ?
            departure.selectedPricingOptions : [],
          isRecurring: Boolean(departure.isRecurring),
          recurrencePattern: departure.isRecurring ?
            (departure.recurrencePattern || "weekly") : undefined,
          recurrenceEndDate: departure.isRecurring ?
            (departure.recurrenceEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1))) : undefined,
          // Only include capacity if it exists
          ...(departure.capacity !== undefined ? { capacity: departure.capacity } : {})
        })) : []
      };

      formData.append("dates", JSON.stringify(formattedDates));
    }
    // Use individual form fields instead of nested pricing object
    // since the individual fields contain the correct data
    if (shouldIncludeField('price', values.price, isCreating) ||
      shouldIncludeField('minSize', values.minSize, isCreating) ||
      shouldIncludeField('maxSize', values.maxSize, isCreating) ||
      shouldIncludeField('discountEnabled', values.discountEnabled, isCreating)) {
      changedFieldCount++;

      // Basic pricing fields from individual form fields
      if (values.price !== undefined) {
        formData.append("price", String(Number(values.price) || 0));
      }
      if (values.originalPrice !== undefined) {
        formData.append("originalPrice", String(Number(values.originalPrice) || 0));
      }
      if (values.basePrice !== undefined) {
        formData.append("basePrice", String(Number(values.basePrice) || 0));
      }

      // Discount fields - discountEnabled from individual, discountPrice from nested
      if (values.discountEnabled !== undefined) {
        formData.append("discountEnabled", String(Boolean(values.discountEnabled)));
      }

      // Get discount price from nested pricing structure since it's not in individual fields
      const pricingDiscount = values.pricing?.discount;
      if (pricingDiscount?.discountPrice !== undefined) {
        formData.append("discountPrice", String(Number(pricingDiscount.discountPrice) || 0));
      } else if (values.discountPrice !== undefined) {
        formData.append("discountPrice", String(Number(values.discountPrice) || 0));
      }

      // Get discount date range from nested pricing if available
      const discountForDates = values.pricing?.discount;


      if (discountForDates?.dateRange) {
        const fromDate = discountForDates.dateRange.from ? new Date(discountForDates.dateRange.from) : new Date();
        const toDate = discountForDates.dateRange.to ? new Date(discountForDates.dateRange.to) : new Date();

        formData.append("discountDateRange", JSON.stringify({
          from: !isNaN(fromDate.getTime()) ? fromDate : new Date(),
          to: !isNaN(toDate.getTime()) ? toDate : new Date()
        }));
      }

      // Size fields from individual form fields
      if (values.minSize !== undefined) {
        formData.append("minSize", String(Number(values.minSize) || 1));
      }
      if (values.maxSize !== undefined) {
        formData.append("maxSize", String(Number(values.maxSize) || 10));
      }

      // Pricing type from nested pricing object
      const pricePerPerson = values.pricing?.pricePerPerson !== undefined
        ? values.pricing.pricePerPerson
        : true; // default to per person
      formData.append("pricePerPerson", String(Boolean(pricePerPerson)));

    }



    // Use individual form fields for pricing options (like we did for main pricing)
    if (values.pricingOptions && Array.isArray(values.pricingOptions) && values.pricingOptions.length > 0) {
      const flatPricingOptions = values.pricingOptions.map((option: any, index: number) => {
        // Generate unique ID for each pricing option
        const optionId = option.id || `option_${Date.now()}_${index}`;


        // Use main discount settings since individual pricing options don't have discount data
        const mainDiscount = values.pricing?.discount;
        const useMainDiscount = values.discountEnabled && mainDiscount;

        return {
          id: optionId, // Add unique ID for pricing option
          name: option.name || "",
          category: option.category || "adult",
          customCategory: option.customCategory || "",
          price: option.price ? Number(option.price) : 0,
          discountEnabled: Boolean(values.discountEnabled), // Use main discount enabled
          discountPrice: useMainDiscount && mainDiscount.discountPrice ? Number(mainDiscount.discountPrice) : undefined,
          discountDateRange: useMainDiscount && mainDiscount.dateRange ? {
            from: new Date(mainDiscount.dateRange.from),
            to: new Date(mainDiscount.dateRange.to)
          } : undefined,
          paxRange: {
            from: Array.isArray(option.paxRange) ? Number(option.paxRange[0]) || 1 : 1,
            to: Array.isArray(option.paxRange) ? Number(option.paxRange[1]) || 22 : 22
          }
        };
      });

      console.log('Appending individual flatPricingOptions to FormData:', flatPricingOptions);

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

