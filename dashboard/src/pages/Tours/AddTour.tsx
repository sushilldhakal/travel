import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import GetTitle from '@/userDefinedComponents/GetTitle';

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

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'overview':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Store Name</CardTitle>
            <CardDescription>Used to identify your store in the marketplace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <Input placeholder="Store Name" />
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save</Button>
          </CardFooter>
        </Card>
      );
    case 'itinerary':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Plugins Directory</CardTitle>
            <CardDescription>The directory within your project, in which your plugins are located.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input placeholder="Project Name" defaultValue="/content/plugins" />
              <div className="flex items-center space-x-2">
                <Checkbox id="include" defaultChecked />
                <label htmlFor="include" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Allow administrators to change the directory.
                </label>
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save</Button>
          </CardFooter>
        </Card>
      );
    // Add more cases for other tabs as needed
    default:
      return <div>Select a tab to see its content</div>;
  }
};

const AddTour = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
          <GetTitle />
        </div>

<div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">

      <nav className="grid gap-4 text-sm text-muted-foreground"  x-chunk="dashboard-04-chunk-0">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to="#"
            className={`font-semibold ${activeTab === tab.id ? 'text-primary' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </Link>
        ))}
      </nav>
      <div className="grid gap-6">
        <TabContent activeTab={activeTab} />
      </div>
    </div>


    </div>

  );
};

export default AddTour;
