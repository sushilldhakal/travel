import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FileText, LoaderCircle, Paperclip, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from './DateTimePicker';
import { DropzoneOptions } from 'react-dropzone';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/userDefinedComponents/FileUploader';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JSONContent } from "novel";
import Editor from './editor/advanced-editor';
import { TourData } from '@/Provider/types';
import { Controller } from 'react-hook-form';
interface DivType {
    id: number;
    date: Date | undefined;
    content: string;
}
interface TabContentProps {
    activeTab: string;
    tabs: { id: string; content: React.ReactNode }[];
    tourMutation: { isPending: boolean };
    isSingleTour: string;
    singleTour: boolean;
    tripCode: string | undefined;
    handleGenerateCode: () => string;
    singleTourData: TourData | undefined;
    form: ReturnType<typeof useForm>;
    submit: (values: z.infer<typeof formSchema>) => void;
    editorContent: JSONContent; // Add this prop
    onEditorContentChange: (content: JSONContent) => void; // Add this prop

}


const TabContent: React.FC<TabContentProps> = ({ submit, form, activeTab, tripCode, tabs, handleGenerateCode, tourMutation, singleTour, singleTourData, editorContent, onEditorContentChange }) => {
    const [divs, setDivs] = useState<DivType[]>([]);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;
    const handleAddDiv = () => {
        setDivs([...divs, { id: divs.length, date: undefined, content: '' }]);
    };
    const deleteDivs = (id: number) => {
        setDivs(divs.filter(div => div.id !== id));
    };
    const handleDateChange = (id: number, newDate: Date | undefined) => {
        setDivs(divs.map(div => (div.id === id ? { ...div, date: newDate } : div)));
    };

    const dropzone: DropzoneOptions = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png'],
        },
        multiple: false,
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 1 MB
    };
    const dropzonePdf: DropzoneOptions = {
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: false,
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 1 MB
    };




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

                        {/* <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-32"
                                            {...field}
                                            placeholder='Description'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
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
                            {singleTour ?
                                <span className="">
                                    <img src={singleTourData?.coverImage} alt={singleTourData?.title} />
                                    <p className="mt-2 pl-6">Change Cover Image</p>
                                </span> : ''}
                            <div className="flex flex-col h-[200px]  space-y-1.5 p-6 relative">

                                <FormField
                                    control={form.control}
                                    name="coverImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cover Image</FormLabel>
                                            <FileUploader
                                                value={field.value}
                                                // onValueChange={field.onChange}
                                                onValueChange={(files) => {
                                                    const dataTransfer = new DataTransfer();
                                                    files?.forEach((file) => dataTransfer.items.add(file));
                                                    field.onChange(dataTransfer.files);
                                                }}
                                                dropzoneOptions={dropzone}
                                                reSelect={true}
                                            >
                                                <FileInput
                                                    className={cn(
                                                        buttonVariants({
                                                            size: "icon",
                                                        }),
                                                        "size-8"
                                                    )}
                                                >
                                                    <Paperclip className="size-4" />
                                                    <span className="sr-only">Select your files</span>
                                                </FileInput>
                                                {field.value && field.value.length > 0 && (
                                                    <FileUploaderContent className="absolute bottom-8 p-2 bottom-30  w-full -ml-3 rounded-b-none rounded-t-md flex-row gap-2 ">
                                                        {Array.from(field.value).map((file, i) => {
                                                            if (!(file instanceof File)) return null; // Add this type guard
                                                            return (
                                                                <FileUploaderItem
                                                                    key={i}
                                                                    index={i}
                                                                    aria-roledescription={`file ${i + 1} containing ${file.name
                                                                        }`}
                                                                    className="p-0 size-20"
                                                                >
                                                                    <AspectRatio className="size-full">
                                                                        <Link to={URL.createObjectURL(file)} className="block" target="_blank">
                                                                            <img
                                                                                src={URL.createObjectURL(file)}
                                                                                alt={file.name}
                                                                                className="object-cover rounded-md"
                                                                            />
                                                                        </Link>

                                                                    </AspectRatio>
                                                                    <button
                                                                        type="button"
                                                                        className={cn(
                                                                            "absolute top-1  right-1 z-10"
                                                                        )}
                                                                        onClick={() => {
                                                                            const files = Array.from(field.value);
                                                                            field.onChange(files.filter((file, index) => index !== 0));
                                                                        }}
                                                                    >
                                                                        <span className="sr-only">remove item</span>
                                                                        <Trash2 className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
                                                                    </button>
                                                                </FileUploaderItem>
                                                            );
                                                        })}
                                                    </FileUploaderContent>
                                                )}
                                            </FileUploader>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className='w-[100%] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                            <div className="flex relative flex-col space-y-1.5 p-6 h-[200px]">
                                {singleTour && singleTourData.file ?
                                    <span className="">
                                        <Link className='text-primary' to={singleTourData?.file} target="_blank">Download Tour PDF </Link>

                                        <p className="mt-2 pl-6">Change Cover Image</p>
                                    </span> : ''}

                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tour PDF</FormLabel>
                                            <FileUploader
                                                value={field.value}
                                                // onValueChange={field.onChange}
                                                onValueChange={(files) => {
                                                    const dataTransfer = new DataTransfer();
                                                    files?.forEach((file) => dataTransfer.items.add(file));
                                                    field.onChange(dataTransfer.files);
                                                }}
                                                dropzoneOptions={dropzonePdf}
                                                reSelect={true}
                                            >
                                                <FileInput
                                                    className={cn(
                                                        buttonVariants({
                                                            size: "icon",
                                                        }),
                                                        "size-8"
                                                    )}
                                                >
                                                    <Paperclip className="size-4" />
                                                    <span className="sr-only">Select your files</span>
                                                </FileInput>
                                                {field.value && field.value.length > 0 && (
                                                    <FileUploaderContent className="absolute bottom-8 p-2 bottom-30  w-full -ml-3 rounded-b-none rounded-t-md flex-row gap-2 ">
                                                        {Array.from(field.value).map((file, i) => {
                                                            if (!(file instanceof File)) return null; // Add this type guard
                                                            return (
                                                                <FileUploaderItem
                                                                    key={i}
                                                                    index={i}
                                                                    aria-roledescription={`file ${i + 1} containing ${file.name
                                                                        }`}
                                                                    className="p-0 size-20"
                                                                >
                                                                    <AspectRatio className="size-full">
                                                                        <Link to={URL.createObjectURL(file)} className="block text-lg" target="_blank">
                                                                            <FileText className="text-lg" size="80" />
                                                                        </Link>

                                                                    </AspectRatio>
                                                                    <button
                                                                        type="button"
                                                                        className={cn(
                                                                            "absolute top-1  right-1 z-10"
                                                                        )}
                                                                        onClick={() => {
                                                                            const files = Array.from(field.value);
                                                                            field.onChange(files.filter((file, index) => index !== 0));
                                                                        }}
                                                                    >
                                                                        <span className="sr-only">remove item</span>
                                                                        <Trash2 className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
                                                                    </button>
                                                                </FileUploaderItem>
                                                            );
                                                        })}
                                                    </FileUploaderContent>
                                                )}
                                            </FileUploader>
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
                                name="itineraryOutline"
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
                            <Button type="button" className="w-32 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium" onClick={handleAddDiv}>Add Itinerary</Button>
                            <Accordion type="single" collapsible>
                                {divs.map(({ id, date }) => (
                                    <AccordionItem key={id} value={`item-${id}`}>
                                        <AccordionTrigger>
                                            <div className="flex items-center justify-between">
                                                <span>
                                                    <FormField
                                                        control={form.control}
                                                        name={`day${id + 1} header`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        className="w-full"
                                                                        {...field}
                                                                        placeholder={`Day ${id + 1} - Arrival`}
                                                                        value={field.value || ''}
                                                                        onChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </span>
                                                <Link to={(e) => e.preventDefault()} className="text-xs ml-5 px-1 py-1 leading-4" onClick={() => deleteDivs(id)}>
                                                    Delete
                                                </Link>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`day${id + 1} title`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="text"
                                                                    className="w-full"
                                                                    {...field}
                                                                    placeholder={`Day ${id + 1} - Title`}
                                                                    value={field.value || ''}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`day${id + 1} description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    className="min-h-32"
                                                                    {...field}
                                                                    placeholder={`Day ${id + 1} - Description`}
                                                                    value={field.value || ''}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`day${id + 1} date`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button
                                                                                variant={"outline"}
                                                                                className={cn(
                                                                                    "w-[240px] pl-3 text-left font-normal",
                                                                                    !field.value && "text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                {field.value ? (
                                                                                    format(field.value, "PPP")
                                                                                ) : (
                                                                                    <span>Pick a date</span>
                                                                                )}
                                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0" align="start">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={field.value}
                                                                            onSelect={field.onChange}
                                                                            disabled={(date) =>
                                                                                date > new Date() || date < new Date("1900-01-01")
                                                                            }
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <TimePicker date={time} onChange={setTime} />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                        <Button onClick={submit} className="ml-auto">
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}


export default TabContent;
