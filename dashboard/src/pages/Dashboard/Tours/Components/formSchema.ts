import { z } from "zod";

// Helper schema
const optionalString = z.string().optional();
const optionalDate = z.date().optional();

// Define the schema for a single itinerary item
const itineraryItemSchema = z.object({
    day: optionalString,
    title: optionalString,
    description: optionalString,
    dateTime: optionalDate,
});
// Define the schema for the itinerary as an array of itinerary items
const itinerarySchema = z.array(itineraryItemSchema);

// Schema for facts
const factSchema = z.object({
  title: optionalString,
  field_type: z.enum(['Plain Text', 'Single Select', 'Multi Select']).optional(),
  value: z.union([
      z.array(z.string()),  // For Plain Text or Single Select, where value is an array of strings
      z.array(z.object({
          label: z.string(),  // For Multi Select, where value is an object with `label`, `value`, and optional `disable`
          value: z.string(),
      })),
  ]).optional(),
  icon: optionalString,
});
// Schema for FAQs
const faqSchema = z.object({
  question: optionalString,
  answer: optionalString,
});

const categorySchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

// Schema for gallery
const gallerySchema = z.object({
    image: optionalString,
});

// Schema for location
const locationSchema = z.object({
  map: optionalString,
  zip: optionalString,
    street: optionalString,
    city: optionalString,
    state: optionalString,
    country: optionalString,
    lat: optionalString,
    lng: optionalString,
});

// Define the date range schema
export const dateRangeSchema = z.object({
  from: optionalDate,
  to: optionalDate,
});

// Alternate format for backward compatibility
export const dateRangeAltSchema = z.object({
  startDate: optionalDate,
  endDate: optionalDate,
});

// Combined schema that accepts either format
export const flexibleDateRangeSchema = z.union([
  dateRangeSchema,
  dateRangeAltSchema
]);

export const paxSchema = z.object({
    minSize: z.number().default(1),
    maxSize: z.number().default(10),
});


// Schema for discount - used in the pricingOptionSchema
export const discountSchema = z.object({
  isActive: z.boolean().optional(),
  percentageOrPrice: z.boolean().optional(),
  percentage: z.number().min(0).max(100).optional(),
  discountPrice: z.number().min(0).optional(),
  description: optionalString,
  discountCode: optionalString,
  maxDiscountAmount: z.number().min(0).optional(),
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
  id: optionalString,
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.enum(["adult", "child", "senior", "student", "custom"]),
  customCategory: optionalString,
  // Add a reference to the full discount schema for more comprehensive discount information
  discount: z.object({
    enabled: z.boolean().default(false),
    options: z.array(discountSchema).optional(),
  }),
  paxRange: paxRangeSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.discount?.enabled && data.discount.options) {
    data.discount.options.forEach((option, index) => {
      if (!option.percentageOrPrice && !option.discountPrice) {
        ctx.addIssue({
          path: ["discount", "options", index],
          code: z.ZodIssueCode.custom,
          message: "Either percentage or discount price must be provided for each discount option.",
        });
      }
    });
  }
});

// Create a consolidated pricing schema
export const pricingSchema = z.object({
  price: z.number().min(0, 'Price must be at least 0').optional(),
  pricePerPerson: z.boolean().default(true),
  paxRange: paxRangeSchema.optional(),
  groupSize: z.number().min(1, "Group size must be at least 1").optional(),
  // Global discount
  discount: z.object({
    enabled: z.boolean().default(false),
    options: z.array(discountSchema).optional(),
  }),
  priceLockedUntil: optionalDate,
  // Advanced pricing options
  pricingOptions: z.object({
    enabled: z.boolean().default(false),
    options: z.array(pricingOptionSchema).optional()
  }).optional()
}).superRefine((data, ctx) => {
  const enabled = data.pricingOptions?.enabled;
  const options = data.pricingOptions?.options;

  //Enforce presence of options array
  if (enabled && (!options || options.length === 0)) {
    ctx.addIssue({
      path: ["pricingOptions", "options"],
      code: z.ZodIssueCode.custom,
      message: "At least one pricing option is required when enabled is true.",
    });
  }

  //Enforce required fields in each pricing option
  if (enabled && Array.isArray(options)) {
    options.forEach((option, index) => {
      if (!option.name || option.name.trim() === "") {
        ctx.addIssue({
          path: ["pricingOptions", "options", index, "name"],
          code: z.ZodIssueCode.custom,
          message: "Name is required when pricing options are enabled.",
        });
      }
      if (option.price === undefined || option.price < 0) {
        ctx.addIssue({
          path: ["pricingOptions", "options", index, "price"],
          code: z.ZodIssueCode.custom,
          message: "Valid price is required when pricing options are enabled.",
        });
      }

      // Optional: check discount structure here too
      if (option.discount?.enabled) {
        const discounts = option.discount.options;
        if (!discounts || discounts.length === 0) {
          ctx.addIssue({
            path: ["pricingOptions", "options", index, "discount", "options"],
            code: z.ZodIssueCode.custom,
            message: "Discount must have at least one value when enabled.",
          });
        } else {
          discounts.forEach((d, dIndex) => {
            if (!d.percentage && !d.discountPrice) {
              ctx.addIssue({
                path: [
                  "pricingOptions",
                  "options",
                  index,
                  "discount",
                  "options",
                  dIndex,
                ],
                code: z.ZodIssueCode.custom,
                message:
                  "Each discount must have a percentage or a discount price.",
              });
            }
          });
        }
      }
    });
  }
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
    recurrenceEndDate: optionalDate,
    selectedPricingOptions: z.array(z.string()).optional(),
    priceLockedUntil: optionalDate,
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
  excerpt: optionalString,
  tourStatus: z.string().default('Draft'),
  description: z.any(),
  coverImage: optionalString,
  file: z.any().optional(),
  enquiry: z.boolean().default(true),
  featured: z.boolean().default(false),
  // Tour content
  

  itinerary: z.object({
    outline: optionalString,
    options: z.array(itinerarySchema).optional(),
  }),

  destination: optionalString,
  location: locationSchema.optional(),
  include: optionalString,
  exclude: optionalString,
  facts: z.array(factSchema).optional(),
  gallery: z.array(gallerySchema).optional(),
  faqs: z.array(faqSchema).optional(),
  
  // Use the new unified schemas
  pricing: pricingSchema,
  dates: tourDatesSchema
});

// Create the schema for adding new tours (with required fields)
export const formSchema = baseFormSchema;

// Create the schema for editing tours (all fields completely optional)
export const editFormSchema = z.object({
  // Basic info
  title: optionalString,
  code: optionalString,
  description: z.any().optional(),
  excerpt: optionalString,
  tourStatus: optionalString,
  coverImage: optionalString,
  file: optionalString,
  category: z.any().optional(), // Use z.any() for maximum flexibility
  outline: optionalString,
  itinerary: z.any().optional(),
  include: optionalString,
  exclude: optionalString,
  facts: z.array(factSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  gallery: z.array(gallerySchema).optional(),
  location: z.any().optional(),
  enquiry: z.boolean().optional(),
  destination: optionalString,
  // Use the new unified schemas
  pricing: z.any().optional(),
  dates: z.any().optional()
}).passthrough(); // Add passthrough to allow any other fields

// Export the appropriate schema based on the operation
export const getFormSchema = (isEditing: boolean) => {
  return isEditing ? editFormSchema : formSchema;
};
