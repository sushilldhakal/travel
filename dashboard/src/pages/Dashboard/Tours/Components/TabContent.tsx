import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { JSONContent } from "novel";
import { tabs } from './tabs';
import { FactData, FaqData } from '@/Provider/types';
import { Option } from '@/userDefinedComponents/MultipleSelector';
import { useForm } from 'react-hook-form';

// Import modular components
import TourBasicInfo from './TourBasicInfo';
import TourPricingDates from './TourPricingDates';
import TourItinerary from './TourItinerary';
import TourGallery from './TourGallery';
import TourFacts from './TourFacts';
import TourFaqs from './TourFaqs';
import TourInclusionsExclusions from './TourInclusionsExclusions';
import TourReviews from './TourReviews';
import TourLocation from './TourLocation';

// Define interfaces for better type safety
interface GalleryItem {
    _id?: string;
    image: string;
}
interface DivType {
    day: string;
    title: string;
    description: string;
    dateTime: Date;
}

interface TabContentProps {
    activeTab: string;
    singleTourData?: Record<string, unknown>;
    categories?: { name: string; _id: string; isActive?: boolean }[];
    facts?: FactData[];
    faq?: FaqData[];
    tripCode: string | undefined;
    handleGenerateCode: () => string;
    form: ReturnType<typeof useForm>;
    editorContent: JSONContent;
    onEditorContentChange: (content: JSONContent) => void;
    itineraryFields: DivType[];
    itineraryAppend: (value: Partial<DivType> | Partial<DivType>[]) => void;
    itineraryRemove: (index: number) => void;
    factsFields: { id: string; type: string; description: string }[];
    factsAppend: (value: { type: string; description: string }) => void;
    factsRemove: (index: number) => void;
    faqFields: { id: string; question: string; answer: string }[];
    faqAppend: (value: { question: string; answer: string }) => void;
    faqRemove: (index: number) => void;
    pricingFields?: any[];
    pricingAppend?: (value: any) => void;
    pricingRemove?: (index: number) => void;
    tourMutation: (data: FormData) => void;
    singleTour: boolean;
    locationFields?: { id: string; name: string; coordinates: { lat: number; lng: number } }[];
    locationAppend?: (value: { name: string; coordinates: { lat: number; lng: number } }) => void;
    locationRemove?: (index: number) => void;
    location?: { name: string; coordinates: { lat: number; lng: number } }[];
}

