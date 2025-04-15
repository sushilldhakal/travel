import React from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Trash2, PlusCircle, Calendar, ArrowRight, MapPin, Globe, Map, Pin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Textarea } from '@/components/ui/textarea';

interface DivType {
    day: string;
    title: string;
    description: string;
    dateTime: Date;
}

interface TourItineraryProps {
    form: UseFormReturn<any>;
    itineraryFields: DivType[];
    itineraryAppend: (value: Partial<DivType>) => void;
    itineraryRemove: (index: number) => void;
    watchedItinerary: any[];
}

const TourItinerary: React.FC<TourItineraryProps> = ({
    form,
    itineraryFields,
    itineraryAppend,
    itineraryRemove,
    watchedItinerary
}) => {
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
                            onClick={() => itineraryAppend({
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

                    {itineraryFields && itineraryFields.length > 0 ? (
                        <div className="space-y-4">
                            {itineraryFields.map((_, index) => (
                                <Card key={index} className={cn(
                                    "border overflow-hidden transition-all",
                                    watchedItinerary[index]?.title ? "border-border" : "bg-secondary/50"
                                )}>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value={`item-${index}`} className="border-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70">
                                                <div className="flex items-center space-x-3 w-full">
                                                    <Badge variant={watchedItinerary[index]?.title ? "default" : "outline"}
                                                        className="rounded-full h-7 w-7 p-0 flex items-center justify-center font-medium">
                                                        {index + 1}
                                                    </Badge>
                                                    <div className="flex-1 flex items-center">
                                                        <span className="font-medium text-base">
                                                            {watchedItinerary[index]?.day || `Day ${index + 1}`}
                                                        </span>
                                                        {watchedItinerary[index]?.title && (
                                                            <>
                                                                <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                                                                <span className="text-muted-foreground truncate">
                                                                    {watchedItinerary[index]?.title}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            itineraryRemove(index);
                                                        }}
                                                        className="ml-auto h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Remove</span>
                                                    </Button>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-6 pt-2 border-t border-border">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.day`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Day Label</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="e.g. Day 1 - Arrival"
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
                                                            <FormItem className="flex flex-col">
                                                                <FormLabel>Date & Time</FormLabel>
                                                                <DateTimePicker
                                                                    value={field.value}
                                                                    onChange={(date) => field.onChange(date)}
                                                                />
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`itinerary.${index}.title`}
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-2">
                                                                <FormLabel>Activity Title</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="e.g. City Tour, Guided Museum Visit"
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
                                                            <FormItem className="md:col-span-2">
                                                                <FormLabel>Description</FormLabel>
                                                                <FormControl>
                                                                    <div className="prose min-h-[140px] max-w-full rounded-md border border-input">
                                                                        <Editor
                                                                            initialValue={(() => {
                                                                                try {
                                                                                    // If the field value is already JSON, parse it
                                                                                    if (field.value && field.value.startsWith('{')) {
                                                                                        return JSON.parse(field.value);
                                                                                    }
                                                                                    // If it's plain text or empty, create a default document
                                                                                    return field.value
                                                                                        ? {
                                                                                            type: "doc",
                                                                                            content: [{
                                                                                                type: "paragraph",
                                                                                                content: [{ type: "text", text: field.value }]
                                                                                            }]
                                                                                        }
                                                                                        : {
                                                                                            type: "doc",
                                                                                            content: [{
                                                                                                type: "paragraph",
                                                                                                content: [{ type: "text", text: "" }]
                                                                                            }]
                                                                                        };
                                                                                } catch (e) {
                                                                                    // Return default empty document on error
                                                                                    return {
                                                                                        type: "doc",
                                                                                        content: [{
                                                                                            type: "paragraph",
                                                                                            content: [{ type: "text", text: "" }]
                                                                                        }]
                                                                                    };
                                                                                }
                                                                            })()}
                                                                            onContentChange={(content) => {
                                                                                const contentString = JSON.stringify(content);
                                                                                form.setValue(`itinerary.${index}.description`, contentString, {
                                                                                    shouldDirty: true,
                                                                                    shouldTouch: true,
                                                                                    shouldValidate: true
                                                                                });
                                                                                field.onChange(contentString);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Describe the activities and schedule for this day
                                                                </p>
                                                            </FormItem>
                                                        )}
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
                                onClick={() => itineraryAppend({
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
                            name="map"
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
                                                    placeholder="State/Province"
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
                        {form.watch('map') && (
                            <div
                                className="absolute inset-0 w-full h-full"
                                dangerouslySetInnerHTML={{ __html: form.watch('map') || '' }}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TourItinerary;
