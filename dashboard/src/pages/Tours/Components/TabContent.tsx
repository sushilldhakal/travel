import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, Paperclip, Trash2 } from 'lucide-react';
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
export interface DivType {
    day: string;
    title: string;
    description: string;
    dateTime: Date | undefined;
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
    fields: DivType[];
    append: (value: Partial<DivType>) => void;
    remove: (index: number) => void;
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
        fields, append, remove,
    }) => {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;


    // const handleDateChange = (id: number, newDate: Date | undefined) => {
    //     setItinerary(itinerary.map(div => (div.id === id ? { ...div, date: newDate } : div)));
    // };
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



    return (
        <Card>
            <CardHeader id="overview">
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
                                            step="10"
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
                </div>
            </CardContent>
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
                                onClick={() => append({ day: '', title: '', description: '', dateTime: undefined })}
                            >
                                Add Itinerary
                            </Button>
                            <Accordion type="single" collapsible>
                                {fields && fields.length > 0 ? (
                                    fields.map((item, index) => (
                                        <AccordionItem key={index} value={`item-${index}`} >
                                            <AccordionTrigger className="hover:no-underline hover:text-primary text-decoration-none">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="">
                                                        {`${watchedItinerary[index]?.day || 'Day ' + (index + 1) + ' - No Activity'}`}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <div
                                                            className="text-sm ml-5 px-1 py-1 leading-4 bg-transparent hover:bg-transparent hover:text-destructive/60 hover:text-decoration-none rounded text-destructive cursor-pointer"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 />
                                                        </div>

                                                    </div>

                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent>
                                                <div className="grid gap-3">
                                                    {/* Day Field */}
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

                                                    {/* Title Field */}
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

                                                    {/* Description Field */}
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

                                                    {/* DateTime Field */}
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
        </Card >
    )
}


export default TabContent;
