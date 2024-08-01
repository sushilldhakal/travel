import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from './DateTimePicker';


interface DivType {
    id: number;
    date: Date | undefined;
    content: string;
}


interface TabContentProps {
    activeTab: string;
    tabs: { id: string; content: React.ReactNode }[];
    mutation: { isPending: boolean };
    isSingleTour: string;
    generateTripCode: () => string;
    form: ReturnType<typeof useForm>;
    onSubmit: (values: z.infer<typeof formSchema>) => void;

}


const TabContent: React.FC<TabContentProps> = ({ form, activeTab, tripCode, tabs, handleGenerateCode, tourMutation, singleTour, singleTourData }) => {
    const [divs, setDivs] = useState<DivType[]>([]);
    const coverImageRef = form.register('coverImage');
    const fileRef = form.register('file');
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


    return (
        <Card>
            {tab.id === tabs[0].id && (
                <>
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
                            <div className="grid grid-flow-col gap-3">
                                <div className="col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                                    <div className="flex flex-col space-y-1.5 p-6">
                                        {singleTour ?
                                            <span className="">
                                                <img src={singleTourData?.coverImage} alt={singleTourData?.title} />
                                            </span> : ''}
                                        <FormField
                                            control={form.control}
                                            name="coverImage"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>Cover Image</FormLabel>
                                                    <FormControl>

                                                        <Input
                                                            type="file"
                                                            className="w-full"
                                                            {...coverImageRef}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        upload images.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                    <div className="flex flex-col space-y-1.5 p-6">
                                        {singleTour && singleTourData.file ?
                                            <span className="">
                                                <Link className='text-primary' to={singleTourData?.file} target="_blank">Download Tour PDF </Link>
                                            </span> : ''}
                                        <FormField
                                            control={form.control}
                                            name="file"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>Tour PDF File</FormLabel>
                                                    <FormControl>

                                                        <Input
                                                            type="file"
                                                            className="w-full"
                                                            {...fileRef}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        upload Tour PDF.
                                                    </FormDescription>
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
                            disabled={tourMutation.isPending}
                        >
                            {tourMutation.isPending && <LoaderCircle className="animate-spin" />}
                            <span className="ml-2">Save</span>
                        </Button>
                    </CardFooter>


                </>
            )}
            {tab.id === tabs[1].id && (
                <>
                    {/* <CardHeader>
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
                            <Button type="submit" className="ml-auto">
                                Save Changes
                            </Button>
                        </div>
                    </CardContent> */}
                </>
            )}
            {tab.id === tabs[2].id && (
                <>
                    Price & Dates
                </>
            )}
            {tab.id === tabs[3].id && (
                <>
                    Inc+/Exc-

                </>
            )}
            {tab.id === tabs[4].id && (
                <>
                    Facts
                </>
            )}
            {tab.id === tabs[5].id && (
                <>
                    Gallery
                </>
            )}
            {tab.id === tabs[6].id && (
                <>
                    Locations
                </>
            )}
            {tab.id === tabs[7].id && (
                <>
                    FAQ's
                </>
            )}
            {tab.id === tabs[8].id && (
                <>
                    Downloads
                </>
            )}
            {tab.id === tabs[9].id && (
                <>
                    Tabs in Display
                </>
            )}
            {tab.id === tabs[10].id && (
                <>
                    Enquiry
                </>
            )}
        </Card>
    )
}


export default TabContent;
