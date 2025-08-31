import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/userDefinedComponents/Loader';

// Import tab content components
import TourBasicInfo from './Components/TourBasicInfo';
import { useTourMutation } from './Components/useTourMutation';
import { Calendar, CheckCircle2, ClipboardCheck, CreditCard, FileText, Loader2, LoaderCircle, MapPin, Package, Save, Settings2, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { formSchema } from './Components/formSchema';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { tabs } from './Components/tabs';
import { HashLink } from 'react-router-hash-link';
import TourPricingDates from './Components/TourPricingDates';
import TourItinerary from './Components/TourItinerary';
import TourInclusionsExclusions from './Components/TourInclusionsExclusions';
import TourGallery from './Components/TourGallery';
import TourFacts from './Components/TourFacts';
import TourFaqs from './Components/TourFaqs';
import TourReviews from './Components/TourReviews';
import { useTourForm } from '@/Provider/hooks/useTourContext';

function AddTour() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.hash ? location.hash.substring(1) : 'overview');

  const { mutate: createTour, isPending: isCreating } = useTourMutation();
  const { form, onSubmit } = useTourForm();



  useEffect(() => {
    setActiveTab(location.hash ? location.hash.substring(1) : 'overview');
  }, [location.hash]);



  // Pass necessary props to TourBasicInfo directly when needed

  return (

    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {isCreating && (
        <div className="flex flex-col space-y-3 ">
          <Skeleton className="h-full w-full top-0 left-0 absolute z-10 rounded-xl" />
          <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(
            (values) => {
              if (typeof onSubmit !== 'function') {
                console.error('onSubmit is not available', onSubmit);
                toast({ title: 'Error', description: 'Form submit handler is not available.', variant: 'destructive' });
                return;
              }
              onSubmit(values as unknown as z.infer<typeof formSchema>, createTour);
            },
            (errors) => {
              console.log("Form Errors:", errors);
              // Extract the error fields and format a user-friendly message
              const errorFields = Object.keys(errors);
              const formattedErrors = errorFields.map(field => {
                return `- ${field.charAt(0).toUpperCase() + field.slice(1)} field has invalid data`;
              }).join('\n');

              toast({
                title: 'Tour not saved',
                description: `Please fix the following issues:\n${formattedErrors}`,
                variant: 'destructive',
              });
            }
          )();
        }}>
          {/* Page Header Actions */}
          <div className="mb-6">
            <Card className="border shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Tour Editor</span>
                  </div>
                  <h1 className="text-lg font-semibold">Create Tour</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/dashboard/tours">
                    <Button size="sm" variant={'outline-solid'}>
                      Discard
                    </Button>
                  </Link>
                  <Button size="sm" type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
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
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="sticky top-8 inset-x-0 border shadow-xs">
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
                    <Button onClick={() => {
                      if (typeof onSubmit !== "function") {
                        console.error("onSubmit is not a function", onSubmit);
                        toast({ title: "Error", description: "Form submit handler is not available.", variant: "destructive" });
                        return;
                      }

                      onSubmit(form.getValues(), createTour);
                    }}
                      className="w-full"
                      disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Tour
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>


              {/* Main Content */}
              <div className="space-y-6">
                {/* Tab Content */}
                <TabsContent value={activeTab} className="mt-0 space-y-6">
                  <Card>
                    {activeTab === 'overview' && (
                      <TourBasicInfo

                      />
                    )}
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
    </div>

  );
}

export default AddTour
