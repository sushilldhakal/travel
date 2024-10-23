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

  // Schema for dates
const datesSchema = z.object({
    tripDuration: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
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


z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

// Schema for FAQs
const faqSchema = z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
});

// Schema for reviews
// const reviewSchema = z.object({
//     user: z.string().min(1, 'User ID is required'),
//     rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
//     comment: z.string().min(1, 'Comment is required'),
// });

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
    // reviews: z.array(reviewSchema).optional(),
    gallery: z.array(gallerySchema).optional(),
    map: z.string().optional(),
    location: locationSchema.optional(),
    enquiry: z.boolean().optional(),
});

