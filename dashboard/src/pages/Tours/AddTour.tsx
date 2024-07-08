import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const AddTour = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectName: '',
    allowChangeDirectory: true,
    // Add other form fields as needed
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <div className="hidden items-center gap-2 md:ml-auto md:flex">
        <Button variant="outline" size="sm">
          Discard
        </Button>
        <Button size="sm">Save Tour</Button>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-5 text-md text-muted-foreground lg:col-span-1">
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
        <div className="grid gap-3 lg:col-span-1">
          <TabContent activeTab={activeTab} formData={formData} handleInputChange={handleInputChange} tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default AddTour;
