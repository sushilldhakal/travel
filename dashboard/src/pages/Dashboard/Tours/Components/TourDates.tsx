import React, { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, Clock, CalendarDays, CalendarRange, CalendarPlus, ArrowRight } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTourForm } from '@/Provider/hooks/useTourForm';
import { pricingOptions, TourDateMode, type Tour } from '@/Provider/types';

export function TourDates() {
    const { form } = useTourForm();

    const [dateType, setDateType] = useState<TourDateMode>('flexible');

    // Get pricing options from the form - check both nested and flat structure
    const pricingOptionsFromForm = form.watch('pricingOptions') || form.watch('pricing.pricingOptions') || [];

    return (
        <Card className="mb-6 shadow-sm border">
            <CardHeader className="bg-secondary/20 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle>Tour Dates</CardTitle>
                        <CardDescription>
                            Configure when your tour is available for booking
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="px-6 pt-2 border-b">
                <FormField
                    control={form.control}
                    name="dates.scheduleType"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                <DateTypeButton
                                    active={dateType === 'flexible'}
                                    onClick={() => {
                                        setDateType('flexible');
                                        field.onChange('flexible');
                                    }}
                                    icon={<CalendarDays className="h-4 w-4 mr-2" />}
                                    label="Flexible Dates"
                                    description="Tour with flexible start dates"
                                />

                                <DateTypeButton
                                    active={dateType === 'fixed'}
                                    onClick={() => {
                                        setDateType('fixed');
                                        field.onChange('fixed');
                                    }}
                                    icon={<CalendarRange className="h-4 w-4 mr-2" />}
                                    label="Fixed Date"
                                    description="Tour with a specific start date"
                                />

                                <DateTypeButton
                                    active={dateType === 'multiple'}
                                    onClick={() => {
                                        setDateType('multiple');
                                        field.onChange('multiple');
                                    }}
                                    icon={<CalendarPlus className="h-4 w-4 mr-2" />}
                                    label="Multiple Departures"
                                    description="Tour with multiple departure dates"
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <CardContent className="p-6">
                {dateType === 'flexible' && (
                    <FlexibleDateForm
                        pricingOptions={pricingOptionsFromForm}
                    />
                )}
                {dateType === 'fixed' && (
                    <FixedDepartureForm
                        pricingOptions={pricingOptionsFromForm}
                    />
                )}
                {dateType === 'multiple' && (
                    <MultipleDeparturesForm
                        pricingOptions={pricingOptionsFromForm}
                    />
                )}
            </CardContent>
        </Card>
    );
}

// Helper component for date type buttons
function DateTypeButton({
    active,
    onClick,
    icon,
    label,
    description
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <Button
            type="button"
            variant={active ? "default" : "outline"}
            className={`h-auto py-2 px-4 justify-start flex-col items-start text-left ${active ? "border-primary" : ""}`}
            onClick={onClick}
        >
            <div className="flex items-center w-full mb-1">
                {icon}
                <span className="font-medium">{label}</span>
                {active && <Badge variant="secondary" className="ml-auto scale-90">Selected</Badge>}
            </div>
            <p className="text-xs">
                {description}
            </p>
        </Button>
    );
}

/**
 * Typing utilities for safer form handling
 */

// Define a type for form field paths based on the Tour schema
// While this still requires an 'any' cast eventually, it documents our intent better
type TourFormFieldPath = 
  | `dates.${string}` 
  | `pricing.${string}` 
  | `dates.departures.${number}.${string}`
  | string; // Fallback for other dynamic paths

/**
 * Helper function to create type-safe form field paths
 * This approach allows us to handle deeply nested form fields while maintaining type safety
 * as much as possible with TypeScript's limitations for dynamic string paths
 */
function createFieldPathHelper(basePath: string) {
    return (fieldName: string): TourFormFieldPath => {
        // We use a more specific return type, but still need the any cast for the actual usage
        // This provides better documentation and intention without changing runtime behavior
        return `${basePath}.${fieldName}`;
    };
}

/**
 * Helper function to get typed form values from watch
 * This makes the form.watch calls more type-safe by explicitly casting the result
 * and handling undefined values with defaults
 */
function getWatchedValue<T>(form: UseFormReturn<Tour>, path: TourFormFieldPath, defaultValue?: T): T {
    // Still need the any cast for the path, but we can at least type the path parameter better
    return (form.watch(path as any) ?? defaultValue) as T;
}

