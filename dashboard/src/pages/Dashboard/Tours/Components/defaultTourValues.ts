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
  outline: '',
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
    fixedDeparture: false,
    multipleDates: false,
    departures: [],
    singleDateRange: { from: new Date(), to: new Date() },
    scheduleType: 'fixed'
  },
  pricing: {
    price: 0,
    pricePerPerson: true,
    paxRange: [1, 10] as [number, number],
    discount: {
      discountEnabled: false,
      isActive: false,
      percentageOrPrice: false,
      percentage: 0,
      discountPrice: 0,
      discountCode: '',
      maxDiscountAmount: 0,
      description: '',
      dateRange: {
        from: new Date(),
        to: new Date()
      }
    },
    pricingOptionsEnabled: false,
    pricingOptions: [],
    priceLockedUntil: new Date()
  }
};

// Helper function to generate unique IDs
export const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

// Helper to get default departure
export const getDefaultDeparture = (departure?: Partial<departures>): departures => ({
  id: departure?.id || generateUniqueId(),
  label: departure?.label || '',
  dateRange: departure?.dateRange || { from: new Date(), to: new Date() },
  isRecurring: departure?.isRecurring || false,
  recurrencePattern: departure?.recurrencePattern || 'none',
  recurrenceEndDate: departure?.recurrenceEndDate || new Date(),
  selectedPricingOptions: departure?.selectedPricingOptions || [],
  priceLockedUntil: departure?.priceLockedUntil || new Date(),
  capacity: departure?.capacity || 0
});

// Helper to get default pricing option
export const getDefaultPricingOption = (opt?: Partial<pricingOptions>): pricingOptions => ({
  id: opt?.id || generateUniqueId(),
  name: opt?.name || '',
  category: opt?.category || '',
  customCategory: opt?.customCategory || '',
  price: opt?.price || 0,
  discount: {
    discountEnabled: opt?.discount?.discountEnabled || false,
    isActive: opt?.discount?.isActive || false,
    percentageOrPrice: opt?.discount?.percentageOrPrice || false,
    percentage: opt?.discount?.percentage || 0,
    discountPrice: opt?.discount?.discountPrice || 0,
    discountCode: opt?.discount?.discountCode || '',
    maxDiscountAmount: opt?.discount?.maxDiscountAmount || 0,
    description: opt?.discount?.description || '',
    dateRange: opt?.discount?.dateRange || { from: new Date(), to: new Date() },
  },
  paxRange: Array.isArray(opt?.paxRange) && opt.paxRange.length === 2
    ? [Number(opt.paxRange[0]), Number(opt.paxRange[1])] as [number, number]
    : [1, 10] as [number, number]
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
      ...defaults.dates,
      ...values.dates,
      departures: Array.isArray(values.dates?.departures)
        ? values.dates.departures.map(d => getDefaultDeparture(d))
        : defaults.dates.departures,
      singleDateRange: values.dates?.singleDateRange || defaults.dates.singleDateRange
    },
    pricing: {
      ...defaults.pricing,
      ...values.pricing,
      discount: {
        ...defaults.pricing.discount,
        ...values.pricing?.discount
      },
      pricingOptions: Array.isArray(values.pricing?.pricingOptions)
        ? values.pricing.pricingOptions.map(opt => getDefaultPricingOption(opt))
        : defaults.pricing.pricingOptions
    }
  } as Tour;

  return result;
};