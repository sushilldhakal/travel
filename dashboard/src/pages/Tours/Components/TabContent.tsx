import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, Paperclip, PlusIcon, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import { JSONContent } from "novel";
import Editor from '../../../userDefinedComponents/editor/advanced-editor';
import { Controller, useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GalleryPage from '@/pages/Gallery/GalleryPage';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { tabs } from './tabs';
import MultipleSelector, { Option } from '@/userDefinedComponents/MultipleSelector';
import { Switch } from '@/components/ui/switch';
import { FactData, FaqData, Tour } from '@/Provider/types';



export interface DivType {
    day: string;
    title: string;
    description: string;
    dateTime: Date | undefined;
}

export interface FactsType {
    title: string;
    field_type: string;
    value: string[];
    icon: string;
}

export interface FaqType {
    question: string;
    answer: string;
}
interface TabContentProps {
    activeTab: string;
    tabs: { id: string; content: React.ReactNode }[];
    tourMutation: { isPending: boolean };
    isSingleTour: string;
    singleTour: boolean;
    tripCode: string | undefined;
    handleGenerateCode: () => string;
    form: ReturnType<typeof useForm>;
    editorContent: JSONContent; // Add this prop
    onEditorContentChange: (content: JSONContent) => void; // Add this prop
    itineraryFields: DivType[];
    itineraryAppend: (value: Partial<DivType>) => void;
    itineraryRemove: (index: number) => void;
    factsFields: DivType[];
    factsAppend: (value: Partial<FactsType>) => void;
    factsRemove: (index: number) => void;
    faqFields: DivType[];
    faqAppend: (value: Partial<FaqType>) => void;
    faqRemove: (index: number) => void;
    categories: Option[];
    facts: FactData[];
    faq: FaqData[];
    singleTourData?: Tour;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();



const TabContent: React.FC<TabContentProps> = (
    {
        form,
        activeTab,
        tripCode,
        handleGenerateCode,
        tourMutation,
        singleTour,
        editorContent,
        onEditorContentChange,
        itineraryFields, itineraryAppend, itineraryRemove,
        factsFields,
        factsAppend,
        factsRemove,
        faqFields,
        faqAppend,
        faqRemove,
        categories,
        facts,
        faq,
        singleTourData
    }) => {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [imageArray, setImageArray] = useState([]);

    useEffect(() => {
        if (singleTourData && Array.isArray(singleTourData.gallery)) {
            const images = singleTourData.gallery.map(item => item.image);
            setImageArray(images);
        }
    }, [singleTourData]);

    const [selectedFact, setSelectedFact] = useState<FactData | null>(null);
    const [selectedFaq, setSelectedFaq] = useState<FaqData | null>(null);
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
            setImageDialogOpen(false); // Close the image dialog
        }
    };
    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
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


    function onDocumentLoadSuccess() {
        setPageNumber(1);
    }

    const watchedItinerary = form.watch('itinerary');
    const watchedFacts = form.watch('facts');
    const watchedFaq = form.watch('faqs');

    // const galleryImage = Array.from({ length: 10 }, (_, index) => index + 1);
    const handleGalleryImage = (imageUrl: string) => {

        setImageArray((prevImageArray) => {
            const newImages = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

            // Prevent duplicates by filtering out existing images
            const updatedImageArray = newImages.filter(image => !prevImageArray.includes(image));

            // itineraryAppend the new unique images to the existing array
            return [...prevImageArray, ...updatedImageArray];
        });

        // form.setValue(`gallery`, imageUrl || '');

    };

    // Remove image from imageArray by index
    const handleRemoveImageGallery = (index: number) => {
        setImageArray((prevImageArray) =>
            prevImageArray.filter((_, i) => i !== index)
        );
    };


    return (
        <Card>
            <div id="overview">
                <CardHeader>
                    <CardTitle >Tour Details</CardTitle>
                    <CardDescription>Enter title and description</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-3">

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full"
                                                {...field}
                                                placeholder='Tour Title'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem className='relative'>
                                        <FormLabel>Trip Code:</FormLabel>
                                        {
                                            singleTour ?

                                                <FormControl className="relative">
                                                    <Input
                                                        type="text"
                                                        className="w-full uppercase"
                                                        {...field}
                                                        placeholder='Trip Code'
                                                        disabled
                                                    />

                                                </FormControl> :
                                                <>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            className="w-full uppercase"
                                                            {...field}
                                                            placeholder='Trip Code'
                                                            value={tripCode}
                                                            disabled

                                                        />
                                                    </FormControl>
                                                    <Button onClick={handleGenerateCode} className='absolute top-7 right-5' type='button'>
                                                        {tourMutation.isPending && <LoaderCircle className="animate-spin" />}
                                                        Generate
                                                    </Button>
                                                </>

                                        }

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-3">
                            <FormLabel>Description</FormLabel>
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field }) => (
                                    <Editor
                                        initialValue={editorContent}
                                        onContentChange={(content) => {
                                            onEditorContentChange(content);
                                            form.setValue('description', JSON.stringify(content)); // Update the form value
                                        }}
                                    />

                                )}
                            />
                        </div>
                        <div className="grid gap-3">


                            {
                                categories &&

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>

                                                <MultipleSelector
                                                    {...field}
                                                    defaultOptions={categoryOptions}
                                                    placeholder="Select Category"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            }
                        </div>
                        <div className="grid gap-3 auto-rows-max grid-cols-2">
                            <FormField
                                control={form.control}
                                name="tourStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Published">Published</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                                <SelectItem value="Expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="w-full"
                                                {...field}
                                                placeholder='Tour Price'
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value);
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">

                        </div>
                        <div className="grid grid-flow-col grid-cols-2 gap-3">
                            <div className="w-[100%] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">

                                <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                                    <FormField
                                        control={form.control}
                                        name="coverImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cover Image <br /></FormLabel>
                                                {field.value ? (
                                                    <div className="mt-2 relative">
                                                        <Link to={field.value} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={field.value}
                                                                alt="Selected Cover Image"
                                                                className="rounded-md w-full "

                                                            />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(field.onChange)}
                                                            className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                                                        <DialogTrigger >
                                                            <div
                                                                className={cn(
                                                                    buttonVariants({
                                                                        size: "icon",
                                                                    }),
                                                                    "size-8"
                                                                )}
                                                            >
                                                                <Paperclip className="size-4" />
                                                                <span className="sr-only">Select your files</span>
                                                            </div>
                                                            <span className="pl-2">Choose Image</span></DialogTrigger>
                                                        <DialogContent
                                                            className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                            onInteractOutside={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <DialogHeader>
                                                                <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                                <div className="upload dialog">
                                                                    <GalleryPage
                                                                        isGalleryPage={false}
                                                                        onImageSelect={(imageUrl) =>
                                                                            handleImageSelect(imageUrl, field.onChange)
                                                                        }
                                                                    />
                                                                </div>
                                                            </DialogHeader>
                                                            <DialogDescription>
                                                                Select a Image.
                                                            </DialogDescription>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='w-[100%] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                                    <FormField
                                        control={form.control}
                                        name="file"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PDF<br /></FormLabel>
                                                {field.value ? (
                                                    <div className="mt-2 relative">
                                                        <Link to={field.value} target="_blank" rel="noopener noreferrer">

                                                            <div className="relative group pdf-container">
                                                                <Document file={field.value} onLoadSuccess={onDocumentLoadSuccess}>
                                                                    <Page
                                                                        pageNumber={pageNumber}
                                                                        height={300}
                                                                        className="w-full" />
                                                                </Document>
                                                            </div>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePdf(field.onChange)}
                                                            className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                                                        <DialogTrigger >
                                                            <div
                                                                className={cn(
                                                                    buttonVariants({
                                                                        size: "icon",
                                                                    }),
                                                                    "size-8"
                                                                )}
                                                            >
                                                                <Paperclip className="size-4" />
                                                                <span className="sr-only">Select your files</span>
                                                            </div>
                                                            <span className="pl-2">Choose PDF</span></DialogTrigger>
                                                        <DialogContent
                                                            className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                            onInteractOutside={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <DialogHeader>
                                                                <DialogTitle className="mb-3 text-left">Choose pdf From Gallery</DialogTitle>
                                                                <div className="upload dialog">
                                                                    <GalleryPage
                                                                        isGalleryPage={false}
                                                                        activeTab="pdfs"
                                                                        onImageSelect={(pdfUrl) =>
                                                                            handlePdfSelect(pdfUrl, field.onChange)
                                                                        }
                                                                    />
                                                                </div>
                                                            </DialogHeader>
                                                            <DialogDescription>
                                                                Select a Pdf.
                                                            </DialogDescription>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div >
                </CardContent >
            </div >
            <div id="itinerary">
                <CardHeader>
                    <CardTitle>Itinerary Details</CardTitle>
                    <CardDescription>Enter Itinerary step by step format</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="outline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Outline</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-32"
                                                {...field}
                                                placeholder='Tour Outline'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Button type="button"
                                className="w-32 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
                                onClick={() => itineraryAppend({ day: '', title: '', description: '', dateTime: undefined })}
                            >
                                Add Itinerary
                            </Button>
                            <Accordion type="single" collapsible>
                                {itineraryFields && itineraryFields.length > 0 ? (
                                    itineraryFields.map((item, index) => (
                                        <AccordionItem key={index} value={`item-${index}`} >
                                            <AccordionTrigger className="hover:no-underline hover:text-primary text-decoration-none">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="">
                                                        {`${watchedItinerary[index]?.day || 'Day ' + (index + 1) + ' - No Activity'}`}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <div
                                                            className="text-sm ml-5 px-1 py-1 leading-4 bg-transparent hover:bg-transparent hover:text-destructive/60 hover:text-decoration-none rounded text-destructive cursor-pointer"
                                                            onClick={() => itineraryRemove(index)}
                                                        >
                                                            <Trash2 />
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid gap-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.day`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        {...field}
                                                                        placeholder={`Day ${index + 1} - Activity`}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.title`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        {...field}
                                                                        placeholder={`Day ${index + 1} - Title`}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="min-h-32"
                                                                        {...field}
                                                                        placeholder={`Day ${index + 1} - Description`}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.dateTime`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <DateTimePicker
                                                                        value={field.value ? new Date(field.value) : undefined}
                                                                        onChange={field.onChange}
                                                                        granularity="minute"
                                                                        hourCycle={12}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem >
                                    ))) : (
                                    <p>No itinerary added yet.</p>
                                )}
                            </Accordion >


                        </div >
                        <Button type="submit" className="ml-auto">
                            {
                                !singleTour ? "Create Tour" : "Save Changes"
                            }
                        </Button>
                    </div >
                </CardContent >
            </div >

            <div id="dates">
                <CardHeader>
                    <CardTitle>Dates Details</CardTitle>
                    <CardDescription>Enter the dates for the tour.</CardDescription>
                </CardHeader>
                <CardContent>

                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="dates.tripDuration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tour Duration <br /></FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Day(s)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="dates.startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Start Date <br /></FormLabel>
                                        <FormControl>

                                            <DateTimePicker
                                                value={field.value ? new Date(field.value) : undefined}
                                                onChange={field.onChange}
                                                granularity="minute"
                                                hourCycle={12}
                                            />

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="dates.endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour End Date <br /></FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value ? new Date(field.value) : undefined}
                                                onChange={field.onChange}
                                                granularity="minute"
                                                hourCycle={12}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                </CardContent>
            </div>


            <div id="inc-exc">
                <CardHeader>
                    <CardTitle>inc-exc</CardTitle>
                    <CardDescription>Enter what is included and excluded in the tour.</CardDescription>
                </CardHeader>
                <CardContent>

                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="include"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tour Included <br /></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-32"
                                            {...field}
                                            rows={8}
                                            placeholder={`Tour Included`}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="exclude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tour Excluded <br /></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-32"
                                            {...field}
                                            rows={8}
                                            placeholder={`Tour Excluded`}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </div>

            <div id="facts">
                <CardHeader>
                    <CardTitle>Facts</CardTitle>
                    <CardDescription>Add facts to your tour.
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                factsAppend({ title: '', field_type: '', value: [''], icon: '' })
                            }}
                            className="ml-2 float-right">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Facts
                        </Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible>
                        {factsFields && factsFields.length > 0 ? (
                            factsFields.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="">
                                                {`${watchedFacts[index]?.title || 'New Facts'}`}
                                            </div>
                                            <div className="flex justify-end">
                                                <div
                                                    className="text-sm ml-5 px-1 py-1 leading-4 bg-transparent hover:bg-transparent hover:text-destructive/60 hover:text-decoration-none rounded text-destructive cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedFact(null);
                                                        factsRemove(index)
                                                    }}
                                                >
                                                    <Trash2 />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <FormField
                                            control={form.control}
                                            name={`facts.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fact </FormLabel>
                                                    <FormControl>

                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            const fact = facts.find(f => f.name === value); // Find the selected fact by name
                                                            setSelectedFact(fact); // Set the selected fact

                                                            form.setValue(`facts.${index}.field_type`, fact?.field_type || '');
                                                            form.setValue(`facts.${index}.icon`, fact?.icon || '');
                                                        }}
                                                            value={field.value || ''}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a fact" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {facts.map((fact, index) => (
                                                                    <SelectItem key={index} value={fact.name}>
                                                                        {fact.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {selectedFact && selectedFact.field_type === 'Plain Text' && (
                                            <FormField
                                                control={form.control}
                                                name={`facts.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{selectedFact.name} Details</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder={`Enter ${selectedFact.name}`}
                                                                onChange={(e) => {
                                                                    // Always wrap the value in an array for Plain Text
                                                                    field.onChange([e.target.value]);
                                                                }}
                                                                value={Array.isArray(field.value) ? field.value[0] || '' : ''}
                                                            />

                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedFact && selectedFact.field_type === 'Single Select' && (
                                            <FormField
                                                control={form.control}
                                                name={`facts.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{selectedFact.name} Details</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    // Ensure the value is wrapped in an array for Single Select
                                                                    field.onChange([value]);
                                                                }}
                                                                value={Array.isArray(field.value) ? field.value[0] || '' : ''}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={`Select ${selectedFact.name}`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Array.isArray(selectedFact.value) &&
                                                                        selectedFact.value.map((option, idx) => (
                                                                            <SelectItem key={idx} value={String(option)}>
                                                                                {String(option)}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>


                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {selectedFact && selectedFact.field_type === 'Multi Select' && (
                                            <FormField
                                                control={form.control}
                                                name={`facts.${index}.value`}
                                                render={({ field }) => {
                                                    // Define the options outside the JSX
                                                    const optionsMulti = Array.isArray(selectedFact.value)
                                                        ? selectedFact.value.map((option) => ({
                                                            value: option,  // Assign the value
                                                            label: option,  // Assign the label
                                                        }))
                                                        : [];
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>{selectedFact.name} Details</FormLabel>
                                                            <FormControl>
                                                                <MultipleSelector
                                                                    {...field}
                                                                    value={Array.isArray(field.value)
                                                                        ? field.value.map(value => ({
                                                                            value,  // Assuming field.value is an array of strings
                                                                            label: optionsMulti.find(option => option.value === value)?.label || value
                                                                        }))
                                                                        : []}
                                                                    defaultOptions={optionsMulti}
                                                                    placeholder="Select Facts"
                                                                    onChange={(selectedValues) => {
                                                                        // Ensure selectedValues is an array of objects with `value` and `label`
                                                                        const transformedValues = Array.isArray(selectedValues)
                                                                            ? selectedValues
                                                                                .filter(option => option && typeof option === 'object' && option.value)  // Ensure valid objects
                                                                                .map(option => option.value)  // Extract the value property
                                                                            : [];

                                                                        field.onChange(transformedValues);  // Store the array of strings
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        )}

                                    </AccordionContent>
                                </AccordionItem>
                            ))) : (
                            <p>No Facts added yet.</p>
                        )}
                    </Accordion>
                </CardContent>
            </div>

            <div id="gallery" className="relative">
                <CardHeader>
                    <CardTitle>Gallery Details</CardTitle>
                    <CardDescription>Select gallery images for the tour.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 h-[500px] overflow-y-auto mb-5 tab-content-gallery">

                        <GalleryPage
                            isGalleryPage={false}
                            onImageSelect={(imageUrl) =>
                                handleGalleryImage(imageUrl)
                            }
                        />
                    </div>

                    {imageArray && imageArray.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {imageArray.map((imageUrl, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={imageUrl}
                                        alt={`Image ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />

                                    {(() => {
                                        // @ts-expect-error: form.setValue return type is void, but we're using it for side effects
                                        form.setValue(`gallery.${index}.image`, imageUrl)
                                        return null
                                    })()}
                                    <button
                                        className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-md"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemoveImageGallery(index);
                                            form.unregister(`gallery.${index}`); // Unregister the field from the form
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </div>

            <div id="locations">
                <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                    <CardDescription>Select google Url for the tour location.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="map"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Map Iframe<br /></FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Paste Iframe from google maps" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <h2 className="text-lg font-medium mb-5 bold">Starting Address</h2>
                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="location.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address<br /></FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="123 Main St" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="location.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> City<br /></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="City" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="location.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> State<br /></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="State" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2 mb-5">
                        <FormField
                            control={form.control}
                            name="location.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Country<br /></FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Country" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="location.lat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Latitude<br /></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Latitude" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-2 mb-5">
                            <FormField
                                control={form.control}
                                name="location.lng"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Longitude<br /></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Longitude" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <iframe src="https://www.google.com/maps/d/embed?mid=14cqfbihuJgRL5Sgdw4WQqVkXUPwgLDk&usp=sharing" className="w-full h-[500px]"></iframe>

                </CardContent>
            </div >


            <div id="faqs">
                <CardHeader>
                    <CardTitle>FAQ'S</CardTitle>
                    <CardDescription>Add faq's to your tour.
                        <Button
                            onClick={() => faqAppend({ question: '', answer: '', })}
                            className="ml-2 float-right">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add FAQ'S
                        </Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <Accordion type="single" collapsible>
                        {faqFields && faqFields.length > 0 ? (
                            faqFields.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="">
                                                {`${watchedFaq[index]?.question || 'New Faq'}`}
                                            </div>
                                            <div className="flex justify-end">
                                                <div
                                                    className="text-sm ml-5 px-1 py-1 leading-4 bg-transparent hover:bg-transparent hover:text-destructive/60 hover:text-decoration-none rounded text-destructive cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedFaq(null);
                                                        faqRemove(index)
                                                    }}
                                                >
                                                    <Trash2 />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <FormField
                                            control={form.control}
                                            name={`faqs.${index}.question`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Faq's Question</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            const faqData = faq.find(f => f.question === value); // Find the selected fact by name
                                                            setSelectedFaq(faqData); // Set the selected fact
                                                            form.setValue(`faqs.${index}.answer`, faqData?.answer || '');
                                                        }}
                                                            defaultValue={field.value}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a faq" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {faq.map((fa) => (
                                                                    <SelectItem key={fa.id} value={fa.question}>
                                                                        {fa.question}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`faqs.${index}.answer`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Faq's Answer </FormLabel>
                                                    <FormControl>
                                                        <Textarea rows={8} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />


                                    </AccordionContent>
                                </AccordionItem>
                            ))) : (
                            <p>No Faq's added yet.</p>
                        )}
                    </Accordion>
                </CardContent>
            </div>

            <div id="enquiry">
                <CardHeader>
                    <CardTitle>Enquiry</CardTitle>
                    <CardDescription>Turn on Enquiry for the tour.</CardDescription>
                </CardHeader>
                <CardContent>

                    <FormField
                        control={form.control}
                        name="enquiry"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Enquiry emails
                                    </FormLabel>
                                    <FormDescription>
                                        Lets users send you emails about tours details.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                </CardContent>
            </div>

        </Card >
    )
}


export default TabContent;