const TabContent: React.FC<TabContentProps> = ({
    activeTab,
    singleTourData,
    categories,
    facts,
    faq,
    tripCode,
    handleGenerateCode,
    form,
    editorContent,
    onEditorContentChange,
    itineraryFields,
    itineraryAppend,
    itineraryRemove,
    factsFields,
    factsAppend,
    factsRemove,
    faqFields,
    faqAppend,
    faqRemove,
    pricingFields,
    pricingAppend,
    pricingRemove,
    locationFields,
    locationAppend,
    locationRemove,
    location
}) => {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageArray, setImageArray] = useState<GalleryItem[]>([]);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

    const handleFaqSelect = (faqData: FaqData | undefined, index: number) => {
        if (faqData) {
            form.setValue(`faqs.${index}.answer`, faqData.answer || '');
        }
    };

    useEffect(() => {
        if (singleTourData && Array.isArray(singleTourData.gallery)) {
            const images = singleTourData.gallery.map(item => item.image);
            setImageArray(images);
        }
    }, [singleTourData]);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;

    const categoryOptions: Option[] = (categories || []).map(category => ({
        label: typeof category.name === 'string' ? category.name : '',
        value: typeof category.id === 'string' ? category.id : '',
        ...(!category.isActive ? { disable: true } : {})
    }));

    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        if (imageUrl) {
            onChange(imageUrl);
            setImageDialogOpen(false);
        }
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };

    const watchedItinerary = form.watch('itinerary');
    const watchedFacts = form.watch('facts');
    const watchedFaq = form.watch('faqs');
    const watchedPricing = form.watch('pricingGroups');
    const watchedLocation = form.watch('locations');

    const handleGalleryImage = (imageUrl: string) => {
        setImageArray((prevImageArray) => {
            const newImages = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
            const updatedImageArray = newImages.filter(image => !prevImageArray.includes(image));
            // Add the new image to the array, following a consistent structure
            return [...prevImageArray, ...updatedImageArray];
        });
    };

    const handleRemoveImageGallery = (index: number) => {
        // Update the state array
        setImageArray((prevImageArray) =>
            prevImageArray.filter((_, i) => i !== index)
        );
    };

    const handlePdfSelect = (pdfUrl: string, onChange: (value: string) => void) => {
        if (pdfUrl) {
            onChange(pdfUrl);
            setPdfDialogOpen(false); // Close the PDF dialog
        }
    };

    const handleRemovePdf = (onChange: (value: string) => void) => {
        onChange('');
    };



    return (
        <Card>
            {tab.id === 'overview' && (
                <TourBasicInfo
                    form={form}
                    tripCode={tripCode}
                    handleGenerateCode={handleGenerateCode}
                    editorContent={editorContent}
                    onEditorContentChange={onEditorContentChange}
                    categoryOptions={categoryOptions}
                    imageDialogOpen={imageDialogOpen}
                    setImageDialogOpen={setImageDialogOpen}
                    handleImageSelect={handleImageSelect}
                    handleRemoveImage={handleRemoveImage}
                    pdfDialogOpen={pdfDialogOpen}
                    setPdfDialogOpen={setPdfDialogOpen}
                    handlePdfSelect={handlePdfSelect}
                    handleRemovePdf={handleRemovePdf}
                />
            )}

            {tab.id === 'pricing' && (
                <TourPricingDates
                    form={form}
                    pricingFields={pricingFields}
                    pricingAppend={pricingAppend}
                    pricingRemove={pricingRemove}
                    watchedPricing={watchedPricing}
                />
            )}

            {tab.id === 'itinerary' && (
                <div>
                    <TourItinerary
                        form={form}
                        itineraryFields={itineraryFields}
                        itineraryAppend={itineraryAppend}
                        itineraryRemove={itineraryRemove}
                        watchedItinerary={watchedItinerary}
                    />
                </div>
            )}

            {tab.id === 'inc-exc' && (
                <TourInclusionsExclusions
                    form={form}
                />
            )}

            {tab.id === 'gallery' && (
                <TourGallery
                    form={form}
                    imageDialogOpen={imageDialogOpen}
                    setImageDialogOpen={setImageDialogOpen}
                    imageArray={imageArray}
                    handleGalleryImage={handleGalleryImage}
                    handleRemoveImageGallery={handleRemoveImageGallery}
                />
            )}

            {tab.id === 'facts' && (
                <TourFacts
                    form={form}
                    factsFields={factsFields}
                    factsAppend={factsAppend}
                    factsRemove={factsRemove}
                    facts={facts || []}
                    watchedFacts={watchedFacts}
                />
            )}

            {tab.id === 'location' && (
                <TourLocation
                    form={form}
                    locationFields={locationFields || []}
                    locationAppend={locationAppend || (() => { })}
                    locationRemove={locationRemove || (() => { })}
                    location={location || []}
                    watchedLocation={watchedLocation || []}
                />
            )}
            {tab.id === 'faqs' && (
                <TourFaqs
                    form={form}
                    faqFields={faqFields}
                    faqAppend={faqAppend}
                    faqRemove={faqRemove}
                    faq={faq || []}
                    watchedFaq={watchedFaq}
                    handleFaqSelect={handleFaqSelect}
                />
            )}

            {tab.id === 'reviews' && (
                <TourReviews tourId={typeof singleTourData?._id === 'string' ? singleTourData._id : ''} />
            )}
        </Card>
    );
};

export default TabContent;