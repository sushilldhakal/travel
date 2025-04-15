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

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

  const recurringTourSchema = z.object({
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).optional(),
    recurrenceEndDate: z.date().optional(),
    priceLockedUntil: z.date().optional(),
  }).superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurrencePattern) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recurrence pattern is required',
        path: ['recurrencePattern']
      });
    }
    
    if (data.priceLockedUntil && data.priceLockedUntil < new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Lock date must be in the future',
        path: ['priceLockedUntil']
      });
    }
  });

// Custom validation for DateRange type
const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}).optional().refine(data => {
  // If data exists, both from and to should be present
  if (data && data.from && data.to) {
    return data.from <= data.to; // from date should be before or equal to to date
  }
  return true; // If we don't have complete data, pass validation
}, {
  message: 'End date must be after start date',
});

// Schema for dates
const datesSchema = z.object({
    tripDuration: z.string().optional(),
    dateRange: dateRangeSchema,
});

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

// Schema for discount
const discountSchema = z.object({
    percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
    discountCode: z.string().optional(),
    maxDiscountAmount: z.number().min(0, 'Maximum discount amount must be positive').optional(),
    dateRange: dateRangeSchema,
});

// Schema for FAQs
const faqSchema = z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
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
    lat: z.string().optional(),
    lng: z.string().optional(),
});

// Schema for date ranges
const dateRangeItemSchema = z.object({
    id: z.string().optional(),
    label: z.string().optional(),
    dateRange: dateRangeSchema,
    selectedPricingOptions: z.array(z.string()).optional(),
});

// Schema for pricing options
const pricingOptionSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    category: z.string().optional(),
    customCategory: z.string().optional(),
    price: z.number().min(0).optional(),
    discountEnabled: z.boolean().optional(),
    discountPrice: z.number().min(0).optional(),
    paxRange: z.tuple([z.number().min(1), z.number().min(1)]).optional(),
});

export const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    code: z.string().min(6, 'Trip code must be at least 6 characters.'),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    tourStatus: z.string(),
    price: z.number().min(0, 'Price must be a positive number'),
    coverImage: z.string().min(1, 'Please Select a Cover Image'),
    file: z.string().optional(),
    category:z.array(optionSchema).min(1),
    outline: z.string().optional(),
    itinerary: itinerarySchema.optional(), // Include the itinerary in the main schema
    dates: datesSchema.optional(),
    include: z.string().optional(),
    exclude: z.string().optional(),
    facts: z.array(factSchema).optional(),
    faqs: z.array(faqSchema).optional(),
    gallery: z.array(gallerySchema).optional(),
    map: z.string().optional(),
    location: locationSchema.optional(),
    discount: discountSchema.optional(),
    enquiry: z.boolean().optional(),
    isSpecialOffer: z.boolean().optional(),
    destination: z.string().optional(),
    // Add new pricing fields
    pricePerType: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    groupSize: z.number().min(1).optional(),
    discountEnabled: z.boolean().optional(),
    discountPrice: z.number().min(0).optional(),
    discountDateRange: dateRangeSchema,
    pricingOptionsEnabled: z.boolean().optional(),
    pricingOptions: z.array(pricingOptionSchema).optional(),
    // Tour dates fields
    fixedDeparture: z.boolean().optional(),
    tourDates: z.object({
        days: z.number().min(1).optional(),
        nights: z.number().min(0).optional(),
        dateRange: dateRangeSchema,
    }).optional(),
    // Fixed departure fields
    multipleDates: z.boolean().optional(),
    fixedDate: z.object({
        dateRange: dateRangeSchema,
    }).optional(),
    dateRanges: z.array(dateRangeItemSchema).optional(),
});
