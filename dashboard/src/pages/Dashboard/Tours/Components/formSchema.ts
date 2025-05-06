import { z } from "zod";

// Define the schema for a single itinerary item
const itineraryItemSchema = z.object({
    day: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    dateTime: z.date().optional(),
});
// Define the schema for the itinerary as an array of itinerary items
const itinerarySchema = z.array(itineraryItemSchema);

// Schema for facts
const factSchema = z.object({
  title: z.string().optional(),
  field_type: z.enum(['Plain Text', 'Single Select', 'Multi Select']).optional(),
  value: z.union([
      z.array(z.string()),  // For Plain Text or Single Select, where value is an array of strings
      z.array(z.object({
          label: z.string(),  // For Multi Select, where value is an object with `label`, `value`, and optional `disable`
          value: z.string(),
      })),
  ]).optional(),
  icon: z.string().optional(),
});
// Schema for FAQs
const faqSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
});

const categorySchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

// Schema for gallery
const gallerySchema = z.object({
    image: z.string().optional(),
});

// Schema for location
const locationSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// Define the date range schema
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});

// Alternate format for backward compatibility
export const dateRangeAltSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Combined schema that accepts either format
export const flexibleDateRangeSchema = z.union([
  dateRangeSchema,
  dateRangeAltSchema
]);


// Schema for discount - used in the pricingOptionSchema
export const discountSchema = z.object({
  discountEnabled: z.boolean().default(false),
  isActive: z.boolean().optional(),
  percentageOrPrice: z.boolean().optional(),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional(),
  discountPrice: z.number().min(0, "Discount price must be a positive number").optional(),
  description: z.string().optional(),
  discountCode: z.string().optional(),
  maxDiscountAmount: z.number().min(0, 'Maximum discount amount must be positive').optional(),
  dateRange: flexibleDateRangeSchema,
});

const paxRangeSchema = z
.tuple([z.number().min(1, "Minimum pax must be at least 1"), z.number().min(1, "Maximum pax must be at least 1")])
.refine((data) => data[0] <= data[1], {
  message: "Minimum pax must be less than or equal to maximum pax",
  path: ["paxRange"],
});


// Define the pricing option schema
const pricingOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.enum(["adult", "child", "senior", "student", "custom"]),
  customCategory: z.string().optional(),
  discountEnabled: z.boolean().default(false),
  // Add a reference to the full discount schema for more comprehensive discount information
  discount: discountSchema.optional(),
  paxRange: paxRangeSchema.optional(),
})

// Create a consolidated pricing schema
export const pricingSchema = z.object({
  price: z.number().min(0, 'Price must be at least 0').optional(),
  pricePerPerson: z.boolean().default(true),
  paxRange: paxRangeSchema.optional(),
  groupSize: z.number().min(1, "Group size must be at least 1").optional(),
  
  // Global discount
  discount: discountSchema.optional(),
  
  // Advanced pricing options
  pricingOptionsEnabled: z.boolean().default(false),
  pricingOptions: z.array(pricingOptionSchema).optional(),
  priceLockedUntil: z.date().optional()
});

// Create a unified date schema that handles all scenarios
export const tourDatesSchema = z.object({
  // Base info for all tour types
  days: z.number().min(0, "Days must be a positive number").optional(),
  nights: z.number().min(0, "Nights must be a positive number").optional(),
  
  // Config flags
  fixedDeparture: z.boolean().default(false),
  multipleDates: z.boolean().default(false),
  
  // Single date range (for fixed departure without multiple dates)
  singleDateRange: dateRangeSchema.optional(),
  
  // For multiple departures
  departures: z.array(z.object({
    id: z.string(),
    label: z.string(),
    dateRange: flexibleDateRangeSchema,
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
    recurrenceEndDate: z.date().optional(),
    selectedPricingOptions: z.array(z.string()).optional(),
    priceLockedUntil: z.date().optional(),
    capacity: z.number().min(0, "Capacity must be a positive number").optional()
  })).optional(),
  
  // Scheduling type
  scheduleType: z.enum(["flexible", "fixed", "recurring"]).default("flexible")
}).refine(
  (data) => {
    // If fixedDeparture is false, we only need days/nights
    if (!data.fixedDeparture) {
      return true;
    }
    
    // If multipleDates is false, we need singleDateRange
    if (!data.multipleDates) {
      return !!data.singleDateRange;
    }
    
    // If multipleDates is true, we need departures
    return !!data.departures && data.departures.length > 0;
  },
  {
    message: "Tour dates configuration is incomplete"
  }
);

// Simplified base form schema with separate pricing and dates sections
export const baseFormSchema = z.object({
  // Basic info
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  code: z.string().min(6, 'Trip code must be at least 6 characters.'),
  category: z.array(categorySchema).optional(),
  excerpt: z.string().optional(),
  tourStatus: z.string().default('Draft'),
  description: z.any(),
  coverImage: z.string().optional(),
  file: z.any().optional(),
  enquiry: z.boolean().default(true),
  outline: z.string().optional(),
  
  // Tour content
  itinerary: itinerarySchema.optional(),
  map: z.string().optional(),
  destination: z.string().optional(),
  location: locationSchema.optional(),
  include: z.string().optional(),
  exclude: z.string().optional(),
  facts: z.array(factSchema).optional(),
  gallery: z.array(gallerySchema).optional(),
  faqs: z.array(faqSchema).optional(),
  isSpecialOffer: z.boolean().default(false),
  
  // Use the new unified schemas
  pricing: pricingSchema,
  dates: tourDatesSchema
});

// Create the schema for adding new tours (with required fields)
export const formSchema = baseFormSchema;

// Create the schema for editing tours (all fields completely optional)
export const editFormSchema = z.object({
  // Basic info
  title: z.string().optional(),
  code: z.string().optional(),
  description: z.any().optional(),
  excerpt: z.string().optional(),
  tourStatus: z.string().optional(),
  price: z.number().optional(),
  coverImage: z.string().optional(),
  file: z.string().optional(),
  category: z.any().optional(), // Use z.any() for maximum flexibility
  outline: z.string().optional(),
  itinerary: z.any().optional(),
  include: z.string().optional(),
  exclude: z.string().optional(),
  facts: z.array(factSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  gallery: z.array(gallerySchema).optional(),
  map: z.string().optional(),
  location: z.any().optional(),
  discount: z.any().optional(),
  enquiry: z.boolean().optional(),
  isSpecialOffer: z.boolean().optional(),
  destination: z.string().optional(),
  
  // Use the new unified schemas
  pricing: z.any().optional(),
  dates: z.any().optional()
}).passthrough(); // Add passthrough to allow any other fields

// Export the appropriate schema based on the operation
export const getFormSchema = (isEditing: boolean) => {
  return isEditing ? editFormSchema : formSchema;
};
