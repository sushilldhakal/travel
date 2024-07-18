import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import TabContent from '@/userDefinedComponents/TabContent';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Form } from '@/components/ui/form';
import { getSingleTour, createTour, updateTour, deleteTour } from '@/http/api'; // Replace with your API functions
import { Button } from '@/components/ui/button';

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

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  tripCode: z.string().min(2, 'Trip code must be at least 2 characters.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
  coverImage: z.string(), // Assuming this is a URL string for the image
  file: z.string(), // Assuming this is a URL string for the PDF
});

const AddTour = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateBreadcrumbs } = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tripcode: '',
  });
  const [singleTour, setSingleTour] = useState<any>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData
  });


  const coverImageRef = form.register('coverImage');
  const fileRef = form.register('file');


  // Fetch initial tour data if tourId is provided (for update mode)
  const { data: initialTourData, isLoading: initialLoading } = useQuery({
    queryKey: ['tours', tourId],
    queryFn: () => getSingleTour(tourId),
    enabled: !!tourId, // Fetch only if tourId is available (update mode)
  });

  console.log('initialTourData:', initialTourData, formData);


  const mutation = useMutation({
    mutationFn: tourId ? (values) => updateTour(tourId, values) : createTour,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['singleTour', tourId]); // Invalidate single tour query
      const route = tourId ? `/dashboard/tours/${tourId}` : '/dashboard/tours'; // Determine route based on create or update
      navigate(route); // Navigate to view or list page after mutation
      console.log('Tour saved successfully');
    },
    onError: (error) => {
      console.error('Error saving tour:', error);
    },
  });

  const handleDeleteTour = async () => {
    try {
      await deleteTour(tourId); // Assuming deleteTour is your API function for deleting a tour
      queryClient.invalidateQueries(['singleTour', tourId]); // Invalidate single tour query
      navigate('/dashboard/tours'); // Navigate to tours list after deletion
      console.log('Tour deleted successfully');
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  useEffect(() => {
    if (initialTourData && initialTourData.breadcrumbs && initialTourData.breadcrumbs.length > 0) {
      const breadcrumbLabel = initialTourData.breadcrumbs[0].label; // Use the first breadcrumb label
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: breadcrumbLabel, href: `/dashboard/tours/${tourId}`, type: 'page' },
      ]);
      setSingleTour(true);
    } else if (tourId) {
      // If no breadcrumbs found but tourId is present, use a fallback breadcrumb
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: `Tour ${tourId}`, href: `/dashboard/tours/${tourId}`, type: 'page' },
      ]);
      setSingleTour(true);
    } else {
      // Default breadcrumb for add tour page
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: 'Add Tour', href: '/dashboard/tours/add', type: 'page' },
      ]);
      setSingleTour(false);
    }
  }, [initialTourData, tourId, updateBreadcrumbs]);


  const onSubmit = async (values) => {
    if (!values) {
      return;
    }
    const formdata = new FormData();
    formdata.append('title', values.title);
    formdata.append('tripCode', values.tripCode);
    formdata.append('description', values.description);
    formdata.append('coverImage', values.coverImage[0]);
    formdata.append('file', values.file[0]);

    try {
      await mutation.mutateAsync(formdata);
      // Optionally reset form after successful submission
      form.reset();
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form.getValues());
  };

  useEffect(() => {
    // Set form values when initialTourData changes (after fetch)
    if (initialTourData) {
      form.reset(initialTourData); // Reset form with fetched data
    }
  }, [initialTourData]);

  if (initialLoading) {
    return <LoaderCircle className="animate-spin" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-screen w-full flex-col">
        <div className="flex min-h-screen w-full flex-col">
          <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
            {tourId ? (<Link to="/dashboard/tours">
              <Button className="py-1 px-2" variant="destructive" onClick={handleDeleteTour}> Delete</Button>
            </Link>
            ) : (
              <Link to="/dashboard/tours">
                <Button size="sm" variant={'outline'}>
                  <span className="ml-2">
                    <span>Discard</span>
                  </span>
                </Button>
              </Link>
            )}
            <Button type="submit" onClick={handleSubmit} size="sm">
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
              <span className="ml-2">{tourId ? 'Update Tour' : 'Create Tour'}</span>
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
                formData={form.getValues()}
                initialTourData={initialTourData}
                mutation={mutation}
                form={form}
                activeTab={activeTab}
                tabs={tabs}
                coverImageRef={coverImageRef}
                fileRef={fileRef}
                singleTour={singleTour}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AddTour;



