import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TabContent from '@/userDefinedComponents/TabContent';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTour } from '@/http/api';
import { LoaderCircle } from 'lucide-react';

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
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  tripCode: z.string().min(2, {
    message: 'Genre must be at least 6 characters.',
  }),
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  coverImage: z.instanceof(FileList).refine((file) => {
    return file.length == 1;
  }, 'Cover Image is required'),
  file: z.instanceof(FileList).refine((file) => {
    return file.length == 1;
  }, 'Book PDF is required'),
});

const AddTour = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tripCode: '',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData
  });

  const coverImageRef = form.register('coverImage');
  const fileRef = form.register('file');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      console.log('Tour created successfully');
      navigate('/dashboard/tours');
    },
    onError: (error) => {
      console.error('Error creating tour:', error);
    }
  });

  const handleInputChange = (e) => {
    if (!e.target) {
      return;
    }
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-screen w-full flex-col">
        <div className="flex min-h-screen w-full flex-col">
          <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
            <Link to="/dashboard/tours">
              <Button size="sm" variant={'outline'}>
                <span className="ml-2">Discard</span>
              </Button>
            </Link>
            <Button type="submit" onClick={handleSubmit} size="sm">
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
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
              <TabContent coverImageRef={coverImageRef} fileRef={fileRef} mutation={mutation} form={form} activeTab={activeTab} formData={formData} handleInputChange={handleInputChange} tabs={tabs} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AddTour;
