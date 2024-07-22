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
  const [singleTour, setSingleTour] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tripCode: '',
      coverImage: '',
      file: '',
    }
  });

  const coverImageRef = form.register('coverImage');
  const fileRef = form.register('file');

  const { data: initialTourData, isLoading: initialLoading } = useQuery({
    queryKey: ['tours', tourId],
    queryFn: () => tourId ? getSingleTour(tourId) : Promise.reject('No tour ID provided'),
    enabled: !!tourId,
  });

  const mutation = useMutation({
    mutationFn: (values: FormData) => tourId ? updateTour(tourId, values) : createTour(values),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['singleTour', tourId] });
      const route = tourId ? `/dashboard/tours/${tourId}` : '/dashboard/tours';
      navigate(route);
      console.log('Tour saved successfully');
    },
    onError: (error) => {
      console.error('Error saving tour:', error);
    },
  });

  const handleDeleteTour = async () => {
    if (!tourId) {
      console.error('Tour ID is undefined');
      return;
    }
    try {
      await deleteTour(tourId);
      queryClient.invalidateQueries({ queryKey: ['singleTour', tourId] });
      navigate('/dashboard/tours');
      console.log('Tour deleted successfully');
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  useEffect(() => {
    if (initialTourData && initialTourData.breadcrumbs && initialTourData.breadcrumbs.length > 0) {
      const breadcrumbLabel = initialTourData.breadcrumbs[0].label;
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: breadcrumbLabel, href: `/dashboard/tours/${tourId}`, type: 'page' },
      ]);
      setSingleTour(true);
    } else if (tourId) {
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: `Tour ${tourId}`, href: `/dashboard/tours/${tourId}`, type: 'page' },
      ]);
      setSingleTour(true);
    } else {
      updateBreadcrumbs([
        { title: 'Dashboard', href: '/dashboard', type: 'link' },
        { title: 'Tours', href: '/dashboard/tours', type: 'link' },
        { title: 'Add Tour', href: '/dashboard/tours/add', type: 'page' },
      ]);
      setSingleTour(false);
    }
  }, [initialTourData, tourId, updateBreadcrumbs]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values) {
      return;
    }
    const formdata = new FormData();
    formdata.append('title', values.title);
    formdata.append('tripCode', values.tripCode);
    formdata.append('description', values.description);
    formdata.append('coverImage', values.coverImage);
    formdata.append('file', values.file);

    try {
      await mutation.mutateAsync(formdata);
      form.reset();
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  useEffect(() => {
    if (initialTourData) {
      form.reset(initialTourData);
    }
  }, [initialTourData, form]);

  if (initialLoading) {
    return <LoaderCircle className="animate-spin" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-screen w-full flex-col">
        <div className="flex min-h-screen w-full flex-col">
          <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
            {tourId ? (
              <Link to="/dashboard/tours">
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
            <Button type="submit" size="sm">
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
                mutation={mutation}
                form={form}
                activeTab={activeTab}
                //@ts-ignore
                tabs={tabs}
                //@ts-ignore
                coverImageRef={coverImageRef}
                //@ts-ignore
                fileRef={fileRef}
                //@ts-ignore
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



