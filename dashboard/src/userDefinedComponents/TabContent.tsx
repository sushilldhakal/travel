import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarIcon, FileText, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


interface TabContentProps {
    activeTab: string;
    tabs: { id: string; content: React.ReactNode }[];
    mutation: { isPending: boolean };
    isSingleTour: string;
    generateTripCode: () => string;
    initialTourData: InitialToutData;

}

interface DivType {
    id: number;
    date: Date | undefined;
    content: string;
}


interface InitialToutData {
    title: string,
    description: string,
    tripCode: string,
    tourStatus: string,
    coverImage: string,
    file: string,
}


function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    code: z.string().min(2, 'Trip code must be at least 2 characters.'),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    tourStatus: z.string(),
    coverImage: z.instanceof(FileList).refine((file) => {
        return file.length == 0;
    }, 'Cover Image is required'),
    file: z.instanceof(FileList).refine((file) => {
        return file.length == 0;
    }, 'PDF is required'),
});


const TabContent: React.FC<TabContentProps> = ({ activeTab, tabs, mutation, isSingleTour, initialTourData }) => {

    const [divs, setDivs] = useState<DivType[]>([]);
    const [tripCode, setTripCode] = useState(makeid(6).toUpperCase());
    const [formInitialized, setFormInitialized] = useState(false);
    const [formData, setFormData] = useState({
        title: initialTourData?.title ? initialTourData?.title : '',
        description: initialTourData?.description ? initialTourData?.description : '',
        code: initialTourData?.tripCode ? initialTourData?.tripCode : '',
        coverImage: initialTourData?.coverImage ? initialTourData?.coverImage : '',
        file: initialTourData?.file ? initialTourData?.file : '',
        tourStatus: initialTourData?.tourStatus ? initialTourData?.tourStatus : '',
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            code: tripCode,
            tourStatus: '',
        }
    });

    const initializeForm = async () => {
        const defaultValues = initialTourData ? {
            title: initialTourData.title || '',
            description: initialTourData.description || '',
            code: initialTourData.tripCode || tripCode,
            tourStatus: initialTourData.tourStatus || '',
            coverImage: initialTourData.coverImage || '',
            file: initialTourData.file || '',
        } : {
            title: '',
            description: '',
            code: tripCode,
            tourStatus: '',
        };

        form.reset(defaultValues);
        setFormInitialized(true);
    };
    useEffect(() => {
        if (initialTourData) {
            initializeForm();
        }
    }, [initialTourData]);


    console.log("formData", initialTourData);

    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return <div>Select a tab to see its content</div>;

    const handleAddDiv = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setDivs([...divs, {
            id: divs.length,
            date: undefined,
            content: `<AccordionItem value="item-${divs.length}">
                    <AccordionTrigger>
                        <div className="flex items-center justify-between">
                            <span><Input type="text" defaultValue="Day ${divs.length + 1} - Arrival" /></span>
                            <PlusIcon className="w-4 h-4" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid gap-3">
                            <Input type="text" placeholder="Event or activity" />
                            <Textarea placeholder="Description" className="min-h-32" />
                            <div className="flex items-center gap-2">
                                <Input type="time" />
                                <span>to</span>
                                <Input type="time" />
                            </div>
                            <Button onClick={() => deleteDivs(divs.length)}>Delete</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>`
        }]);
    };

    const deleteDivs = (id: number) => {
        setDivs(divs.filter(div => div.id !== id));
    };

    const handleDateChange = (id: number, newDate: Date | undefined) => {
        setDivs(divs.map(div => (div.id === id ? { ...div, date: newDate } : div)));
    };

    // const handleCoverImageChange = () => {
    //     const file = coverImageRef.current?.files?.[0];
    //     console.log('Selected cover image file:', file);
    // };

    // const handleTourFileChange = () => {
    //     const file = fileRef.current?.files?.[0];
    //     console.log('Selected tour PDF file:', file);
    // };
    const coverImageRef = form.register('coverImage');
    const fileRef = form.register('file');

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!values) {
            return;
        }
        const formdata = new FormData();
        formdata.append('title', values.title);
        formdata.append('tripCode', tripCode);
        formdata.append('description', values.description);
        formdata.append('tourStatus', values.tourStatus);
        formdata.append('coverImage', values.coverImage[0]);
        formdata.append('file', values.file[0]);
        try {
            await mutation.mutate(formdata);
            form.reset();
        } catch (error) {
            console.error('Error creating tour:', error);
        }
    };




    switch (tab.id) {
        case tabs[0].id:
            return (
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit(onSubmit)();
                    }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tour Details</CardTitle>
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
                                                <FormItem>
                                                    <FormLabel> Trip Code:</FormLabel>
                                                    <FormControl className="relative">
                                                        {
                                                            initialTourData?.code ?
                                                                <Input
                                                                    type="text"
                                                                    className="w-full"
                                                                    {...field}
                                                                    disabled
                                                                /> :
                                                                <Input
                                                                    type="text"
                                                                    className="w-full"
                                                                    {...field}
                                                                    placeholder='Trip Code'
                                                                />
                                                        }

                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <FormField
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
                                        />
                                    </div>
                                    <div className="grid gap-3 auto-rows-max grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="tourStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tour Status</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Publish">Publish</SelectItem>
                                                            <SelectItem value="Draft">Draft</SelectItem>
                                                            <SelectItem value="Expired">Expired</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-flow-col gap-3">
                                        <div className="col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                                            <div className="flex flex-col space-y-1.5 p-6">
                                                <FormField
                                                    control={form.control}
                                                    name="coverImage"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel>Cover Image</FormLabel>
                                                            <FormControl>
                                                                {
                                                                    isSingleTour && initialTourData?.coverImage ? (
                                                                        <span className="">
                                                                            <img src={initialTourData?.coverImage} alt={initialTourData?.title} />
                                                                            <Input
                                                                                type="file"
                                                                                className="w-full"
                                                                                placeholder='Change Cover Image'
                                                                                {...coverImageRef}
                                                                            />
                                                                        </span>
                                                                    ) : (<Input
                                                                        type="file"
                                                                        className="w-full"
                                                                        {...coverImageRef}
                                                                    />)
                                                                }
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className='col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                            <div className="flex flex-col space-y-1.5 p-6">
                                                <FormField
                                                    control={form.control}
                                                    name="file"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel>Tour PDF File</FormLabel>
                                                            <FormControl>
                                                                {
                                                                    isSingleTour && initialTourData?.file ?
                                                                        <div className='mt-3'>
                                                                            <Link target='_blank' className="" to={initialTourData?.file} download>
                                                                                <FileText />
                                                                                Download File

                                                                            </Link>
                                                                            <Input
                                                                                type="file"
                                                                                className="w-full mt-4"
                                                                                {...fileRef}
                                                                            />
                                                                        </div>
                                                                        : <Input
                                                                            type="file"
                                                                            className="w-full"
                                                                            {...fileRef}
                                                                        />
                                                                }
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" size="sm"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending && <LoaderCircle className="animate-spin" />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                </Form>

            );
        case tabs[1].id: // Itinerary tab
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Itinerary Details</CardTitle>
                        <CardDescription>Enter Itinerary step by step format</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="description">Tour Outline</Label>
                                <Textarea
                                    id="Idescription"
                                    defaultValue={initialTourData?.tour?.itinerary ?? ""}
                                    className="min-h-32"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Button type="button" className="w-32 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium" onClick={handleAddDiv}>Add Itinerary</Button>
                                <Accordion type="single" collapsible>
                                    {divs.map(({ id, date, content }) => (
                                        <AccordionItem key={id} value={`item-${id}`}>
                                            <AccordionTrigger>
                                                <div className="flex items-center justify-between">
                                                    <span><Input type="text" defaultValue={`Day ${id + 1} - Arrival`} /></span>
                                                    <Button className="text-xs ml-5 px-1 py-1 leading-4" variant="destructive" onClick={() => deleteDivs(id)}>Delete</Button>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid gap-3">
                                                    <Input type="text" placeholder="Itinerary Title" />
                                                    <Textarea placeholder="Description" className="min-h-32" />
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="date">Itinerary Date and Time</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={`w-[280px] justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    onSelect={(newDate) => handleDateChange(id, newDate)}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Input type="time" />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                            <Button type="submit" className="ml-auto">
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        case tabs[2].id: // Price & Dates tab
            return (
                <Card>
                    Price & Dates
                </Card>
            );
        case tabs[3].id: // Includes/Excludes tab
            return (
                <Card>
                    Inc+/Exc-
                </Card>
            );
        case tabs[4].id: // Facts tab
            return (
                <Card>
                    Facts
                </Card>
            );
        case tabs[5].id: // Gallery tab
            return (
                <Card>
                    Gallery
                </Card>
            );
        case tabs[6].id: // Locations tab
            return (
                <Card>
                    Locations
                </Card>
            );
        case tabs[7].id: // FAQ's tab
            return (
                <Card>
                    FAQ's
                </Card>
            );
        case tabs[8].id: // Downloads tab
            return (
                <Card>
                    Downloads
                </Card>
            );
        case tabs[9].id: // Tabs in Display tab
            return (
                <Card>
                    Tabs in Display
                </Card>
            );
        case tabs[10].id: // Enquiry tab
            return (
                <Card>
                    Enquiry
                </Card>
            );
        default:
            return <div>{tab.content}</div>;
    }
};

export default TabContent;
