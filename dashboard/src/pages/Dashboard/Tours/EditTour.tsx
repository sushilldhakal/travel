import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { getSingleTour, deleteTour } from '@/http';
import { useToast } from '@/components/ui/use-toast';
import { Breadcrumb, FactData, FaqData, Itinerary, Tour, TourData, Category } from '@/Provider/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { Form } from "@/components/ui/form"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/userDefinedComponents/Loader';
import { JSONContent } from 'novel';
import { defaultValue } from '@/lib/default-value';
import TabContent from './Components/TabContent';
import { tabs } from './Components/tabs';
import { useFormHandlers } from './Components/useFormHandlers';
import TabNavigation from './Components/TabNavigation';
import { useTourMutation } from './Components/useTourMutation';
import { getUserId } from '@/util/authUtils';
import { useFacts } from './FACTS/useFacts';
import { useFaq } from './FAQ/useFaq';
import { useCategories } from './Category/useCategories';

// Define interfaces for proper typing - matching the TabContent expected types


const EditTour: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const [singleTour, setSingleTour] = useState<boolean>(false);
    const [singleTourData, setSingleTourData] = useState<Tour | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast()
    const [editorContent, setEditorContent] = useState<JSONContent>(defaultValue);
    const userId = getUserId();
    const { data: initialTourData, isLoading, isError, error } = useQuery<TourData, Error>({
        queryKey: ['tours', tourId],
        queryFn: () => tourId ? getSingleTour(tourId) : Promise.reject('No tour ID provided'),
        enabled: !!tourId,
    });
    useEffect(() => {
        if (initialTourData && tourId) {
            const breadcrumbs = initialTourData.breadcrumbs;
            const breadcrumbLabel = breadcrumbs?.[0]?.label ? breadcrumbs[0].label.charAt(0).toUpperCase() + breadcrumbs[0].label.slice(1) : '';
            const breadcrumbItems: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Tours', href: '/dashboard/tours', type: 'link' },
                { label: breadcrumbLabel, href: `/dashboard/tours/edit_tour${tourId}`, type: 'page' },
            ];
            updateBreadcrumbs(breadcrumbItems);

            // Get the tour data from the response
            const tourData = initialTourData.tour || initialTourData;
            // Set the tour data in state
            setSingleTourData(tourData);
            setSingleTour(true);
        }
    }, [updateBreadcrumbs, initialTourData, tourId]);

    const { mutate: tourMutation, isPending } = useTourMutation();
    const {
        form,
        onSubmit,
        itineraryFields,
        itineraryAppend,
        itineraryRemove,
        factFields: factsFields,
        factAppend: factsAppend,
        factRemove: factsRemove,
        faqFields,
        faqAppend,
        faqRemove,
        pricingOptionsFields: pricingFields,
        pricingOptionsAppend: pricingAppend,
        pricingOptionsRemove: pricingRemove,
        dateRangeFields,
        dateRangeAppend,
        dateRangeRemove,
    } = useFormHandlers(editorContent);

    const { data: categories } = useCategories(userId);
    const { data: facts } = useFacts(userId);
    const { data: faqs } = useFaq(userId);

    const defaultItinerary = useMemo(() => [
        {
            day: '',
            title: '',
            description: '',
            dateTime: new Date(),
        }
    ], []);

    const defaultCategory = useMemo(() => [
        {
            label: '',
            value: '',
        }
    ], []);

    const defaultLocation = useMemo(() => [
        {
            city: '',
            country: '',
            street: '',
            state: '',
            lat: '',
            lng: '',
        }
    ], []);

    const defaultFacts = useMemo(() => [
        {
            title: '',
            value: [] as string[]
        }
    ], []);

    const defaultFaqs = useMemo(() => [
        {
            question: '',
            answer: '',
        }
    ], []);

    useEffect(() => {
        if (singleTourData && categories) {
            const mappedCategory = singleTourData?.category?.map((item: Category) => ({
                label: item.categoryName || item.label || "",
                value: item.categoryId || item.value || item._id || "",
            })) || defaultCategory;

            const mappedItinerary = singleTourData?.itinerary?.map((item) => ({
                day: item.day,
                title: item.title,
                description: item.description,
                dateTime: item.date ? new Date(item.date) : new Date(),
            })) || defaultItinerary;

            const mappedFacts = singleTourData.facts?.map(item => {
                // Initialize formatted value
                let formattedValue = item?.value;

                // Process based on field type
                if (item?.field_type === 'Multi Select') {
                    // Multi Select expects an array of objects with label/value
                    if (Array.isArray(item?.value)) {
                        // If it's already an array of objects, use it directly
                        if (item.value.length > 0 && typeof item.value[0] === 'object') {
                            // Ensure proper typing with explicit cast
                            formattedValue = item.value as Array<{ label: string; value: string }>;
                        }
                        // If it's a nested array, use the first item
                        else if (item.value.length > 0 && Array.isArray(item.value[0])) {
                            // Convert string array to object array
                            const innerArray = item.value[0] as string[];
                            formattedValue = innerArray.map(val => ({
                                label: val,
                                value: val
                            }));
                        }
                        // Otherwise, convert string values to objects
                        else {
                            formattedValue = item.value.map(val => ({
                                label: String(val),
                                value: String(val)
                            }));
                        }
                    } else {
                        formattedValue = [];
                    }
                } else if (item?.field_type === 'Plain Text' || item?.field_type === 'Single Select') {
                    // Plain Text/Single Select expects a string array
                    if (Array.isArray(item?.value)) {
                        // Ensure we have a string array by mapping values to strings
                        formattedValue = item.value.map(val => String(val));
                    } else {
                        formattedValue = [];
                    }
                }

                return {
                    title: item?.title || '',
                    field_type: item?.field_type || '',
                    value: formattedValue,
                    icon: item?.icon || ''
                };
            }) || []

            const mappedFaqs = singleTourData?.faqs?.map((item: FaqData) => ({
                question: item.question,
                answer: item.answer,
            })) || defaultFaqs;

            // Parse pricing options with proper field names
            const mappedPricingOptions = singleTourData.pricingOptions
                ? Array.isArray(singleTourData.pricingOptions)
                    ? singleTourData.pricingOptions
                    : typeof singleTourData.pricingOptions === 'string'
                        ? JSON.parse(singleTourData.pricingOptions)
                        : []
                : [];

            // Transform pricing options to match the form field structure
            const formattedPricingOptions = mappedPricingOptions.map((option: Record<string, unknown>) => ({
                name: option.name || option.optionName || '',
                category: option.category || 'adult',
                customCategory: option.customCategory || '',
                price: parseFloat(String(option.price || option.optionPrice || 0)),
                discountEnabled: Boolean(option.discountEnabled),
                discountPrice: parseFloat(String(option.discountPrice || 0)),
                discountDateRange: option.discountDateRange ? {
                    from: option.discountDateRange && typeof option.discountDateRange === 'object' && 'from' in option.discountDateRange && option.discountDateRange.from
                        ? new Date(option.discountDateRange.from as string)
                        : option.discountDateRange && typeof option.discountDateRange === 'object' && 'startDate' in option.discountDateRange && option.discountDateRange.startDate
                            ? new Date(option.discountDateRange.startDate as string)
                            : new Date(),
                    to: option.discountDateRange && typeof option.discountDateRange === 'object' && 'to' in option.discountDateRange && option.discountDateRange.to
                        ? new Date(option.discountDateRange.to as string)
                        : option.discountDateRange && typeof option.discountDateRange === 'object' && 'endDate' in option.discountDateRange && option.discountDateRange.endDate
                            ? new Date(option.discountDateRange.endDate as string)
                            : new Date()
                } : { from: new Date(), to: new Date() },
                paxRange: Array.isArray(option.paxRange) ?
                    [parseInt(String(option.paxRange[0] || 1)), parseInt(String(option.paxRange[1] || 10))] :
                    [1, 10]
            }));


            // Create proper defaults for dates and pricing fields

            // Format pricing data using the new unified schema
            const formattedPricing = {
                price: parseFloat(String(singleTourData.price || 0)),
                pricePerPerson: singleTourData.pricePerType === "person",
                pricingOptionsEnabled: Boolean(singleTourData.pricingOptionsEnabled),
                paxRange: [
                    parseInt(String(singleTourData.minSize || 1)),
                    parseInt(String(singleTourData.maxSize || 10))
                ],
                groupSize: parseInt(String(singleTourData.groupSize || 1)),
                discount: {
                    discountEnabled: Boolean(singleTourData.discountEnabled),
                    discountPrice: parseFloat(String(singleTourData.discountPrice || 0)),
                    dateRange: singleTourData?.discountDateRange ? {
                        from: singleTourData.discountDateRange && typeof singleTourData.discountDateRange === 'object' && 'from' in singleTourData.discountDateRange && singleTourData.discountDateRange.from
                            ? new Date(singleTourData.discountDateRange.from as string)
                            : singleTourData.discountDateRange && typeof singleTourData.discountDateRange === 'object' && 'startDate' in singleTourData.discountDateRange && singleTourData.discountDateRange.startDate
                                ? new Date(singleTourData.discountDateRange.startDate as string)
                                : new Date(),
                        to: singleTourData.discountDateRange && typeof singleTourData.discountDateRange === 'object' && 'to' in singleTourData.discountDateRange && singleTourData.discountDateRange.to
                            ? new Date(singleTourData.discountDateRange.to as string)
                            : singleTourData.discountDateRange && typeof singleTourData.discountDateRange === 'object' && 'endDate' in singleTourData.discountDateRange && singleTourData.discountDateRange.endDate
                                ? new Date(singleTourData.discountDateRange.endDate as string)
                                : new Date()
                    } : { from: new Date(), to: new Date() }
                },
                pricingOptions: formattedPricingOptions,
                priceLockedUntil: singleTourData.priceLockedUntil ? new Date(singleTourData.priceLockedUntil as string) : undefined
            };

            // Format dates data using the new unified schema
            const formattedDates = {
                days: singleTourData?.dates?.tripDuration ? parseInt(singleTourData.dates.tripDuration.split(' ')[0]) || 0 : 0,
                nights: singleTourData?.dates?.tripDuration ? (parseInt(singleTourData.dates.tripDuration.split(' ')[0]) - 1) || 0 : 0,
                fixedDeparture: Boolean(singleTourData.fixedDeparture),
                multipleDates: Boolean(singleTourData.multipleDates),
                scheduleType: singleTourData.multipleDates
                    ? 'recurring'
                    : singleTourData.fixedDeparture
                        ? 'fixed'
                        : 'flexible',
                singleDateRange: {
                    from: singleTourData?.dates?.startDate ? new Date(singleTourData.dates.startDate) : new Date(),
                    to: singleTourData?.dates?.endDate ? new Date(singleTourData.dates.endDate) : new Date()
                },
                departures: Array.isArray(singleTourData.dateRanges)
                    ? singleTourData.dateRanges.map((range: any) => ({
                        id: range.id || String(Date.now()),
                        label: range.label || '',
                        dateRange: range.dateRange || { from: new Date(), to: new Date() },
                        isRecurring: Boolean(range.isRecurring),
                        recurrencePattern: range.recurrencePattern || 'weekly',
                        recurrenceEndDate: range.recurrenceEndDate ? new Date(range.recurrenceEndDate) : undefined,
                        selectedPricingOptions: Array.isArray(range.selectedPricingOptions) ? range.selectedPricingOptions : [],
                        capacity: parseInt(String(range.capacity || 0))
                    }))
                    : []
            };

            // Set form values using the actual values rather than constructors
            form.reset({
                title: singleTourData.title || "",
                excerpt: singleTourData.excerpt || "",
                description: singleTourData.description || "",
                code: singleTourData.code || "",
                tourStatus: singleTourData.tourStatus || "",
                coverImage: singleTourData.coverImage || "",
                file: singleTourData.file || "",
                outline: singleTourData.outline || "",
                include: singleTourData.include || "",
                exclude: singleTourData.exclude || "",
                category: mappedCategory,
                itinerary: mappedItinerary,
                faqs: mappedFaqs,
                facts: mappedFacts,
                location: singleTourData?.location
                    ? {
                        lat: parseFloat(String(singleTourData.location.latitude || 0)),
                        lng: parseFloat(String(singleTourData.location.longitude || 0)),
                        country: singleTourData.location.country || "",
                        city: singleTourData.location.city || "",
                        street: singleTourData.location.street || "",
                        state: singleTourData.location.state || "",
                    }
                    : defaultLocation[0],

                // Use the new unified schema objects
                pricing: formattedPricing,
                dates: formattedDates,

                // Set enquiry and isSpecialOffer flags
                enquiry: Boolean(singleTourData.enquiry),
                isSpecialOffer: Boolean(singleTourData.isSpecialOffer),

                // Set map value
                map: singleTourData.map || "",
                destination: singleTourData.destination || ""
            } as any); // Use a type assertion here to avoid strict typing on form reset

            try {
                const parsedDescription = JSON.parse(singleTourData.description || '');
                setEditorContent(parsedDescription as JSONContent);
            } catch (error) {
                setEditorContent(singleTourData.description as unknown as JSONContent);
            }
        }
    }, [singleTourData, form, categories, defaultCategory, defaultFacts, defaultFaqs, defaultItinerary, defaultLocation]);

    const deleteMutation = useMutation({
        mutationFn: () => {
            if (tourId) {
                return deleteTour(tourId)
            }
            throw new Error('No tour ID provided')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tours'] });
            toast({
                title: 'Tour deleted successfully',
                description: 'The tour has been deleted successfully.',
            });
        },
        onError: () => {
            toast({
                title: 'Failed to delete tour',
                description: 'An error occurred while deleting the tour. Please try again later.',
            });
        }
    });

    const handleDeleteTour = async () => {
        if (singleTour) {
            deleteMutation.mutate();
            navigate('/dashboard/tours');
        }
    };

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            setActiveTab(location.hash.substring(1));
        }
    }, [location.hash]);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;

    return (
        <div className="flex min-h-screen w-full flex-col">
            {/* Show loading state for initial data fetch */}
            {isLoading && (
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
                    <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loader />
                        <p className="text-center text-muted-foreground">Loading tour data...</p>
                    </div>
                </div>
            )}

            {/* Show error state */}
            {isError && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
                        <h3 className="font-bold text-lg mb-2">Error Loading Tour</h3>
                        <p>{error?.message || "Failed to load tour data. Please try again later."}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Show mutation loading state */}
            {isPending && <div className="flex flex-col space-y-3 ">
                <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
                <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Loader />
                    <p className="text-center text-muted-foreground">Updating tour...</p>
                </div>
            </div>}

            {/* Only render the form if we have data and no errors */}
            {!isLoading && !isError && (
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        console.log("Form for API", form.getValues());
                        form.handleSubmit(
                            (values) => {
                                // Parse string JSON fields that come from form data
                                // This ensures complex nested objects are properly handled
                                const parsePricingOptions = () => {
                                    if (!values.pricingOptions) return [];

                                    try {
                                        // Handle both string and array cases
                                        const options = typeof values.pricingOptions === 'string'
                                            ? JSON.parse(values.pricingOptions)
                                            : values.pricingOptions;

                                        // Ensure we return a properly typed array with correct field names
                                        return (options as Array<Record<string, unknown>>).map(option => {
                                            // Map optionName to name and optionPrice to price if old format
                                            const name = option.name || option.optionName || '';
                                            const price = parseFloat(String(option.price || option.optionPrice || 0));

                                            return {
                                                name,
                                                category: String(option.category || 'adult'),
                                                customCategory: String(option.customCategory || ''),
                                                price,
                                                discountEnabled: convertToBoolean(option.discountEnabled),
                                                discountPrice: parseFloat(String(option.discountPrice || 0)),
                                                discountDateRange: option.discountDateRange ? {
                                                    from: option.discountDateRange && typeof option.discountDateRange === 'object' && 'from' in option.discountDateRange && option.discountDateRange.from
                                                        ? new Date(option.discountDateRange.from as string)
                                                        : option.discountDateRange && typeof option.discountDateRange === 'object' && 'startDate' in option.discountDateRange && option.discountDateRange.startDate
                                                            ? new Date(option.discountDateRange.startDate as string)
                                                            : new Date(),
                                                    to: option.discountDateRange && typeof option.discountDateRange === 'object' && 'to' in option.discountDateRange && option.discountDateRange.to
                                                        ? new Date(option.discountDateRange.to as string)
                                                        : option.discountDateRange && typeof option.discountDateRange === 'object' && 'endDate' in option.discountDateRange && option.discountDateRange.endDate
                                                            ? new Date(option.discountDateRange.endDate as string)
                                                            : new Date()
                                                } : { from: new Date(), to: new Date() },
                                                paxRange: Array.isArray(option.paxRange) ?
                                                    [parseInt(String(option.paxRange[0] || 1)), parseInt(String(option.paxRange[1] || 10))] :
                                                    [1, 10]
                                            };
                                        });
                                    } catch (e) {
                                        console.error("Error parsing pricingOptions:", e);
                                        return [];
                                    }
                                };

                                const parseDiscountDateRange = () => {
                                    if (!values.discountDateRange) return { from: new Date(), to: new Date() };
                                    try {
                                        // Handle both string and object cases
                                        const discountDateRange = values.discountDateRange;
                                        if (typeof discountDateRange === 'string') {
                                            const parsed = JSON.parse(discountDateRange);
                                            return {
                                                from: parsed.from ? new Date(parsed.from) : parsed.startDate ? new Date(parsed.startDate) : new Date(),
                                                to: parsed.to ? new Date(parsed.to) : parsed.endDate ? new Date(parsed.endDate) : new Date()
                                            };
                                        } else {
                                            return {
                                                from: discountDateRange.from ? new Date(discountDateRange.from) :
                                                    discountDateRange.startDate ? new Date(discountDateRange.startDate) : new Date(),
                                                to: discountDateRange.to ? new Date(discountDateRange.to) :
                                                    discountDateRange.endDate ? new Date(discountDateRange.endDate) : new Date()
                                            };
                                        }
                                    } catch (e) {
                                        console.error("Error parsing discountDateRange:", e);
                                        // Return a valid object with defaults if parsing fails
                                        return { from: new Date(), to: new Date() };
                                    }
                                };

                                const parseTourDates = () => {
                                    if (!values.tourDates) return { days: 0, nights: 0, dateRange: { from: new Date(), to: new Date() }, isRecurring: false };

                                    try {
                                        const tourDatesStr = typeof values.tourDates === 'string'
                                            ? values.tourDates
                                            : JSON.stringify(values.tourDates);
                                        const parsed = JSON.parse(tourDatesStr);

                                        // Format tourDates to match API expectations
                                        const dateRange = parsed.dateRange || {};
                                        return {
                                            days: Number(parsed.days || 0),
                                            nights: Number(parsed.nights || 0),
                                            isRecurring: Boolean(parsed.isRecurring),
                                            dateRange: {
                                                from: dateRange.startDate ? new Date(dateRange.startDate) : dateRange.from ? new Date(dateRange.from) : new Date(),
                                                to: dateRange.endDate ? new Date(dateRange.endDate) : dateRange.to ? new Date(dateRange.to) : new Date()
                                            }
                                        };
                                    } catch (e) {
                                        console.error("Error parsing tourDates:", e);
                                        return {
                                            days: 0,
                                            nights: 0,
                                            dateRange: { from: new Date(), to: new Date() },
                                            isRecurring: false
                                        };
                                    }
                                };

                                // Convert dateRanges to the expected format with proper typing
                                const parseDateRanges = () => {
                                    if (!values.dateRanges) return [];

                                    try {
                                        const ranges = typeof values.dateRanges === 'string'
                                            ? JSON.parse(values.dateRanges)
                                            : values.dateRanges;

                                        return (ranges as Array<Record<string, unknown>>).map((range) => {
                                            const dateRange = range.dateRange || {};
                                            return {
                                                id: range.id || String(Math.random()),
                                                label: range.label || '',
                                                dateRange: {
                                                    from: dateRange.startDate ? new Date(dateRange.startDate) : dateRange.from ? new Date(dateRange.from) : new Date(),
                                                    to: dateRange.endDate ? new Date(dateRange.endDate) : dateRange.to ? new Date(dateRange.to) : new Date()
                                                },
                                                selectedPricingOptions: Array.isArray(range.selectedPricingOptions) ? range.selectedPricingOptions : [],
                                                isRecurring: Boolean(range.isRecurring)
                                            };
                                        });
                                    } catch (e) {
                                        console.error("Error parsing dateRanges:", e);
                                        return [];
                                    }
                                };

                                // Process facts to ensure Multi Select values are properly handled
                                const processedFacts = values.facts?.map(fact => {
                                    // Handle Multi Select facts which might have stringified JSON values
                                    if (fact.field_type === "Multi Select" && typeof fact.value === 'string') {
                                        try {
                                            return {
                                                ...fact,
                                                value: JSON.parse(fact.value),
                                                field_type: fact.field_type
                                            };
                                        } catch (e) {
                                            console.error("Error parsing fact value:", e);
                                            return fact;
                                        }
                                    }
                                    return {
                                        ...fact,
                                        field_type: fact.field_type
                                    };
                                });

                                // Convert string number values to actual numbers
                                const convertToNumber = (value: any) => {
                                    if (value === undefined || value === null || value === '') return undefined;
                                    const num = Number(value);
                                    return isNaN(num) ? value : num;
                                };

                                // Type-safe conversion for boolean values
                                const convertToBoolean = (value: unknown): boolean => {
                                    if (typeof value === 'boolean') return value;
                                    if (typeof value === 'string') return value.toLowerCase() === 'true';
                                    return Boolean(value);
                                };

                                // Ensure values are properly typed and parsed for submission
                                const formValues = {
                                    ...values,
                                    price: convertToNumber(values.price),
                                    minSize: convertToNumber(values.minSize),
                                    maxSize: convertToNumber(values.maxSize),
                                    groupSize: convertToNumber(values.groupSize),
                                    discountPrice: convertToNumber(values.discountPrice),
                                    discountEnabled: convertToBoolean(values.discountEnabled),
                                    pricingOptionsEnabled: convertToBoolean(values.pricingOptionsEnabled),
                                    fixedDeparture: convertToBoolean(values.fixedDeparture),
                                    multipleDates: convertToBoolean(values.multipleDates),
                                    enquiry: convertToBoolean(values.enquiry),
                                    pricePerType: values.pricePerType || 'person',
                                    facts: processedFacts,
                                    discountDateRange: parseDiscountDateRange(),
                                    tourDates: parseTourDates(),
                                    dateRanges: parseDateRanges(),
                                    location: values.location ? {
                                        ...values.location,
                                        lat: convertToNumber(values.location.lat),
                                        lng: convertToNumber(values.location.lng)
                                    } : undefined,
                                    // Parse the complex nested objects
                                    pricingOptions: parsePricingOptions(),
                                    // Handle fixedDate properly according to schema
                                    fixedDate: values.fixedDate ? (
                                        typeof values.fixedDate === 'string' ?
                                            JSON.parse(values.fixedDate) :
                                            values.fixedDate
                                    ) : { dateRange: { from: new Date(), to: new Date() } }
                                };

                                console.log("Processed form values:", formValues);
                                onSubmit(formValues as any, tourMutation);
                            },
                            (errors) => {
                                console.log("Form Errors:", errors); // log errors
                            }
                        )();
                    }}>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to delete this tour?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your tour
                                            and remove your data associated to this tour from servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteTour} className={buttonVariants({ variant: "destructive" })} > Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button type="submit" size="sm">
                                {isPending && <LoaderCircle className="animate-spin" />}
                                <span className="ml-2">Update Tour</span>
                            </Button>
                        </div>
                        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                            <aside className="sticky top-8 inset-x-0 z-20 text-left px-4 sm:px-6 lg:px-8">
                                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                                <div className="py-4">
                                    <Button type="submit"
                                        disabled={isPending}
                                        className='pr-6 ml-4'
                                    >
                                        {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        <span className="ml-2">Save</span>
                                    </Button>
                                </div>
                            </aside>

                            <div className="grid gap-3 lg:col-span-1">
                                <TabContent
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    form={form}
                                    editorContent={editorContent}
                                    setEditorContent={setEditorContent}
                                    itineraryFields={itineraryFields as unknown as Itinerary[]}
                                    itineraryAppend={itineraryAppend as unknown as (value: Partial<Itinerary> | Partial<Itinerary>[]) => void}
                                    itineraryRemove={itineraryRemove}
                                    factsFields={factsFields as unknown as FactData[]}
                                    factsAppend={factsAppend as unknown as (value: Partial<FactData>) => void}
                                    factsRemove={factsRemove}
                                    faqFields={faqFields as unknown as FaqData[]}
                                    faqAppend={faqAppend as unknown as (value: Partial<FaqData>) => void}
                                    faqRemove={faqRemove}
                                    pricingFields={pricingFields as unknown as any[]}
                                    pricingAppend={pricingAppend as unknown as (value: any) => void}
                                    pricingRemove={pricingRemove}
                                    dateRangeFields={dateRangeFields as unknown as any[]}
                                    dateRangeAppend={dateRangeAppend as unknown as (value: any) => void}
                                    dateRangeRemove={dateRangeRemove}
                                    singleTourData={singleTourData as unknown as Record<string, unknown>}
                                    categories={categories}
                                    facts={facts}
                                    faqs={faqs}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default EditTour;
