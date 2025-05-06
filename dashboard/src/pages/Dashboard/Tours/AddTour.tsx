import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/userDefinedComponents/Loader';
import TabContent from './Components/TabContent';
import { useFormHandlers } from './Components/useFormHandlers';
import { useTourMutation } from './Components/useTourMutation';
import { LoaderCircle } from 'lucide-react';
import TabNavigation from './Components/TabNavigation';
import { Button } from '@/components/ui/button';
import makeId from './Components/randomId';
import { getUserId } from '@/util/authUtils';
import { useFacts } from './FACTS/useFacts';
import { useFaq } from './FAQ/useFaq';
import { JSONContent } from 'novel';
import { FieldValues, useForm } from 'react-hook-form';
import { useCategories } from './Category/useCategories';
import { FactData, FaqData, Tour } from '@/Provider/types';

// Define interfaces for proper typing - matching the TabContent expected types
interface ItineraryItem {
  day: string;
  title: string;
  description: string;
  dateTime: Date;
}

interface FactItem {
  id: string;
  type: string;
  description: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

function AddTour() {
  const [tripCode, setTripCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editorContent, setEditorContent] = useState<JSONContent>({});
  const userId = getUserId();
  const { mutate: createTour, isPending } = useTourMutation();

  const {
    form,
    onSubmit,
    handleSubmit,
    itineraryFields,
    itineraryAppend,
    itineraryRemove,
    factFields: factsFields,
    factAppend: factsAppend,
    factRemove: factsRemove,
    faqFields,
    faqAppend,
    faqRemove,
    pricingOptionsFields,
    pricingOptionsAppend,
    pricingOptionsRemove,
  } = useFormHandlers(editorContent);

  const { data: categories } = useCategories(userId);
  const { data: facts } = useFacts(userId);
  const { data: faq } = useFaq(userId);

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setActiveTab(location.hash.substring(1));
    }
  }, [location.hash]);

  const handleGenerateCode = () => {
    const newCode = makeId(6);
    setTripCode(newCode);
    return newCode;
  };


  console.log("FAQS", faq);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {isPending && (
        <div className="flex flex-col space-y-3 ">
          <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
          <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleSubmit(
            (values: Tour) => {
              // Create a clone of values with proper types for submission
              const formValues = {
                // Basic fields - convert from field constructors to actual values
                title: String(values.title || ""),
                code: String(values.code || ""),
                tourStatus: String(values.tourStatus || "Draft"),
                excerpt: String(values.excerpt || ""),
                description: values.description || "",
                coverImage: String(values.coverImage || ""),
                file: values.file || null,
                outline: String(values.outline || ""),
                enquiry: Boolean(values.enquiry),
                isSpecialOffer: Boolean(values.isSpecialOffer),

                // Convert nested objects
                pricing: {
                  price: parseFloat(String(values.pricing?.price || 0)),
                  pricePerPerson: Boolean(values.pricing?.pricePerPerson),
                  pricingOptionsEnabled: Boolean(values.pricing?.pricingOptionsEnabled),
                  paxRange: Array.isArray(values.pricing?.paxRange)
                    ? values.pricing.paxRange.map((n: any) => parseInt(String(n)))
                    : [1, 10],
                  groupSize: parseInt(String(values.pricing?.groupSize || 1)),
                  discount: {
                    discountEnabled: Boolean(values.pricing?.discount?.discountEnabled),
                    discountPrice: parseFloat(String(values.pricing?.discount?.discountPrice || 0)),
                    dateRange: values.pricing?.discount?.dateRange || { from: new Date(), to: new Date() }
                  },
                  pricingOptions: Array.isArray(values.pricing?.pricingOptions)
                    ? values.pricing.pricingOptions.map((opt: any) => ({
                      ...opt,
                      price: parseFloat(String(opt.price || 0)),
                      name: String(opt.name || ""),
                      category: String(opt.category || ""),
                      customCategory: String(opt.customCategory || ""),
                    }))
                    : []
                },

                dates: {
                  days: parseInt(String(values.dates?.days || 0)),
                  nights: parseInt(String(values.dates?.nights || 0)),
                  fixedDeparture: Boolean(values.dates?.fixedDeparture),
                  multipleDates: Boolean(values.dates?.multipleDates),
                  scheduleType: (values.dates?.scheduleType || "flexible") as "fixed" | "flexible" | "recurring",
                  singleDateRange: values.dates?.singleDateRange || { from: new Date(), to: new Date() },
                  departures: Array.isArray(values.dates?.departures)
                    ? values.dates.departures.map((dep: any) => ({
                      ...dep,
                      id: String(dep.id || Date.now()),
                      label: String(dep.label || ""),
                      capacity: parseInt(String(dep.capacity || 0)),
                      isRecurring: Boolean(dep.isRecurring),
                      recurrencePattern: String(dep.recurrencePattern || "weekly") as
                        "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly",
                    }))
                    : []
                },

                // Array fields
                itinerary: Array.isArray(values.itinerary)
                  ? values.itinerary.map((item: any) => ({
                    ...item,
                    day: String(item.day || ""),
                    title: String(item.title || ""),
                    description: String(item.description || ""),
                  }))
                  : [],

                facts: Array.isArray(values.facts)
                  ? values.facts.map((fact: FactData) => ({
                    ...fact,
                    field_type: String(fact.field_type || "Plain Text") as "Plain Text" | "Single Select" | "Multi Select",
                  }))
                  : [],

                faqs: Array.isArray(values.faqs)
                  && values.faqs.map((faq: FaqData) => ({
                    ...faq,
                    question: String(faq.question || ""),
                    answer: String(faq.answer || ""),
                  })),

                // Location fields
                location: values.location ? {
                  lat: parseFloat(String(values.location.lat || 0)),
                  lng: parseFloat(String(values.location.lng || 0)),
                  country: String(values.location.country || ""),
                  city: String(values.location.city || ""),
                  street: String(values.location.street || ""),
                  state: String(values.location.state || ""),
                } : undefined,

                // Other fields
                map: String(values.map || ""),
                destination: String(values.destination || ""),
                include: String(values.include || ""),
                exclude: String(values.exclude || ""),
                category: Array.isArray(values.category) ? values.category : [],
                gallery: Array.isArray(values.gallery) ? values.gallery : []
              };

              onSubmit(formValues, createTour);
            },
            (errors: any) => {
              console.log("Form Errors:", errors);
            }
          )();
        }}>
          <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
            <Link to="/dashboard/tours">
              <Button size="sm" variant={'outline'}>
                <span className="ml-2">
                  <span>Discard</span>
                </span>
              </Button>
            </Link>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
          <div className="flex">
            <div className="hidden lg:block md:w-60 xl:w-72 ml-3 mt-5 border-r pr-5">
              <div className="sticky top-16">
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>
            <div className="flex-1 lg:pl-6 mt-3">
              <TabContent
                activeTab={activeTab}
                form={form as unknown as ReturnType<typeof useForm<FieldValues>>}
                editorContent={editorContent}
                onEditorContentChange={setEditorContent}
                tripCode={tripCode}
                handleGenerateCode={handleGenerateCode}
                itineraryFields={itineraryFields as unknown as ItineraryItem[]}
                itineraryAppend={itineraryAppend as unknown as (value: Partial<ItineraryItem> | Partial<ItineraryItem>[]) => void}
                itineraryRemove={itineraryRemove}
                factsFields={factsFields as unknown as FactItem[]}
                factsAppend={factsAppend as unknown as (value: { type: string; description: string }) => void}
                factsRemove={factsRemove}
                faqFields={faqFields as unknown as FaqItem[]}
                faqAppend={faqAppend as unknown as (value: { question: string; answer: string }) => void}
                faqRemove={faqRemove}
                categories={categories}
                facts={facts}
                faq={faq}
                pricingFields={pricingOptionsFields}
                pricingAppend={pricingOptionsAppend}
                pricingRemove={pricingOptionsRemove}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTour;
