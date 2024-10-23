import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/userDefinedComponents/Loader';
import TabContent from './Components/TabContent';
import { defaultValue } from '@/lib/default-value';
import { useFormHandlers } from './Components/useFormHandlers';
import { useTourMutation } from './Components/useTourMutation';
import { tabs } from './Components/tabs';
import { LoaderCircle } from 'lucide-react';
import TabNavigation from './Components/TabNavigation';
import { Button } from '@/components/ui/button';
import makeid from './Components/randomId';
import { getUserId } from '@/util/AuthLayout';
import { useCategories } from './Components/useCategories';
import { useFacts } from './Components/useFacts';
import { useFaq } from './Components/useFaq';

const AddTour: React.FC = () => {
  const [tripCode, setTripCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editorContent, setEditorContent] = useState({});
  const userId = getUserId();
  const { mutate: createTour, isPending } = useTourMutation();

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
        <form onSubmit={(e) => {
          e.preventDefault();
          console.log("form", form.getValues());
          form.handleSubmit(
            (values) => {
              onSubmit(values, createTour); // your submit logic
            },
            (errors) => {
              console.log("Form Errors:", errors); // log errors
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
            <Button type="submit" size="sm">
              {isPending && <LoaderCircle className="animate-spin" />}
              <span className="ml-2">Create Tour</span>
            </Button>
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <aside className="sticky top-8 inset-x-0 z-20 text-left px-4 sm:px-6 lg:px-8">
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="py-4">
                <Button type="submit" disabled={isPending} className='pr-6 ml-4'>
                  {isPending && <LoaderCircle className="animate-spin" />}
                  <span className="ml-2">Create Tour</span>
                </Button>
              </div>
            </aside>
            <div className="grid gap-3 lg:col-span-1">
              <TabContent
                form={form}
                activeTab={activeTab}
                tripCode={tripCode}
                tourMutation={createTour}
                handleGenerateCode={() => {
                  const newCode = makeid(6);
                  setTripCode(newCode);
                  form.setValue('code', newCode);
                }}
                editorContent={editorContent}
                onEditorContentChange={setEditorContent}
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
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTour;
