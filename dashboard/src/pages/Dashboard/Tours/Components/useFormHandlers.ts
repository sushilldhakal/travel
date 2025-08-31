// "use client"

// import { useForm, useFieldArray } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useParams } from 'react-router-dom'
// import { useQuery } from "@tanstack/react-query"
// import { getSingleTour } from "../../../../http/tourApi"
// import type { z } from "zod"
// import { formSchema, getFormSchema } from "./formSchema"
// import { defaultTourValues } from "./defaultTourValues"

// export const useFormHandlers = () => {
//   const { tourId } = useParams()

//   // Fetch the original tour data for comparison using the existing API function
//   const { data: tourData } = useQuery({
//     queryKey: ["tour", tourId],
//     queryFn: () => (tourId ? getSingleTour(tourId) : Promise.resolve(null)),
//     enabled: !!tourId, // Only run query if tourId exists
//   })

//   // Use different schema based on whether we're editing (tourId exists) or creating a new tour
//   const isEditing = !!tourId



//   const form = useForm({
//     resolver: zodResolver(getFormSchema(isEditing)),
//     defaultValues: defaultTourValues,
//   })

//   const {
//     fields: itineraryFields,
//     append: itineraryAppend,
//     remove: itineraryRemove,
//   } = useFieldArray({
//     control: form.control,
//     name: "itinerary",
//   })

//   const {
//     fields: factFields,
//     append: factAppend,
//     remove: factRemove,
//   } = useFieldArray({
//     control: form.control,
//     name: "facts",
//   })

//   const {
//     fields: faqFields,
//     append: faqAppend,
//     remove: faqRemove,
//   } = useFieldArray({
//     control: form.control,
//     name: "faqs",
//   })

//   // For pricingOptions, we need to use a workaround since it's not directly defined as an array in the form schema
//   // But it is part of the form's defaultTourValues
//   const {
//     fields: pricingOptionsFields,
//     append: pricingOptionsAppend,
//     remove: pricingOptionsRemove,
//   } = useFieldArray({
//     control: form.control,
//     name: "pricing.pricingOptions",
//   })

//   const {
//     fields: dateRangeFields,
//     append: dateRangeAppend,
//     remove: dateRangeRemove,
//   } = useFieldArray({
//     control: form.control,
//     name: "dates.departures",
//   })

//   const onSubmit = async (values: z.infer<typeof formSchema>, mutate: (data: FormData) => void) => {
//     const formData = new FormData()

//     // Helper function to process values and convert functions to proper data types
//     const processValue = (value: unknown): unknown => {
//       // Handle null or undefined
//       if (value === null || value === undefined) {
//         return value
//       }

//       // Convert functions to appropriate values
//       if (typeof value === "function") {
//         // Handle constructor functions
//         if (value === String) return ""
//         if (value === Number) return 0
//         if (value === Boolean) return false
//         if (value === Date) return new Date()
//         if (value === Array) return []
//         if (value === Object) return {}
//         return null // Unknown function type
//       }

//       // Handle arrays - recursively process each element
//       if (Array.isArray(value)) {
//         return value.map((item) => processValue(item))
//       }

//       // Handle objects - recursively process each property
//       if (typeof value === "object" && value !== null) {
//         const result: Record<string, unknown> = {}
//         for (const key in value) {
//           if (Object.prototype.hasOwnProperty.call(value, key)) {
//             result[key] = processValue((value as Record<string, unknown>)[key])
//           }
//         }
//         return result
//       }

//       // Return primitive values as is
//       return value
//     }

//     // Deep clone and process the values to ensure no functions are passed
//     const processedValues = processValue(values) as typeof values

//     console.log("Processed form values:", processedValues)

//     // Get the original tour data to compare
//     const originalTour = tourData?.tour || {}

//     // Helper function to check if a value has changed
//     const hasChanged = (key: string, newValue: unknown): boolean => {
//       const parts = key.split(".")
//       let origValue: unknown = originalTour

//       // For nested values, navigate to the right property
//       for (const part of parts) {
//         if (origValue === null || origValue === undefined) {
//           return true // If original path doesn't exist, treat as changed
//         }
//         // @ts-expect-error - Dynamic access to nested properties
//         origValue = (origValue as Record<string, unknown>)[part]
//       }

//       // Compare based on the value type
//       if (origValue === undefined) {
//         return newValue !== undefined // If original doesn't exist but new does, it changed
//       }