function RecurringTourField({ basePath = 'dates' }: { basePath?: string }) {
    const { form } = useTourForm();
    
    // Create field path helper function for this component
    const fieldPath = createFieldPathHelper(basePath);
    
    // The field path for isRecurring
    const isRecurringPath = fieldPath('isRecurring');

    return (
        <>
            <FormField
                control={form.control}
                name={isRecurringPath as any}
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/5">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Recurring Tour</FormLabel>
                            <FormDescription>
                                Enable this option if the tour recurs at regular intervals.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {!!getWatchedValue(form, isRecurringPath, false) && (
                <RecurringPatternForm basePath={basePath} />
            )}
        </>
    );
}

// Common PricingCategorySelector component used across all date types
function PricingCategorySelector({
    basePath = 'dates',
    pricingOptions = []
}: {
    basePath?: string;
    pricingOptions: pricingOptions[];
}) {
    const { form } = useTourForm();
    // Create a field path helper for this component
    const fieldPath = createFieldPathHelper(basePath);
    const pricingCategoryPath = fieldPath('pricingCategory');

    return (
        <div className="p-4 bg-muted/10 rounded-lg border">
            <h3 className="text-sm font-medium flex items-center mb-4">
                <Badge className="h-4 w-4 mr-2 p-1" variant="outline">$</Badge>
                Pricing Assignment
            </h3>
            <FormField
                control={form.control}
                name={pricingCategoryPath as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pricing Category</FormLabel>
                        <Select
                            value={field.value || ''}
                            onValueChange={(value) => {
                                console.log('PricingCategorySelector - Selected value:', value);
                                console.log('PricingCategorySelector - Available options:', pricingOptions);
                                field.onChange(value);
                            }}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pricing category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-50">
                                {pricingOptions.length > 0 ? (
                                    pricingOptions.map((option, index) => {
                                        // Ensure we have a valid ID for the SelectItem
                                        const optionId = option.id || `option-${index}`;
                                        console.log(`Rendering SelectItem - ID: "${optionId}", Name: "${option.name}", Category: "${option.category}"`);
                                        return (
                                            <SelectItem 
                                                key={optionId} 
                                                value={optionId}
                                                onSelect={() => console.log(`SelectItem clicked: ${optionId}`)}
                                            >
                                                {option.name || 'Option'} - {option.category} - ${option.price}
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <>
                                        <SelectItem value="standard">
                                            <div className="flex items-center">
                                                <Badge variant="outline" className="mr-2">Standard</Badge>
                                                <span>Regular pricing</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="premium">
                                            <div className="flex items-center">
                                                <Badge variant="secondary" className="mr-2">Premium</Badge>
                                                <span>Enhanced pricing</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="vip">
                                            <div className="flex items-center">
                                                <Badge variant="default" className="mr-2">VIP</Badge>
                                                <span>Premium pricing</span>
                                            </div>
                                        </SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Associate this date with a specific pricing tier
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

function FlexibleDateForm({ pricingOptions = [] }: { pricingOptions: pricingOptions[] }) {
    const { form } = useTourForm();

    return (
        <div className="space-y-6">
            <div className="p-4 bg-muted/10 rounded-lg border">
                <h3 className="text-sm font-medium flex items-center mb-4">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Tour Duration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="dates.days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Days</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        value={field.value || ''}
                                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dates.nights"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nights</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...field}
                                        value={field.value || ''}
                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Use common recurring tour field */}
            <RecurringTourField />

            {/* Use common pricing category selector */}
            <PricingCategorySelector pricingOptions={pricingOptions} />
        </div>
    );
}

function FixedDepartureForm({ pricingOptions = [] }: { pricingOptions: pricingOptions[] }) {
    const { form } = useTourForm();
    const fieldPath = createFieldPathHelper('dates');
    const dateRangePath = fieldPath('dateRange'); // Using dateRange instead of fixedDateRange to match schema

    return (
        <div className="space-y-6">
            <div className="p-4 bg-muted/10 rounded-lg border">
                <h3 className="text-sm font-medium flex items-center mb-4">
                    <CalendarRange className="h-4 w-4 mr-2 text-primary" />
                    Fixed Departure Dates
                </h3>
                <FormField
                    control={form.control}
                    name={dateRangePath as any}
                    render={({ field }) => {
                        // Ensure we have a properly formatted date range value
                        const dateRangeValue = field.value || { from: undefined, to: undefined };
                        
                        return (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date Range</FormLabel>
                                <DatePickerWithRange
                                    // Use the correct prop names for DatePickerWithRange component
                                    date={dateRangeValue} 
                                    setDate={field.onChange}
                                    className="w-full"
                                />
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
            </div>

            {/* Use common recurring tour field */}
            <RecurringTourField />

            {/* Use common pricing category selector */}
            <PricingCategorySelector pricingOptions={pricingOptions} />
        </div>
    );
}

function MultipleDeparturesForm({ pricingOptions = [] }: { pricingOptions: pricingOptions[] }) {
    const { form } = useTourForm();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "dates.departures"
    });

    return (
        <div className="space-y-6">
            {fields.length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                    {fields.map((field, index) => (
                        <AccordionItem
                            key={field.id}
                            value={`departure-${index}`}
                            className="border rounded-lg overflow-hidden"
                        >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <CalendarPlus className="h-4 w-4 mr-2 text-primary" />
                                        <span className="font-medium">Departure {index + 1}</span>
                                    </div>
                                    {form.watch(`dates.departures.${index}.dateRange`) && (
                                        <Badge variant="outline" className="ml-auto mr-4">
                                            {new Date(form.watch(`dates.departures.${index}.dateRange.from`)).toLocaleDateString()}
                                            <ArrowRight className="h-3 w-3 mx-1" />
                                            {new Date(form.watch(`dates.departures.${index}.dateRange.to`)).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`dates.departures.${index}.dateRange`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date Range</FormLabel>
                                                <DatePickerWithRange
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className="w-full"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator className="my-4" />

                                    {/* Use common recurring tour field with proper basePath */}
                                    <RecurringTourField basePath={`dates.departures.${index}`} />

                                    <Separator className="my-4" />

                                    {/* Use common pricing category selector with proper basePath */}
                                    <PricingCategorySelector
                                        basePath={`dates.departures.${index}`}
                                        pricingOptions={pricingOptions}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <CalendarPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">No departures added</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add your first departure date range to get started</p>
                </div>
            )}

            <div className="mt-4 text-center">
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => append({
                        id: crypto.randomUUID(),
                        label: 'New Departure',
                        dateRange: {
                            from: new Date(),
                            to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        },
                        isRecurring: false,
                        selectedPricingOptions: [],
                        capacity: 10
                    })}
                    className="w-full"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Departure
                </Button>
            </div>
        </div>
    );
}

// Removed unused getIntervalDescription function

// Implementation of RecurringPatternForm with proper TypeScript type safety
function RecurringPatternForm({ basePath = 'dates' }: { basePath?: string }) {
    const { form } = useTourForm();
    
    // Create field path helper function for this component
    const fieldPath = createFieldPathHelper(basePath);
    
    // Define paths for recurring fields
    const recurrencePattern = fieldPath('recurrencePattern');
    const recurrenceInterval = fieldPath('recurrenceInterval');
    const recurrenceEndDate = fieldPath('recurrenceEndDate');
    
    // Get watched recurrence pattern to conditionally display relevant inputs
    const pattern = getWatchedValue<string>(form, recurrencePattern, 'daily');
    
    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/5 mt-4">
            <h3 className="text-lg font-medium">Recurring Pattern</h3>
            
            {/* Recurrence Pattern Selection */}
            <FormField
                control={form.control}
                name={recurrencePattern as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recurrence Pattern</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || 'daily'}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pattern" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />

            {/* Recurrence Interval Input */}
            <FormField
                control={form.control}
                name={recurrenceInterval as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recurrence Interval</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Enter interval"
                                value={field.value || 1}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                        </FormControl>
                        <FormDescription>
                            {pattern === 'daily' && 'Tour occurs every X days'}
                            {pattern === 'weekly' && 'Tour occurs every X weeks'}
                            {pattern === 'monthly' && 'Tour occurs every X months'}
                        </FormDescription>
                    </FormItem>
                )}
            />

            {/* Recurrence End Date */}
            <FormField
                control={form.control}
                name={recurrenceEndDate as any}
                render={({ field }) => {
                    // Ensure we properly handle the date value
                    const dateValue = field.value ? 
                        (field.value instanceof Date ? field.value : new Date(field.value)) : 
                        undefined;
                        
                    return (
                        <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                                <DateTimePicker
                                    value={dateValue}
                                    onChange={date => {
                                        // This ensures the DateTimePicker component works with the form field
                                        field.onChange(date);
                                    }}
                                    showTime={true}
                                />
                            </FormControl>
                            <FormDescription>
                                The date when recurring tours will stop being created
                            </FormDescription>
                        </FormItem>
                    );
                }}
            />
        </div>
    );
}