import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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


interface TabContentProps {
    activeTab: string;
    tabs: { id: string; content: React.ReactNode }[];
    mutation: { isPending: boolean };
    isSingleTour: string;
    generateTripCode: () => string;
    initialTourData: InitialToutData;

}

interface DivType {
    id: number;
    date: Date | undefined;
    content: string;
}


interface InitialToutData {
    title: string,
    description: string,
    code: string,
    tourStatus: string,
    coverImage: string,
    file: string,
}


function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    code: z.string().min(2, 'Trip code must be at least 2 characters.'),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    tourStatus: z.string(),
    coverImage: z.instanceof(FileList).refine((file) => {
        return file.length == 1;
    }, 'Cover Image is required'),
    file: z.instanceof(FileList).refine((file) => {
        return file.length == 1;
    }, 'PDF is required'),
});




const EditTour: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const [tripCode, setTripCode] = useState(makeid(6).toUpperCase());
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

        if (singleTourData) {
            const defaultValues = {
                title: singleTourData.title || '',
                description: singleTourData.description || '',
                code: singleTourData.tripCode || tripCode,
                tourStatus: singleTourData.tourStatus || '',
                coverImage: singleTourData.coverImage || '',
                file: singleTourData.file || '',
            }
            form.reset(defaultValues);
        }
    }, [updateBreadcrumbs, initialTourData, singleTourData, tourId]);





    // console.log("singleTourData", singleTour)

    const coverImageRef = form.register('coverImage');
    const fileRef = form.register('file');

    const tourMutation = useMutation({
        mutationFn: (data: FormData) => updateTour(tourId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tours', tourId].filter(Boolean) });
            const route = `/dashboard/tours/edit_tour/${tourId}`;
            navigate(route);
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
        formdata.append('coverImage', values.coverImage[0]);
        formdata.append('file', values.file[0]);
        tourMutation.mutate(formdata);
        console.log("formData", formdata)
        console.log(values);
    }

    const handleDeleteTour = async () => {
        if (singleTour) {
            deleteMutation.mutate();
            navigate('/dashboard/tours');
        }
    };

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;

    const tourTabContent = () => {
        switch (tab.id) {

            case tabs[0].id: return <Overview />;
            case tabs[1].id: return <h1>Project One</h1>;
            case tabs[2].id: return <h1>Project One</h1>;
            case tabs[3].id: return <h1>Project One</h1>;

            default: return <h1>No project match</h1>
        }
    }

    const Overview = () => {
        return (

            <Card>
                <CardHeader>
                    <CardTitle>Tour Details</CardTitle>
                    <CardDescription>Enter title and description</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full"
                                                {...field}
                                                placeholder='Tour Title'

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Trip Code:</FormLabel>
                                        <FormControl className="relative">
                                            <Input
                                                type="text"
                                                className="w-full"
                                                {...field}
                                                placeholder='Trip Code'
                                                disabled
                                            />

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-32"
                                                {...field}
                                                placeholder='Description'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3 auto-rows-max grid-cols-2">
                            <FormField
                                control={form.control}
                                name="tourStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Publish">Publish</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                                <SelectItem value="Expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="grid grid-cols-2 gap-3">

                        </div>
                        <div className="grid grid-flow-col gap-3">
                            <div className="col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <span className="">
                                        <img src={singleTourData?.coverImage} alt={singleTourData?.title} />
                                    </span>
                                    <FormField
                                        control={form.control}
                                        name="coverImage"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Cover Image</FormLabel>
                                                <FormControl>

                                                    <Input
                                                        type="file"
                                                        className="w-full"
                                                        {...coverImageRef}

                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    upload images.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <div className='mt-3'>
                                        <Link target='_blank' className="" to={singleTourData?.file} download>
                                            <FileText />
                                            Download File

                                        </Link>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="file"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Tour PDF File</FormLabel>
                                                <FormControl>

                                                    <Input
                                                        type="file"
                                                        className="w-full"
                                                        {...fileRef}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    upload Tour PDF.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" size="sm"
                        disabled={tourMutation.isPending}
                    >
                        {tourMutation.isPending && <LoaderCircle className="animate-spin" />}
                        <span className="ml-2">Save</span>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

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
                            {/* <TabContent
            //@ts-expect-error
            initialTourData={singleTourData}
            mutation={tourMutation}
            activeTab={activeTab}
            tabs={tabsWithContent}
            isSingleTour={singleTour}
            onSubmit={onSubmit}
          /> */}
                            {tourTabContent()}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EditTour;


