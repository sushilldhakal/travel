import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema, getFormSchema } from './formSchema';
import { JSONContent } from 'novel';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSingleTour } from '../../../../http/tourApi';

export const useFormHandlers = (editorContent: JSONContent) => {

  const { tourId } = useParams();
  
  // Fetch the original tour data for comparison using the existing API function
  const { data: tourData } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => tourId ? getSingleTour(tourId) : Promise.resolve(null),
    enabled: !!tourId, // Only run query if tourId exists
  });

  // Use different schema based on whether we're editing (tourId exists) or creating a new tour
  const isEditing = !!tourId;

  const defaultValues = {
    title: String,
    code: String,
    excerpt: String,
    description: String,
    tourStatus: String,
    price: Number,
    coverImage: String,
    file: String,
    category: [{
      label: String, value: String}],
    outline: String,
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
        dateTime: Date,
      }
    ],
    dates: {
      days: Number,
      nights: Number,
      scheduleType: String,
      fixedDeparture: Boolean,
      multipleDates: Boolean,
      departures: [
        {
          id: String,
          label: String,
          dateRange: {
            from: Date,
            to: Date
          },
          selectedPricingOptions: [String],
          isRecurring: Boolean,
          recurrencePattern: String,
          recurrenceEndDate: Date,
          capacity: Number
        }
      ]
    },
    pricing: {
      price: Number,
      pricePerPerson: Boolean,
      pricingOptionsEnabled: Boolean,
      paxRange: [Number, Number],
      discount: {
        discountEnabled: Boolean,
        discountPrice: Number,
        dateRange: {
          from: Date,
          to: Date
        }
      },
      pricingOptions: [
        {
          name: String,
          category: String,
          customCategory: String,
          price: Number,
          discountEnabled: Boolean,
          discount: {
            discountEnabled: Boolean,
            discountPrice: Number,
            dateRange: {
              from: Date,
              to: Date
            }
          },
          paxRange: [Number, Number]
        }
      ],
      priceLockedUntil: Date
    },
    include: String,
    exclude: String,
    facts: [],
    // FAQs
    faqs: [],
    gallery: [],
    map: String,
    location: {
      street: String,
      city: String,
      state: String,
      country: String,
      lat: Number,
      lng: Number
    },
    enquiry: true,
    destination: String,
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema(isEditing)),
    defaultValues,
  });

  const { fields: itineraryFields, append: itineraryAppend, remove: itineraryRemove } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });

  const { fields: factFields, append: factAppend, remove: factRemove } = useFieldArray({
    control: form.control,
    name: 'facts',
  });

  const { fields: faqFields, append: faqAppend, remove: faqRemove } = useFieldArray({
    control: form.control,
    name: 'faqs',
  });

  // For pricingOptions, we need to use a workaround since it's not directly defined as an array in the form schema
  // But it is part of the form's defaultValues
  const { fields: pricingOptionsFields, append: pricingOptionsAppend, remove: pricingOptionsRemove } = useFieldArray({
    control: form.control,
    name: 'pricing.pricingOptions',
  });

  const { fields: dateRangeFields, append: dateRangeAppend, remove: dateRangeRemove } = useFieldArray({
    control: form.control,
    name: 'dates.departures',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>, mutate: (data: FormData) => void) => {
    const formData = new FormData();
    
    // Get the original tour data to compare
    const originalTour = tourData?.tour || {};
    
    // Helper function to check if a value has changed
    const hasChanged = (key: string, newValue: unknown) => {
      const parts = key.split('.');
      let origValue: unknown = originalTour;
      
      // Handle nested keys like 'tourDates.days'
      for (const part of parts) {
        if (!origValue || typeof origValue !== 'object') return true; // Can't compare, assume changed
        origValue = (origValue as Record<string, unknown>)[part];
      }
      
      // Handle special cases
      if (key === 'discountEnabled' || key === 'pricingOptionsEnabled' || 
          key === 'enquiry' || key === 'isSpecialOffer' || 
          key === 'fixedDeparture' || key === 'multipleDates') {
        return Boolean(newValue) !== Boolean(origValue);
      }
      
      // Handle arrays and objects
      if (typeof newValue === 'object' && newValue !== null) {
        if (Array.isArray(newValue)) {
          // For arrays, we'll just check if the length changed or stringify comparison
          return !origValue || 
                 !Array.isArray(origValue) || // If original is not an array
                 origValue.length !== newValue.length ||
                 JSON.stringify(origValue) !== JSON.stringify(newValue);
        }
        // For objects, stringify and compare
        return JSON.stringify(origValue) !== JSON.stringify(newValue);
      }
      
      // For primitive values
      return origValue !== newValue;
    };
    
    // Add tour ID - always needed for updates
    formData.append("id", tourId || '');
    
    // Track exactly which fields we're sending
    let changedFieldCount = 0;
    
    // Direct check for top level fields
    const topLevelFields = [
      'title', 'code', 'excerpt', 'description', 'tourStatus', 'coverImage', 'file', 'outline', 'include', 'exclude', 'map', 'destination'
    ];
    
    // Only send the fields that we're sure have changed
    topLevelFields.forEach(field => {
      // @ts-expect-error - Typed access with dynamic keys is difficult
      if (values[field] !== undefined && hasChanged(field, values[field])) {
        changedFieldCount++;
        // Special handling for description
        if (field === 'description' && editorContent) {
          formData.append(field, JSON.stringify(editorContent));
        } else {
          // @ts-expect-error - Dynamic access
          formData.append(field, String(values[field]));
        }
      }
    });
    
    // Handle location separately - only if it actually changed
    if (values.location && hasChanged('location', values.location)) {
      changedFieldCount++;
      // Make sure we have all required fields in the location object and proper types
      const fullLocation = {
        street: values.location.street || originalTour.location?.street || '',
        city: values.location.city || originalTour.location?.city || '',
        state: values.location.state || originalTour.location?.state || '',
        country: values.location.country || originalTour.location?.country || '',
        lat: typeof values.location.lat === 'string' ? parseFloat(values.location.lat) || 0 : values.location.lat || 0,
        lng: typeof values.location.lng === 'string' ? parseFloat(values.location.lng) || 0 : values.location.lng || 0
      };
      formData.append("location", JSON.stringify(fullLocation));
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
        departures: Array.isArray(values.dates.departures) ? values.dates.departures.map(departure => ({
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
    
    // Handle the unified pricing structure
    if (values.pricing && hasChanged('pricing', values.pricing)) {
      changedFieldCount++;
      const formattedPricing = {
        ...values.pricing,
        price: typeof values.pricing.price === 'string' ? 
          parseFloat(values.pricing.price) || 0 : 
          values.pricing.price || 0,
        pricePerPerson: Boolean(values.pricing.pricePerPerson),
        pricingOptionsEnabled: Boolean(values.pricing.pricingOptionsEnabled),
        paxRange: Array.isArray(values.pricing.paxRange) ?
          [parseInt(String(values.pricing.paxRange[0] || 1)), parseInt(String(values.pricing.paxRange[1] || 10))] :
          undefined,
        discount: values.pricing.discount ? {
          discountEnabled: Boolean(values.pricing.discount.discountEnabled),
          discountPrice: typeof values.pricing.discount.discountPrice === 'string' ?
            parseFloat(values.pricing.discount.discountPrice) || 0 :
            values.pricing.discount.discountPrice || 0,
          // Use dateRange from the discount object instead of discountDateRange
          dateRange: values.pricing.discount.dateRange || { from: new Date(), to: new Date() }
        } : undefined,
        pricingOptions: Array.isArray(values.pricing.pricingOptions) ? 
          values.pricing.pricingOptions.map(option => ({
            name: option.name || '',
            category: option.category || 'adult',
            customCategory: option.customCategory || '',
            price: typeof option.price === 'string' ? parseFloat(option.price) || 0 : option.price || 0,
            discountEnabled: Boolean(option.discountEnabled),
            // Update to use the discount object structure
            discount: option.discountEnabled ? {
              discountEnabled: true,
              discountPrice: typeof option.discount?.discountPrice === 'string' ? 
                parseFloat(option.discount.discountPrice) || 0 : 
                option.discount?.discountPrice || 0,
              dateRange: option.discount?.dateRange || { from: new Date(), to: new Date() }
            } : undefined,
            paxRange: Array.isArray(option.paxRange) ? 
              [parseInt(String(option.paxRange[0] || 1)), parseInt(String(option.paxRange[1] || 10))] : 
              [1, 10]
          })) : [],
        priceLockedUntil: values.pricing.priceLockedUntil || undefined
      };
      
      formData.append("pricing", JSON.stringify(formattedPricing));
    }
    
    // Handle boolean fields - only if they changed
    ['enquiry', 'isSpecialOffer'].forEach(key => {
      // @ts-expect-error - Typed access with dynamic keys
      if (values[key] !== undefined && hasChanged(key, values[key])) {
        changedFieldCount++;
        // @ts-expect-error - Dynamic access
        formData.append(key, values[key] ? "true" : "false");
      }
    });
    
    // Handle category separately to convert any function values to string
    if (values.category && Array.isArray(values.category) && hasChanged('category', values.category)) {
      changedFieldCount++;
      // Process the category array to ensure each item has proper string values
      const formattedCategory = values.category.map((item: {
        label?: string;
        value?: string;
        categoryId?: string | (() => string);
        categoryName?: string | (() => string);
        disable?: boolean;
      }) => ({
        categoryId: typeof item.categoryId === 'function' ? item.categoryId() : 
                   item.categoryId || item.value || '',
        categoryName: typeof item.categoryName === 'function' ? item.categoryName() : 
                     item.categoryName || item.label || '',
        disable: Boolean(item.disable)
      }));
      formData.append("category", JSON.stringify(formattedCategory));
    }

    // Handle map field to ensure it's a string
    if (values.map !== undefined && hasChanged('map', values.map)) {
      changedFieldCount++;
      formData.append("map", typeof values.map === 'function' ? values.map() : String(values.map || ''));
    }

    // Handle itinerary separately
    if (values.itinerary && hasChanged('itinerary', values.itinerary)) {
      changedFieldCount++;
      // Ensure all itinerary items have proper data types
      const formattedItinerary = Array.isArray(values.itinerary) ?
        values.itinerary.map(item => {
          return {
            day: item.day || '',
            title: typeof item.title === 'string' ? item.title : String(item.title || ''),
            description: typeof item.description === 'string' ? item.description : String(item.description || ''),
            dateTime: item.dateTime instanceof Date ? item.dateTime : new Date()
          };
        }) : [];
      
      formData.append("itinerary", JSON.stringify(formattedItinerary));
    }
    
    // Handle exclude separately
    if (values.exclude && hasChanged('exclude', values.exclude)) {
      changedFieldCount++;
      // Convert to string
      const excludeValue = typeof values.exclude === 'string' ? 
        values.exclude : String(values.exclude || '');
      formData.append("exclude", excludeValue);
    }
    
    
    try {
      // Make sure we're passing the FormData object directly to the mutation function
      mutate(formData);
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  return { 
    form, 
    onSubmit, 
    itineraryFields, 
    itineraryAppend, 
    itineraryRemove, 
    factFields, 
    factAppend, 
    factRemove,
    faqFields, 
    faqAppend, 
    faqRemove,
    pricingOptionsFields,
    pricingOptionsAppend,
    pricingOptionsRemove,
    dateRangeFields,
    dateRangeAppend,
    dateRangeRemove,
  };
};
