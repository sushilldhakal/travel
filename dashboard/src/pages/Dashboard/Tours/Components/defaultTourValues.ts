import { Tour, departures, pricingOptions } from '@/Provider/types';

export const defaultTourValues: Partial<Tour> = {
  title: '',
  code: '',
  excerpt: '',
  description: '',
  tourStatus: 'Draft',
  price: 0,
  coverImage: '',
  file: '',
  category: [],
  destination: '',
  enquiry: true,
  featured: false,
  include: '',
  exclude: '',
  itinerary: [],
  facts: [],
  faqs: [],
  location: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    map: '',
    lat: 0,
    lng: 0,
  },
  gallery: [],
  dates: {
    days: 0,
    nights: 0,
    departures: [],
    singleDateRange: { from: new Date(), to: new Date() },
    scheduleType: 'fixed',
    selectedPricingOptions: [],
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceInterval: 1
  },
  pricing: {
    price: 0,
    pricePerPerson: true,
    paxRange: [1, 10] as [number, number],
    minSize: 1,
    maxSize: 10,
    groupSize: 1,
    discount: {
      discountEnabled: false,
      discountPrice: 0,
      dateRange: { from: new Date(), to: new Date() }
    },
    pricingOptionsEnabled: false,
    pricingOptions: [],
    priceLockedUntil: new Date()
  }
};

// Helper function to generate unique IDs
export const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

// Helper to get default departure
export const getDefaultDeparture = (departure?: Partial<departures & { pricingCategory?: string[]; days?: number; nights?: number; }>): departures & { pricingCategory: string[]; days: number; nights: number; } => ({
  id: departure?.id || generateUniqueId(),
  label: departure?.label || '',
  dateRange: departure?.dateRange || { from: new Date(), to: new Date() },
  isRecurring: departure?.isRecurring || false,
  recurrencePattern: departure?.recurrencePattern || undefined,
  recurrenceEndDate: departure?.recurrenceEndDate || new Date(),
  selectedPricingOptions: departure?.selectedPricingOptions || [],
  // Map pricingCategory from either pricingCategory or selectedPricingOptions for form compatibility
  pricingCategory: departure?.pricingCategory || departure?.selectedPricingOptions || [],
  days: departure?.days || 0,
  nights: departure?.nights || 0,
  capacity: departure?.capacity || 0
});

// Helper to get default pricing option
export const getDefaultPricingOption = (opt?: Partial<pricingOptions>): pricingOptions => ({
  id: opt?.id || generateUniqueId(),
  name: opt?.name || '',
  category: opt?.category || 'adult',
  customCategory: opt?.customCategory || '',
  price: opt?.price || 0,
  discount: {
    enabled: opt?.discount?.enabled || false,
    options: opt?.discount?.options || []
  },
  paxRange: {
    minPax: opt?.paxRange?.minPax || 1,
    maxPax: opt?.paxRange?.maxPax || 10
  }
});

// Main function to get tour values with proper defaults
export const getTourWithDefaults = (values: Partial<Tour> = {}): Tour => {
  const defaults = { ...defaultTourValues };
  
  // Deep merge the values with defaults
  const result: Tour = {
    ...defaults,
    ...values,
    location: { ...defaults.location, ...values.location },
    dates: {
      ...defaults.dates!,
      ...values.dates,
      departures: Array.isArray(values.dates?.departures)
        ? values.dates.departures.map(d => getDefaultDeparture(d))
        : defaults.dates!.departures
    },
    pricing: {
      ...defaults.pricing!,
      ...values.pricing,
      discount: {
        ...defaults.pricing!.discount,
        ...values.pricing?.discount
      },
      pricingOptions: Array.isArray(values.pricing?.pricingOptions)
        ? values.pricing.pricingOptions.map(opt => getDefaultPricingOption(opt))
        : defaults.pricing!.pricingOptions
    }
  } as Tour;

  return result;
};