//       // For arrays, compare length and stringify
//       if (Array.isArray(newValue)) {
//         return (
//           origValue === undefined ||
//           !Array.isArray(origValue) || // If original is not an array
//           origValue.length !== newValue.length ||
//           JSON.stringify(origValue) !== JSON.stringify(newValue)
//         )
//       }
//       // For objects, stringify and compare
//       if (typeof newValue === "object" && newValue !== null) {
//         // For dates, compare timestamps
//         if (newValue instanceof Date) {
//           return !(origValue instanceof Date) || (origValue as Date).getTime() !== (newValue as Date).getTime()
//         }
//         // For objects, stringify and compare
//         return JSON.stringify(origValue) !== JSON.stringify(newValue)
//       }

//       // For primitive values, compare directly
//       // For primitive values
//       return origValue !== newValue
//     }

//     // Add tour ID - always needed for updates
//     formData.append("id", tourId || "")

//     // Track the number of fields that have been changed, to avoid making unnecessary API calls
//     let changedFieldCount = 0

//     // Debug the full form values to see what's being submitted
//     console.log("Full form values:", processedValues)

//     // Determine if we're creating a new tour or editing an existing one
//     const isCreating = !tourId

//     // For new tours, we need to include all fields
//     // For existing tours, we only include changed fields
//     const shouldIncludeField = (field: string, value: unknown) => {
//       return isCreating || hasChanged(field, value)
//     }

//     // Use processedValues instead of values from here on to ensure no function objects are passed

//     // Direct check for top level fields
//     const topLevelFields = [
//       "title",
//       "code",
//       "excerpt",
//       "description",
//       "tourStatus",
//       "coverImage",
//       "file",
//       "outline-solid",
//       "include",
//       "exclude",
//       "map",
//       "destination",
//     ]

//     // Only send the fields that we're sure have changed (or all fields for new tours)
//     topLevelFields.forEach((field) => {
//       const key = field as keyof typeof processedValues
//       if (processedValues[key] !== undefined && shouldIncludeField(field, processedValues[key])) {
//         changedFieldCount++
//         // Special handling for description
//         if (field === "description" && editorContent) {
//           formData.append(field, JSON.stringify(editorContent))
//         }
//         if (field === "include" && inclusionsContent) {
//           formData.append(field, JSON.stringify(inclusionsContent))
//         }
//         if (field === "exclude" && exclusionsContent) {
//           formData.append(field, JSON.stringify(exclusionsContent))
//         }
//         if (field === "itinerary" && itineraryContent) {
//           formData.append(field, JSON.stringify(itineraryContent))
//         }
//         // Special handling for file field - convert from array to string if needed
//         if (field === "file") {
//           const fileValue = processedValues.file;
//           if (Array.isArray(fileValue) && fileValue.length > 0) {
//             // Take the first item from the array
//             formData.append(field, String(fileValue[0] || ""))
//           } else {
//             // Handle as normal string
//             formData.append(field, String(fileValue || ""))
//           }
//         } else {
//           // @ts-expect-error - Dynamic access
//           formData.append(field, String(processedValues[field as keyof typeof processedValues] || ""))
//         }
//       }
//     })
//     // Handle location separately - only if it actually changed or we're creating a new tour
//     if (processedValues.location && shouldIncludeField("location", processedValues.location)) {
//       changedFieldCount++
//       // Process the location data to ensure proper types
//       const locationData = processedValues.location
//       // Make sure we have all required fields in the location object and proper types
//       const fullLocation = {
//         map: locationData.map || originalTour.location?.map || "",
//         zip: locationData.zip || originalTour.location?.zip || "",
//         street: locationData.street || originalTour.location?.street || "",
//         city: locationData.city || originalTour.location?.city || "",
//         state: locationData.state || originalTour.location?.state || "",
//         country: locationData.country || originalTour.location?.country || "",
//         // Always ensure lat/lng are numbers
//         lat: locationData.lat?.toString() || "0",
//         lng: locationData.lng?.toString() || "0",
//       }
//       formData.append("location", JSON.stringify(fullLocation))
//     }

