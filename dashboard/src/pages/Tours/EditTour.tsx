import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { getSingleTour, createTour, updateTour, deleteTour } from '@/http/api';
import { useToast } from '@/components/ui/use-toast';
import { Breadcrumb, TourData } from '@/Provider/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { FileText, LoaderCircle } from 'lucide-react';
import TabContent from '@/userDefinedComponents/TabContent';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
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

const tabs = [
    { id: 'overview', title: 'Overview' },
    { id: 'itinerary', title: 'Itinerary' },
    { id: 'price-dates', title: 'Price & Dates' },
    { id: 'inc-exc', title: 'Inc+/Exc-' },
    { id: 'facts', title: 'Facts' },
    { id: 'gallery', title: 'Gallery' },
    { id: 'locations', title: 'Locations' },
    { id: 'faqs', title: 'FAQs' },
    { id: 'downloads', title: 'Downloads' },
    { id: 'tabs-display', title: 'Tabs in Display' },
    { id: 'enquiry', title: 'Enquiry' },
];



interface TourData {
    title: string,
    description: string,
    code: string,
    tourStatus: string,
    coverImage: string,
    file: string,
    tour: string[],
    breadcrumbs: string[],
    itinerary: string[],
    price: string[],
    incExc: string[],
    facts: string[],
    gallery: string[],
    locations: string[],
    faqs: string[],
    downloads: string[],
    tabsDisplay: string[],
    enquiry: string[],
}




const MAX_FILE_SIZE = 800000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    code: z.string().min(2, 'Trip code must be at least 2 characters.'),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    tourStatus: z.string(),
    price: z.number().min(0, 'Price must be a positive number'),
    coverImage: z.any().optional()
        .refine(file => file.length == 1 ? ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type) ? true : false : true, 'Invalid file. choose either JPEG or PNG image')
        .refine(file => file.length == 1 ? file[0]?.size <= MAX_FILE_SIZE ? true : false : true, 'Max file size allowed is 8MB.'),
    file: z.any().optional()
        .refine(file => file.length == 1 ? ACCEPTED_FILE_TYPES.includes(file?.[0]?.type) ? true : false : true, 'Invalid file. choose PDF file')
        .refine(file => file.length == 1 ? file[0]?.size <= MAX_FILE_SIZE ? true : false : true, 'Max file size allowed is 8MB.'),
});

const EditTour: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const [singleTour, setSingleTour] = useState<boolean>(false);
    const [singleTourData, setSingleTourData] = useState<TourData | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast()
    const { data: initialTourData } = useQuery<TourData, Error>({
        queryKey: ['tours', tourId],
        queryFn: () => tourId ? getSingleTour(tourId) : Promise.reject('No tour ID provided'),
        enabled: !!tourId,

    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            code: '',
            tourStatus: '',
            coverImage: '',
            price: 0,
            file: '',
        }

    });


    useEffect(() => {
        if (initialTourData && tourId) {
            const breadcrumbLabel = initialTourData.breadcrumbs?.[0]?.label ? initialTourData.breadcrumbs?.[0]?.label.charAt(0).toUpperCase() + initialTourData?.breadcrumbs[0]?.label.slice(1) : '';
            const breadcrumbs: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Tours', href: '/dashboard/tours', type: 'link' },
                { label: breadcrumbLabel, href: `/dashboard/tours/edit_tour${tourId}`, type: 'page' },
            ];
            updateBreadcrumbs(breadcrumbs);
            setSingleTourData(initialTourData?.tour);
            setSingleTour(true);
        }
    }, [updateBreadcrumbs, initialTourData, tourId]);

    useEffect(() => {
        if (singleTourData) {
            const defaultValues = {
                title: singleTourData.title || '',
                description: singleTourData.description || '',
                code: singleTourData.code || '',
                tourStatus: singleTourData.tourStatus || '',
                coverImage: singleTourData.coverImage || '',
                file: singleTourData.file || '',
                price: singleTourData.price || 0,
            };
            form.reset(defaultValues);
        }
    }, [singleTourData, form]);

    console.log(singleTourData);

    const tourMutation = useMutation({
        mutationFn: (data: FormData) => updateTour(tourId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tours', tourId].filter(Boolean) });
            toast({
                title: 'Tour updated successfully',
                description: 'The tour has been updated successfully.',
            });
        },
        onError: () => {
            toast({
                title: `Failed to update tour`,
                description: `An error occurred while updating the tour. Please try again later.`,
            });
        }
    });

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
    function onSubmit(values: z.infer<typeof formSchema>) {
        const formdata = new FormData();
        formdata.append('title', values.title);
        formdata.append('code', values.code);
        formdata.append('description', values.description);
        formdata.append('tourStatus', values.tourStatus);
        formdata.append('price', values.price.toString());
        if (values.coverImage && values.coverImage[0]) {
            formdata.append('coverImage', values.coverImage[0]);
        }
        if (values.file && values.file[0]) {
            formdata.append('file', values.file[0]);
        }
        tourMutation.mutate(formdata);
    }


    const handleDeleteTour = async () => {
        if (singleTour) {
            deleteMutation.mutate();
            navigate('/dashboard/tours');
        }
    };

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabQuery = queryParams.get('tab') || tabs[0].id;
    useEffect(() => {
        setActiveTab(tabQuery);
    }, [tabQuery]);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;


    return (
        <div className="flex min-h-screen w-full flex-col">
            {tourMutation.isPending && <div className="flex flex-col space-y-3 ">
                <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
                <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Loader />
                </div>
            </div>}

            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit(onSubmit)();
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
                            {tourMutation.isPending && <LoaderCircle className="animate-spin" />}
                            <span className="ml-2">Update Tour</span>
                        </Button>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                        <nav className="grid gap-5 text-md text-muted-foreground lg:col-span-1">
                            {tabs.map(tab => (
                                <Link
                                    key={tab.id}
                                    to={`?tab=${tab.id}`}
                                    className={`font-semibold ${activeTab === tab.id ? 'text-primary' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.title}
                                </Link>
                            ))}
                        </nav>
                        <div className="grid gap-3 lg:col-span-1">
                            <TabContent
                                form={form}
                                activeTab={activeTab}
                                tabs={tabs}
                                singleTour={singleTour}
                                tourMutation={tourMutation}
                                singleTourData={singleTourData}

                            />
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EditTour;

