import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { getSingleTour, deleteTour } from '@/http/api';
import { useToast } from '@/components/ui/use-toast';
import { Breadcrumb, Tour, TourData } from '@/Provider/types';
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
import { useCategories } from './Components/useCategories';
import { getUserId } from '@/util/AuthLayout';
import { useFacts } from './Components/useFacts';
import { useFaq } from './Components/useFaq';


const EditTour: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const [singleTour, setSingleTour] = useState<boolean>(false);
    const [singleTourData, setSingleTourData] = useState<Tour | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast()
    const [editorContent, setEditorContent] = useState<JSONContent>();
    const userId = getUserId();
    const { data: initialTourData } = useQuery<TourData, Error>({
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
            setSingleTourData(initialTourData.tour);
            setSingleTour(true);
        }
    }, [updateBreadcrumbs, initialTourData, tourId]);


    const { mutate: tourMutation, isPending } = useTourMutation();
    const { form,
        onSubmit,
        itineraryFields,
        itineraryAppend,
        itineraryRemove,
        factsFields,
        factsAppend,
        factsRemove,
        faqFields,
        faqAppend,
        faqRemove
    } = useFormHandlers(editorContent);

    const { data: categories } = useCategories(userId);
    const { data: facts } = useFacts(userId);
    const { data: faq } = useFaq(userId);

    const defaultItinerary = [
        {
            day: '',
            title: '',
            description: '',
            dateTime: new Date(),
        }
    ];

    const defaultCategory = [
        {
            label: '',
            value: '',
        }
    ];

    const defaultDates = [
        {
            tripDuration: '',
            startDate: '',
            endDate: '',
        }
    ];


    const defaultLocation = [
        {
            city: '',
            country: '',
            street: '',
            state: '',
            lat: '',
            lng: '',
        }
    ]



    console.log("singleTourData", singleTourData)

    useEffect(() => {
        if (singleTourData) {
            const defaultValues = {
                title: singleTourData.title || '',
                description: singleTourData.description || '',
                code: singleTourData.code || '',
                tourStatus: singleTourData.tourStatus || '',
                coverImage: singleTourData.coverImage || '',
                file: singleTourData.file || '',
                price: typeof singleTourData.price === 'number' ? singleTourData.price : singleTourData.price,
                outline: singleTourData.outline || '',
                include: singleTourData?.include || '',
                exclude: singleTourData?.exclude || '',
                category: singleTourData.category?.map(item => ({
                    label: item.categoryName || '',
                    value: item.categoryId || '',
                })) || defaultCategory,
                itinerary: singleTourData.itinerary?.map(item => ({
                    day: item.day || '',
                    title: item.title || '',
                    description: item.description || '',
                    dateTime: item.dateTime ? new Date(item.dateTime) : new Date()
                })) || defaultItinerary,

                dates: {
                    tripDuration: singleTourData?.dates?.tripDuration || '',
                    startDate: singleTourData?.dates?.startDate ? new Date(singleTourData.dates.startDate) : '',
                    endDate: singleTourData?.dates?.endDate ? new Date(singleTourData.dates.endDate) : '',
                } || defaultDates,

                location: {
                    city: singleTourData?.location?.city || '',
                    country: singleTourData?.location?.country || '',
                    street: singleTourData?.location?.street || '',
                    state: singleTourData?.location?.state || '',
                    lat: singleTourData?.location?.lat ? String(singleTourData.location.lat) : '',
                    lng: singleTourData?.location?.lng ? String(singleTourData.location.lng) : '',
                } || defaultLocation,

                faqs: singleTourData.faqs?.map(item => ({
                    question: item?.question || '',
                    answer: item?.answer || '',
                })),
                map: singleTourData?.map || '',
                facts: singleTourData.facts?.map(item => {
                    // Flatten nested arrays based on field_type
                    let formattedValue = item?.value;

                    if (item?.field_type === 'Multi Select') {
                        if (Array.isArray(item?.value) && Array.isArray(item.value[0])) {
                            formattedValue = item.value[0].map(val => ({
                                label: val,
                                value: val
                            }));
                        } else {
                            formattedValue = [];
                        }
                    } else if (item?.field_type === 'Plain Text' || item?.field_type === 'Single Select') {
                        if (Array.isArray(item?.value) && Array.isArray(item.value[0])) {
                            formattedValue = item.value[0];
                        } else {
                            formattedValue = [];
                        }
                    } else {
                        formattedValue = [];
                    }

                    return {
                        title: item?.title || '',
                        field_type: item?.field_type || '',
                        value: formattedValue,
                        icon: item?.icon || ''
                    };
                }) || []
            }

            form.reset(defaultValues);

            try {
                const parsedDescription = JSON.parse(singleTourData.description || '');
                setEditorContent(parsedDescription);
            } catch (error) {
                console.error('Failed to parse description:', error);
                setEditorContent(defaultValue); // Set to default if parsing fails
            }

        }
    }, [singleTourData, form]);



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

    const handleEditorContentChange = (content: JSONContent) => {
        setEditorContent(content);
    };



    const handleDeleteTour = async () => {
        if (singleTour) {
            deleteMutation.mutate();
            navigate('/dashboard/tours');
        }
    };

    const location = useLocation();
    useEffect(() => {
        const handleScroll = () => {
            let foundTab = tabs[0].id;
            for (const tab of tabs) {
                const element = document.getElementById(tab.id);
                if (element && element.getBoundingClientRect().top <= window.innerHeight / 2) {
                    foundTab = tab.id;
                }
            }
            setActiveTab(foundTab);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (location.hash) {
            setActiveTab(location.hash.substring(1));
        }
    }, [location.hash]);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;


    return (
        <div className="flex min-h-screen w-full flex-col">
            {isPending && <div className="flex flex-col space-y-3 ">
                <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
                <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Loader />
                </div>
            </div>}

            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    console.log("form", form.getValues());
                    form.handleSubmit(
                        (values) => {
                            onSubmit(values, tourMutation); // your submit logic
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
                                    {isPending && <LoaderCircle className="animate-spin" />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </div>
                        </aside>
                        <div className="grid gap-3 lg:col-span-1">
                            <TabContent
                                form={form}
                                activeTab={activeTab}
                                tabs={tabs}
                                singleTour={singleTour}
                                tourMutation={tourMutation}
                                singleTourData={singleTourData}
                                editorContent={editorContent} // Pass editor content to TabContent
                                onEditorContentChange={handleEditorContentChange}
                                itineraryFields={itineraryFields}
                                itineraryAppend={itineraryAppend}
                                itineraryRemove={itineraryRemove}
                                factsFields={factsFields}
                                factsAppend={factsAppend}
                                factsRemove={factsRemove}
                                faqFields={faqFields}
                                faqAppend={faqAppend}
                                faqRemove={faqRemove}
                                categories={categories}
                                facts={facts}
                                faq={faq}
                                categories={categories}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EditTour;

