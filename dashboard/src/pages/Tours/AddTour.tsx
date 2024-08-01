import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTour } from '@/http/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { Form } from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/userDefinedComponents/Loader';
import TabContent from '@/userDefinedComponents/TabContent';


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


// Define the schema for a single itinerary item
// const itineraryItemSchema = z.object({
//   title: z.string().optional(),
//   description: z.string().optional(),
//   date: z.date().optional(),
//   time: z.string().optional() // Assuming time is represented as a string
// });

// Define the schema for the itinerary as an array of itinerary items
// const itinerarySchema = z.array(itineraryItemSchema);

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  code: z.string().min(6, 'Trip code must be at least 6 characters.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
  tourStatus: z.string(),
  price: z.number().min(0, 'Price must be a positive number'),
  coverImage: z.instanceof(FileList).refine((file) => {
    return file.length == 1;
  }, 'Cover Image is required'),
  file: z.any().optional(),

  //itinerary: itinerarySchema.optional() // Include the itinerary in the main schema
});


const AddTour: React.FC = () => {
  const [tripCode, setTripCode] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [singleTour, setSingleTour] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      code: tripCode,
      tourStatus: 'Draft',
      coverImage: null,
      file: null,
      price: '',
      //itinerary: [{ title: '', description: '', date: '', time: '' }],
    }
  });
  const tourMutation = useMutation({
    mutationFn: (data: FormData) => createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      const route = '/dashboard/tours';
      navigate(route);
      toast({
        title: 'Tour updated successfully',
        description: 'The tour has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: `Failed to create tour`,
        description: `An error occurred while creating the tour. Please try again later.`,
      });
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values) {
      return;
    }
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


    // if (values.itinerary) {
    //   values.itinerary.forEach((item, index) => {
    //     if (item.title) formdata.append(`itinerary[${index}][title]`, item.title);
    //     if (item.description) formdata.append(`itinerary[${index}][description]`, item.description);
    //     if (item.date) formdata.append(`itinerary[${index}][date]`, item.date);
    //     if (item.time) formdata.append(`itinerary[${index}][time]`, item.time);
    //   });
    // }


    try {
      await tourMutation.mutate(formdata);
      form.reset();
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  }

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabQuery = queryParams.get('tab') || tabs[0].id;
  useEffect(() => {
    setActiveTab(tabQuery);
  }, [tabQuery]);

  const tab = tabs.find(t => t.id === activeTab);
  if (!tab) return <div>Select a tab to see its content</div>;

  const tabsWithContent = tabs.map(tab => ({
    ...tab,
    content: <div>{tab.title} content</div>
  }));

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
            <Link to="/dashboard/tours">
              <Button size="sm" variant={'outline'}>
                <span className="ml-2">
                  <span>Discard</span>
                </span>
              </Button>
            </Link>
            <Button type="submit" size="sm">
              {tourMutation.isPending && <LoaderCircle className="animate-spin" />}
              <span className="ml-2">Create Tour</span>
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
                tabs={tabsWithContent}
                tripCode={tripCode}
                singleTour={singleTour}
                tourMutation={tourMutation}
                handleGenerateCode={() => {
                  const newCode = makeid(6);
                  setTripCode(newCode);
                  form.setValue('code', newCode);
                }}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTour;
