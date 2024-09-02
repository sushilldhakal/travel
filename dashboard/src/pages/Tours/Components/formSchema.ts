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


export const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    code: z.string().min(6, 'Trip code must be at least 6 characters.'),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    tourStatus: z.string(),
    price: z.number().min(0, 'Price must be a positive number'),
    coverImage: z.string().min(1, 'Please Select a Cover Image'),
    file: z.string().optional(),
    outline: z.string().optional(),
    itinerary: itinerarySchema.optional() // Include the itinerary in the main schema
});