//     // Handle the unified dates structure
//     if (values.dates && shouldIncludeField("dates", values.dates)) {
//       changedFieldCount++
//       // Ensure the departures have proper date formats and properties
//       const formattedDates = {
//         ...values.dates,
//         days: values.dates.days || 0,
//         nights: values.dates.nights || 0,
//         scheduleType: values.dates.scheduleType || "flexible",
//         fixedDeparture: Boolean(values.dates.fixedDeparture),
//         multipleDates: Boolean(values.dates.multipleDates),
//         departures: Array.isArray(values.dates.departures)
//           ? values.dates.departures.map((departure) => ({
//               id: departure.id || String(Date.now()),
//               label: departure.label || "",
//               dateRange: departure.dateRange || { from: new Date(), to: new Date() },
//               selectedPricingOptions: Array.isArray(departure.selectedPricingOptions)
//                 ? departure.selectedPricingOptions
//                 : [],
//               isRecurring: Boolean(departure.isRecurring),
//               recurrencePattern: departure.isRecurring ? departure.recurrencePattern || "weekly" : undefined,
//               recurrenceEndDate: departure.isRecurring
//                 ? departure.recurrenceEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1))
//                 : undefined,
//               // Only include capacity if it exists
//               ...(departure.capacity !== undefined ? { capacity: departure.capacity } : {}),
//             }))
//           : [],
//       }

//       formData.append("dates", JSON.stringify(formattedDates))
//     }

//     // Handle the unified pricing structure
//     if (values.pricing && shouldIncludeField("pricing", values.pricing)) {
//       changedFieldCount++
//       const formattedPricing = {
//         ...values.pricing,
//         price:
//           typeof values.pricing.price === "string"
//             ? Number.parseFloat(values.pricing.price) || 0
//             : values.pricing.price || 0,
//         pricePerPerson: Boolean(values.pricing.pricePerPerson),
//         pricingOptionsEnabled: Boolean(values.pricing.pricingOptionsEnabled),
//         // Handle paxRange as an array [min, max] for the API
//         paxRange: Array.isArray(values.pricing.paxRange)
//           ? [
//               Number.parseInt(String(values.pricing.paxRange[0] || 1)),
//               Number.parseInt(String(values.pricing.paxRange[1] || 10)),
//             ]
//           : [1, 10],
//         discount: values.pricing.discount
//           ? {
//               discountEnabled: Boolean(values.pricing.discount.discountEnabled),
//               discountPrice:
//                 typeof values.pricing.discount.discountPrice === "string"
//                   ? Number.parseFloat(values.pricing.discount.discountPrice) || 0
//                   : values.pricing.discount.discountPrice || 0,
//               // Use dateRange from the discount object instead of discountDateRange
//               dateRange: values.pricing.discount.dateRange || { from: new Date(), to: new Date() },
//             }
//           : undefined,
//         pricingOptions: Array.isArray(values.pricing.pricingOptions)
//           ? values.pricing.pricingOptions.map((option) => ({
//               name: option.name || "",
//               category: option.category || "adult",
//               customCategory: option.customCategory || "",
//               price: typeof option.price === "string" ? Number.parseFloat(option.price) || 0 : option.price || 0,
//               discountEnabled: Boolean(option.discount?.discountEnabled),
//               // Update to use the discount object structure
//               discount: option.discount?.discountEnabled
//                 ? {
//                     discountEnabled: true,
//                     discountPrice:
//                       typeof option.discount?.discountPrice === "string"
//                         ? Number.parseFloat(option.discount.discountPrice) || 0
//                         : option.discount?.discountPrice || 0,
//                     dateRange: option.discount?.dateRange || { from: new Date(), to: new Date() },
//                   }
//                 : undefined,
//               paxRange: Array.isArray(option.paxRange)
//                 ? [Number.parseInt(String(option.paxRange[0] || 1)), Number.parseInt(String(option.paxRange[1] || 10))]
//                 : [1, 10],
//             }))
//           : [],
//         priceLockedUntil: values.pricing.priceLockedUntil || undefined,
//       }

//       formData.append("pricing", JSON.stringify(formattedPricing))
//     }
//     // Handle boolean fields - only if they changed or we're creating a new tour
//     ["enquiry"].forEach((key) => {
//       const processedKey = key as keyof typeof processedValues
//       if (processedValues[processedKey] !== undefined && shouldIncludeField(key, processedValues[processedKey])) {
//         changedFieldCount++
//         formData.append(key, processedValues[processedKey] ? "true" : "false")
//       }
//     })

//     // Handle category data
//     if (processedValues.category &&
//       Array.isArray(processedValues.category) &&
//       (isCreating || hasChanged("category", processedValues.category))
//     ) {
//       changedFieldCount++
//       formData.append("category", JSON.stringify(processedValues.category))

