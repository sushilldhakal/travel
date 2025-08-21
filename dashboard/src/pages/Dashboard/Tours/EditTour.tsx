import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { getSingleTour, deleteTour } from '@/http';
import { useToast } from '@/components/ui/use-toast';
import { Breadcrumb, Tour, TourData } from '@/Provider/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar, CheckCircle2, ClipboardCheck, CreditCard, FileText, Loader2, LoaderCircle, MapPin, Package, Save, Settings2, ThumbsUp } from 'lucide-react';
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { tabs } from './Components/tabs';
import TourBasicInfo from './Components/TourBasicInfo';
import { useTourMutation } from './Components/useTourMutation';
import { HashLink } from 'react-router-hash-link';
import { useTourForm } from '@/Provider/hooks/useTourForm';
import TourPricingDates from './Components/TourPricingDates';
import TourItinerary from './Components/TourItinerary';
import TourInclusionsExclusions from './Components/TourInclusionsExclusions';
import TourGallery from './Components/TourGallery';
import TourFacts from './Components/TourFacts';
import TourFaqs from './Components/TourFaqs';
import TourReviews from './Components/TourReviews';

const EditTour: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const [singleTour, setSingleTour] = useState<boolean>(false);
    const [singleTourData, setSingleTourData] = useState<Tour | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast()

    const { data: initialTourData, isLoading, isError, error } = useQuery<TourData, Error>({
        queryKey: ['tours', tourId],
        queryFn: () => tourId ? getSingleTour(tourId) : Promise.reject('No tour ID provided'),
        enabled: !!tourId,
    });

    const { form, onSubmit } = useTourForm();

    console.log('onSubmit available:', !!onSubmit);

    useEffect(() => {
        if (initialTourData && tourId) {
            const apiBreadcrumbs = initialTourData.breadcrumbs;
            console.log('API breadcrumbs:', apiBreadcrumbs);

            // Use the tour title from API breadcrumbs if available, otherwise use tour data
            const tourTitle = (apiBreadcrumbs?.[0]?.label && apiBreadcrumbs[0].label.trim() !== '')
                ? apiBreadcrumbs[0].label
                : ((initialTourData as any).data?.tour?.title || initialTourData.tour?.title || 'Edit Tour');

            console.log('Tour title extracted:', tourTitle);

            const breadcrumbItems: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Tours', href: '/dashboard/tours', type: 'link' },
                { label: tourTitle, href: `/dashboard/tours/edit_tour/${tourId}`, type: 'page' },
            ];

            console.log('Setting breadcrumbs:', breadcrumbItems);
            updateBreadcrumbs(breadcrumbItems);

            // Get the tour data from the response
            const tourData = initialTourData.tour || initialTourData;
            // Set the tour data in state
            setSingleTourData(tourData);
            setSingleTour(true);
        }
    }, [updateBreadcrumbs, initialTourData, tourId]);

    console.log("initialTourData", initialTourData);

    const { mutate: tourMutation, isPending: isUpdating } = useTourMutation({ tourId });

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

    useEffect(() => {
        // Only log when data actually changes and isn't null
        if (singleTourData && Object.keys(singleTourData).length > 0) {
            console.log("Tour data loaded:", singleTourData);
        }
    }, [singleTourData]);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
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
            {isUpdating && <div className="flex flex-col space-y-3 ">
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
                        e.preventDefault();
                        console.log("Form for API", form.getValues());
                        onSubmit(form.getValues(), tourMutation);
                    }}>
                        {/* Page Header Actions */}
                        <div className="mb-6">
                            <Card className="border shadow-sm">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>Tour Editor</span>
                                        </div>
                                        <h1 className="text-lg font-semibold">Edit Tour</h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to delete this tour?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your tour and remove your data associated to this tour from servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteTour} className={buttonVariants({ variant: "destructive" })} > Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <Button type="submit" size="sm" disabled={isUpdating}>
                                            {isUpdating ? (
                                                <>
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Update Tour
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Tabs
                            defaultValue="overview"
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <Card className="sticky top-8 inset-x-0 border shadow-sm">
                                        <CardContent className="p-4">
                                            <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                                                {tabs.map((tab) => (
                                                    <TabsTrigger
                                                        key={tab.id}
                                                        value={tab.id}
                                                        className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                                        asChild
                                                    >
                                                        <HashLink to={`#${tab.id}`}>
                                                            {tab.id === 'overview' && <FileText className="h-4 w-4" />}
                                                            {tab.id === 'pricing' && <CreditCard className="h-4 w-4" />}
                                                            {tab.id === 'itinerary' && <MapPin className="h-4 w-4" />}
                                                            {tab.id === 'inc-exc' && <ClipboardCheck className="h-4 w-4" />}
                                                            {tab.id === 'facts' && <Package className="h-4 w-4" />}
                                                            {tab.id === 'gallery' && <Calendar className="h-4 w-4" />}
                                                            {tab.id === 'faqs' && <Settings2 className="h-4 w-4" />}
                                                            {tab.id === 'reviews' && <ThumbsUp className="h-4 w-4" />}
                                                            <span>{tab.title}</span>
                                                            {activeTab === tab.id && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
                                                        </HashLink>
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </CardContent>
                                        <CardFooter className="px-4 py-4 border-t">
                                            <Button type="submit" className="w-full" disabled={isUpdating}>
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Update Tour
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                                {/* Main Content */}
                                <div className="space-y-6">
                                    <TabsContent value={activeTab} className="mt-0 space-y-6">
                                        <Card>
                                            {activeTab === 'overview' && (
                                                <TourBasicInfo

                                                />
                                            )}
                                            {/* Add other tab content components as needed */}

                                            {activeTab === 'pricing' && <TourPricingDates />}
                                            {activeTab === 'itinerary' && <TourItinerary />}
                                            {activeTab === 'inc-exc' && <TourInclusionsExclusions />}
                                            {activeTab === 'gallery' && <TourGallery />}
                                            {activeTab === 'facts' && <TourFacts />}
                                            {activeTab === 'faqs' && <TourFaqs />}
                                            {activeTab === 'reviews' && <TourReviews />}

                                        </Card>
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default EditTour;
