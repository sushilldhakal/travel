import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface DivType {
    id: number;
    date: Date | undefined;
    content: string;
}



function makeid(length) {
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
const TabContent = ({ form, activeTab, formData, tabs, mutation, coverImageRef, fileRef, singleTour }) => {
    const [divs, setDivs] = useState<DivType[]>([]);
    const [tripCode, setTripCode] = useState(makeid(6).toUpperCase());
    const tab = tabs.find(t => t.id === activeTab);

    if (!tab) return <div>Select a tab to see its content</div>;

    // Function to handle adding itinerary items
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

    // Function to delete itinerary items
    const deleteDivs = (id: number) => {
        setDivs(divs.filter(div => div.id !== id));
    };

    // Function to handle date change in itinerary items
    const handleDateChange = (id: number, newDate: Date | undefined) => {
        setDivs(divs.map(div => (div.id === id ? { ...div, date: newDate } : div)));
    };


    // // Function to handle file selection for cover image
    // const handleCoverImageChange = () => {
    //     const file = coverImageRef.current?.files?.[0];
    //     console.log('Selected cover image file:', file);
    // };

    // // Function to handle file selection for tour PDF file
    // const handleTourFileChange = () => {
    //     const file = fileRef.current?.files?.[0];
    //     console.log('Selected tour PDF file:', file);
    // };

    // Render content based on active tab
    switch (tab.id) {
        case tabs[0].id: // Overview tab
            return (
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

                                                {
                                                    singleTour ? <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        value={formData?.tour?.title}
                                                    // value={formData?.tour?.title ?? ''}
                                                    /> : <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        placeholder='Tour Title'
                                                    // value={formData?.tour?.title ?? ''}
                                                    />
                                                }
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tripCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel> Trip Code:</FormLabel>
                                            <FormControl className="relative">
                                                {
                                                    singleTour ? <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        value={formData?.tour?.tripCode}
                                                        disabled
                                                    /> : <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        placeholder={tripCode}
                                                        value={tripCode}
                                                        disabled
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
                                                {
                                                    singleTour ? <Textarea
                                                        className="min-h-32"
                                                        {...field}
                                                        value={formData?.tour?.description}
                                                    /> : <Textarea
                                                        className="min-h-32"
                                                        {...field}
                                                        placeholder='Description'
                                                    />
                                                }
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-3 auto-rows-max grid-cols-2">
                                <Label htmlFor="status">Tour Status</Label>
                                <Select id="status">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                                            singleTour && formData?.tour?.coverImage ? (
                                                                <span className="">
                                                                    <img src={formData.tour.coverImage} alt={formData.tour.title} />
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
                                                            singleTour && formData?.tour?.file ?
                                                                <div className='mt-3'>
                                                                    <Link target='_blank' to={formData.tour.file} download>Download File</Link>
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
                        <Button type="submit" size="sm" disabled={mutation.isPending}>
                            {mutation.isPending && <LoaderCircle className="animate-spin" />}
                            <span className="ml-2">Save</span>
                        </Button>
                    </CardFooter>
                </Card>
            );
        case tabs[1].id: // Itinerary tab
            return (
                <Card>
                    {/* <CardHeader>
                        <CardTitle>Itinerary Details</CardTitle>
                        <CardDescription>Enter Itinerary step by step format</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="description">Tour Outline</Label>
                                <Textarea
                                    id="Idescription"
                                    defaultValue={formData?.itinerary ?? ""}
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
                    </CardContent> */}
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