//       // Also append individual category items for backend compatibility
//       processedValues.category.forEach((item, index) => {
//         if (item && item.label && item.value) {
//           formData.append(`category[${index}][label]`, item.label)
//           formData.append(`category[${index}][value]`, item.value)
//         }
//       })
//     }

//     // Handle facts array
//     if (
//       processedValues.facts &&
//       Array.isArray(processedValues.facts) &&
//       (isCreating || hasChanged("facts", processedValues.facts))
//     ) {
//       changedFieldCount++
//       // Filter out empty fact entries
//       const filteredFacts = processedValues.facts.filter((item) => {
//         if (!item) return false
//         return !!(item.label || item.field_type || item.icon || item.value)
//       })
//       formData.append("facts", JSON.stringify(filteredFacts))
//     }

//     // Handle FAQs array
//     if (
//       processedValues.faqs &&
//       Array.isArray(processedValues.faqs) &&
//       (isCreating || hasChanged("faqs", processedValues.faqs))
//     ) {
//       changedFieldCount++
//       // Filter out empty FAQ entries
//       const filteredFaqs = processedValues.faqs.filter((item) => {
//         if (!item) return false
//         return !!(item.question || item.answer)
//       })
//       formData.append("faqs", JSON.stringify(filteredFaqs))
//     }

//     // Handle itinerary array
//     if (
//       processedValues.itinerary &&
//       Array.isArray(processedValues.itinerary) &&
//       (isCreating || hasChanged("itinerary", processedValues.itinerary))
//     ) {
//       changedFieldCount++
//       // Filter out empty/invalid itinerary items
//       const filteredItinerary = processedValues.itinerary.filter((item) => {
//         // Skip completely empty/undefined entries
//         if (!item) return false

//         // Skip items where all critical fields are empty/undefined
//         return (
//           (item.day && String(item.day).trim() !== "") ||
//           (item.title && String(item.title).trim() !== "") ||
//           (item.description && String(item.description).trim() !== "")
//         )
//       })

    
//       // Format the filtered itinerary items
//       const formattedItinerary = filteredItinerary.map((item) => ({
//         day: String(item.day || ""),
//         title: String(item.title || ""),
//         description: String(item.description || ""),
//         dateTime: item.dateTime instanceof Date ? item.dateTime : new Date(),
//       }))

//       formData.append("itinerary", JSON.stringify(formattedItinerary))

//       // Log the final itinerary data being sent
//       console.log("Sending itinerary data:", formattedItinerary)
//     } else if (isCreating) {
//       // For new tours, always send at least an empty array
//       formData.append("itinerary", JSON.stringify([]))
//     }

//     // Handle exclude separately
//     if (values.exclude && shouldIncludeField("exclude", values.exclude)) {
//       changedFieldCount++
//       // Convert to string for Zod validation
//       const excludeValue = Array.isArray(values.exclude) ? values.exclude.join(", ") : String(values.exclude || "")
//       formData.append("exclude", excludeValue)
//     }

//     // Handle gallery array
//     if (
//       processedValues.gallery &&
//       Array.isArray(processedValues.gallery) &&
//       (isCreating || hasChanged("gallery", processedValues.gallery))
//     ) {
//       changedFieldCount++
//       formData.append("gallery", JSON.stringify(processedValues.gallery))
//     }

//     // Handle destination separately if needed
//     if (
//       processedValues.destination &&
//       (isCreating || hasChanged("destination", processedValues.destination)) &&
//       !topLevelFields.includes("destination")
//     ) {
//       changedFieldCount++
//       formData.append("destination", String(processedValues.destination))
//     }

//     // Log statistics about the form submission
//     console.log(`Submitting form with ${changedFieldCount} changed fields`)

//     try {
//       // Make sure we're passing the FormData object directly to the mutation function
//       mutate(formData)
//     } catch (error) {
//       console.error("Error creating tour:", error)
//     }
//   } // Close the onSubmit function

//   return {
//     form,
//     onSubmit,
//     itineraryFields,
//     itineraryAppend,
//     itineraryRemove,
//     factFields,
//     factAppend,
//     factRemove,
//     faqFields,
//     faqAppend,
//     faqRemove,
//     pricingOptionsFields,
//     pricingOptionsAppend,
//     pricingOptionsRemove,
//     dateRangeFields,
//     dateRangeAppend,
//     dateRangeRemove,
//   }
// }
