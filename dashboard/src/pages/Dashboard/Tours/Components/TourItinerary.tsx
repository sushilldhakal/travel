import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Trash2, PlusCircle, Calendar, ArrowRight, MapPin, Globe, Map, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Textarea } from '@/components/ui/textarea';
import { Destination } from '@/Provider/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useDestination } from '../Destination/useDestination';
import { getUserId } from '@/util/authUtils';
import { useTourForm } from '@/Provider/hooks/useTourForm';

const TourItinerary = () => {
    const { form, itineraryAppend, itineraryFields, itineraryRemove } = useTourForm();
    const userId = getUserId();
    const { data: destinations } = useDestination(userId);
    // Watch the current itinerary array for dynamic field value updates
    const watchedItinerary = form.watch('itinerary');
    return (
        <div className="space-y-8">
            {/* Itinerary Section */}
            <Card className="shadow-sm">
                <CardHeader className="bg-secondary border-b pb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">Tour Itinerary</CardTitle>
                    </div>
                    <CardDescription>
                        Plan your tour schedule with detailed daily activities
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-md font-medium">Daily Schedule</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => itineraryAppend?.({
                                day: '',
                                title: '',
                                description: JSON.stringify({
                                    type: "doc",
                                    content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
                                }),
                                dateTime: new Date()
                            })}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Day</span>
                        </Button>
                    </div>

                    <FormField
                        control={form.control}
                        name="outline" as any

                        render={({ field }) => (
                            <FormItem className="mt-4 mb-4">
                                <FormLabel>Outline</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={(field.value as string) || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="Write your outline here..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {itineraryFields && itineraryFields.length > 0 ? (
                        <div className="space-y-4">
                            {itineraryFields.map((_, index) => (
                                <Card key={index} className={cn(
                                    "border overflow-hidden transition-all",
                                    watchedItinerary && watchedItinerary[index]?.title ? "border-border" : "bg-secondary/50"
                                )}>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value={`item-${index}`} className="border-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70">
                                                <div className="flex items-center space-x-3 w-full">
                                                    <Badge variant={watchedItinerary?.[index]?.title ? "default" : "outline"}
                                                        className="rounded-full h-7 w-7 p-0 flex items-center justify-center font-medium">
                                                        {index + 1}
                                                    </Badge>
                                                    <div className="flex-1 flex items-center">
                                                        <span className="font-medium text-base">
                                                            {watchedItinerary?.[index]?.day || `Day ${index + 1}`}
                                                        </span>
                                                        {watchedItinerary?.[index]?.title && (
                                                            <>
                                                                <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                                                                <span className="text-muted-foreground truncate">
                                                                    {watchedItinerary?.[index]?.title}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            itineraryRemove?.(index);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.stopPropagation();
                                                                itineraryRemove?.(index);
                                                            }
                                                        }}
                                                        className="ml-auto h-8 w-8 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Remove</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-6 pt-2 border-t border-border">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.options.${index}.day` as any}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Day Label</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                        placeholder="e.g. Day 1 - Arrival"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.options.${index}.title` as any}
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-1">
                                                                <FormLabel>Activity Title</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                        placeholder="e.g. City Tour, Guided Museum Visit"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.options.${index}.destination` as any}
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-1">
                                                                <FormLabel>Destination</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                        placeholder="e.g. City Tour, Guided Museum Visit"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.options.${index}.description` as any}
                                                        render={({ field }) => {
                                                            // Parse the current field value for this specific itinerary day
                                                            let currentContent = null;
                                                            try {
                                                                currentContent = field.value ? JSON.parse(field.value) : null;
                                                            } catch (e) {
                                                                currentContent = null;
                                                            }

                                                            return (
                                                                <FormItem className="md:col-span-2">
                                                                    <FormLabel>Description</FormLabel>
                                                                    <FormControl>
                                                                        <div className="prose min-h-[200px] w-full max-w-full rounded-md border border-input">
                                                                            <Editor
                                                                                initialValue={currentContent}
                                                                                onContentChange={(content) => {
                                                                                    field.onChange(JSON.stringify(content));
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed border-border text-center bg-secondary">
                            <div className="bg-primary/10 p-3 rounded-full mb-3">
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-medium text-lg mb-1">No itinerary added yet</h3>
                            <p className="text-muted-foreground mb-5 max-w-md">Start building your tour schedule by adding days and activities for your customers</p>
                            <Button
                                type="button"
                                onClick={() => itineraryAppend?.({
                                    day: '',
                                    title: '',
                                    description: JSON.stringify({
                                        type: "doc",
                                        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
                                    }),
                                    dateTime: new Date()
                                })}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                <span>Add First Day</span>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Section */}
            <Card className="shadow-sm">
                <CardHeader className="bg-secondary border-b pb-6">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">Tour Location</CardTitle>
                    </div>
                    <CardDescription>
                        Specify starting point and map details for the tour
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                        <div className="flex items-center mb-4">
                            <Map className="h-4 w-4 text-primary mr-2" />
                            <h3 className="text-md font-medium">Map Information</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="location.map"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Maps Embed Code</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Paste iframe HTML code from Google Maps"
                                            className="font-mono text-sm min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>



                    <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a destination" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.isArray(destinations) && destinations.length > 0 ? (
                                            destinations.map((destination: Destination) => (
                                                <SelectItem
                                                    disabled={destination.isActive === false}
                                                    key={destination._id}
                                                    value={destination._id}
                                                >
                                                    {destination.name}
                                                </SelectItem>
                                            ))
                                        ) : null}
                                    </SelectContent>
                                    {(!destinations || !Array.isArray(destinations) || destinations.length === 0) && (
                                        <div className="text-muted-foreground text-xs px-2 py-1">
                                            No destinations available
                                        </div>
                                    )}
                                </Select>
                                <FormDescription>
                                    You can manage your destination in your destination section
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                        <div className="flex items-center mb-4">
                            <Pin className="h-4 w-4 text-primary mr-2" />
                            <h3 className="text-md font-medium">Starting Address</h3>
                        </div>
                        <div className="space-y-5">
                            <FormField
                                control={form.control}
                                name="location.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="123 Main St"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    control={form.control}
                                    name="location.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="City"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location.state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="State/Province"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location.zip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="Zip Code/Postal Code"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="location.country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder="Country"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    control={form.control}
                                    name="location.lat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Latitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="e.g. 40.7128"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location.lng"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Longitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. -74.0060"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full h-[400px] mt-4 overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                            <Globe className="h-12 w-12 text-muted-foreground" />
                        </div>
                        {(form.watch('location.map') ||
                            form.watch('location.street') ||
                            form.watch('location.city') ||
                            form.watch('location.state') ||
                            form.watch('location.country')) && (
                                <div className="absolute inset-0 w-full h-full">
                                    {form.watch('location.map') ? (
                                        <div
                                            className="w-full h-full"
                                            dangerouslySetInnerHTML={{ __html: form.watch('location.map') || '' }}
                                        />
                                    ) : (
                                        <iframe
                                            className="w-full h-full border-0"
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA0LY-a9T9SbJ6HhH4HQn1gGsHsfmgZBSU&q=${encodeURIComponent(
                                                [
                                                    form.watch('location.street'),
                                                    form.watch('location.city'),
                                                    form.watch('location.state'),
                                                    form.watch('location.country')
                                                ].filter(Boolean).join(', ')
                                            )}`}
                                            title="Location Map"
                                        />
                                    )}
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TourItinerary;
