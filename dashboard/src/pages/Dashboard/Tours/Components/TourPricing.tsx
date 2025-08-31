import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, DollarSign, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateTimePickerSimple } from '@/components/ui/DateTimePickerSimple';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { pricingOptions } from '@/Provider/types';
import { useTourForm } from '@/Provider/hooks/useTourForm';

export function TourPricing() {

    const {
        form,
        pricingOptionsFields: externalPricingFields,
        pricingOptionsAppend: externalPricingAppend,
        pricingOptionsRemove: externalPricingRemove,
    } = useTourForm();

    const watchedPricing = useMemo(() => {
        const pricing = form.watch('pricing.pricingOptions') as pricingOptions[];
        return Array.isArray(pricing) ? pricing.map((p, idx) => ({
            ...p,
            id: idx.toString(), // Adding id for compatibility with field components
            discount: {
                ...(p.discount || {}),
                enabled: p.discount?.enabled || false,
                options: p.discount?.options || [{
                    dateRange: { from: undefined, to: undefined }
                }]
            },
            paxRange: p.paxRange || [1, 10],
        })) : [];
    }, [form,]);


    // Use watchedPricing directly instead of actualWatchedPricing
    const actualWatchedPricing = watchedPricing;

    const watchedPricePerPerson = form.watch('pricing.pricePerPerson');

    // Use the pricing fields from the form context
    const pricingFields = externalPricingFields;
    const pricingAppend = externalPricingAppend;
    const pricingRemove = externalPricingRemove;




    const addPricingOption = () => {
        const newPricingOption: pricingOptions = {
            id: Date.now().toString(),
            name: `Option ${(pricingFields?.length || 0) + 1}`,
            category: 'adult',
            customCategory: '',
            price: 0,
            discount: {
                enabled: false,
                options: [{
                    isActive: false,
                    percentageOrPrice: false,
                    percentage: 0,
                    discountPrice: 0,
                    description: '',
                    discountCode: '',
                    maxDiscountAmount: 0,
                    dateRange: {
                        from: new Date().toISOString(),
                        to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                }]
            },
            paxRange: [1, 10]
        };

        if (pricingAppend) {
            pricingAppend(newPricingOption);
        }
    };

    const removePricingOption = (index: number) => {
        pricingRemove?.(index);
    };
    return (
        <div>
            <Card className="shadow-xs">
                <CardHeader className="border-b bg-secondary pb-6">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">Pricing</CardTitle>
                    </div>
                    <CardDescription>
                        Set up tour pricing options and categories
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="pricing.pricePerPerson"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Price per</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(value === 'true')}
                                            value={field.value.toString()}
                                            className="flex flex-row space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="person" />
                                                <label htmlFor="person" className="cursor-pointer">Person</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="group" />
                                                <label htmlFor="group" className="cursor-pointer">Group</label>
                                            </div>
                                        </RadioGroup>

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="minSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum people for this tour</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            min={1}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is the minimum number of people required for this tour to proceed. If group of people want to do this tour by them only.
                                    </p>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum people for this tour</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            min={1}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum number of people to operate this tour. Once this number is reached this tour will no longer be availebal to book for the particular date range.
                                    </p>
                                </FormItem>
                            )}
                        />

                        {watchedPricePerPerson === false && (
                            <FormField
                                control={form.control}
                                name="groupSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Size</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                min={1}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price per person</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            min={0}
                                            step={0.01}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pricing.discount.discountEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Apply Discount</FormLabel>
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

                        {form.watch('pricing.discount.discountEnabled') && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pricing.discount.discountPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Price per person</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value !== undefined ? field.value.toString() : ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    step={1.00}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pricing.discount.dateRange"
                                    render={({ field }) => {
                                        const dateValue = field.value ? {
                                            from: field.value.from ? new Date(field.value.from) : undefined,
                                            to: field.value.to ? new Date(field.value.to) : undefined
                                        } : { from: undefined, to: undefined };


                                        return (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Discount Period</FormLabel>
                                                <DatePickerWithRange
                                                    date={dateValue}
                                                    setDate={(date) => {
                                                        field.onChange({
                                                            from: date?.from?.toISOString(),
                                                            to: date?.to?.toISOString()
                                                        });
                                                    }}
                                                    className="w-full"
                                                />
                                                <FormMessage />
                                                <p className="text-xs text-muted-foreground">
                                                    Select when this discount will start and end. If no date range is selected it will assume that the discount will applies with entire range of dates when this tour is available.
                                                </p>
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Pricing Options</h3>

                            </div>

                            <FormField
                                control={form.control}
                                name="pricing.pricingOptionsEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between mb-4 p-3 border rounded-md bg-muted/20">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Enable Advanced Pricing</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Define different pricing categories based on factors like accommodation type or service level
                                            </p>
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
                            <div className="space-y-4">
                                <Button type="button" onClick={addPricingOption} variant="outline" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Pricing Option
                                </Button>

                            </div>
                            {watchedPricing && (
                                <div className="space-y-4 mt-4">
                                    {pricingFields?.length && pricingFields.length > 0 ? (
                                        pricingFields.map((field, index) => {
                                            const watchedDiscountEnabled = form.watch(`pricingOptions.${index}.discount.discountEnabled` as any);
                                            const currentPricing = form.watch(`pricingOptions.${index}`);
                                            const fieldId = field?.id || index.toString();
                                            return (
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    key={fieldId}
                                                    defaultValue={`item-${index}`}
                                                    className="border rounded-md"
                                                >
                                                    <AccordionItem value={`item-${index}`} className="border-none">
                                                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium">
                                                                        {currentPricing?.name || `Option ${index + 1}`}
                                                                    </span>
                                                                    {currentPricing?.category && (
                                                                        <Badge variant="outline" className="ml-2">
                                                                            {currentPricing.category === 'custom'
                                                                                ? currentPricing.customCategory
                                                                                : currentPricing.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge>
                                                                        ${currentPricing?.price || 0}
                                                                    </Badge>
                                                                    {currentPricing?.discount?.enabled && (
                                                                        <Badge variant="secondary">
                                                                            Discount Available
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pb-4 pt-1">
                                                            <div className="grid gap-4">
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => removePricingOption(index)}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>

                                                                <FormField
                                                                    control={form.control}
                                                                    name={`pricingOptions.${index}.name`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Name</FormLabel>
                                                                            <FormControl>
                                                                                <Input {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={form.control}
                                                                    name={`pricingOptions.${index}.category`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Category</FormLabel>
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                defaultValue={field.value}
                                                                            >
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select a category" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="adult">Adult</SelectItem>
                                                                                    <SelectItem value="child">Child</SelectItem>
                                                                                    <SelectItem value="senior">Senior</SelectItem>
                                                                                    <SelectItem value="student">Student</SelectItem>
                                                                                    <SelectItem value="custom">Custom</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {actualWatchedPricing[index]?.category === 'custom' && (
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`pricingOptions.${index}.customCategory`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Custom Category</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                )}

                                                                <FormField
                                                                    control={form.control}
                                                                    name={`pricingOptions.${index}.price`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Price</FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    value={field.value !== undefined ? field.value.toString() : ''}
                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                    min={0}
                                                                                    step={1.00}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={form.control}
                                                                    name={`pricingOptions.${index}.discount.discountEnabled` as any}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                                            <div className="space-y-0.5">
                                                                                <FormLabel className="text-base">Apply Discount</FormLabel>
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

                                                                {watchedDiscountEnabled && (
                                                                    <div className="space-y-4">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`pricingOptions.${index}.discount.percentageOrPrice` as any}
                                                                            render={({ field }) => (
                                                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                                                                                    <div className="space-y-0.5">
                                                                                        <FormLabel className="text-base">Discount Type</FormLabel>
                                                                                        <FormDescription>
                                                                                            {field.value ? 'Percentage' : 'Fixed Price'}
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
                                                                        
                                                                        {form.watch(`pricingOptions.${index}.discount.percentageOrPrice` as any) ? (
                                                                            <>
                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`pricingOptions.${index}.discount.discountPercentage` as any}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel>Discount Percentage (%)</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    {...field}
                                                                                                    value={field.value !== undefined ? field.value.toString() : ''}
                                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                                    min={0}
                                                                                                    max={100}
                                                                                                    step={0.01}
                                                                                                />
                                                                                            </FormControl>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`pricingOptions.${index}.discount.maxDiscountAmount` as any}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel>Max Discount Amount (optional)</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    {...field}
                                                                                                    value={field.value !== undefined ? field.value.toString() : ''}
                                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                                    min={0}
                                                                                                    step={1.00}
                                                                                                />
                                                                                            </FormControl>
                                                                                            <FormDescription>
                                                                                                Cap the maximum discount amount regardless of percentage
                                                                                            </FormDescription>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`pricingOptions.${index}.discount.discountPrice` as any}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>Discount Price</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                {...field}
                                                                                                value={field.value !== undefined ? field.value.toString() : ''}
                                                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                                min={0}
                                                                                                step={1.00}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        )}

                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`pricingOptions.${index}.discount.dateRange` as any}
                                                                            render={({ field }) => {
                                                                                // Parse the date values or use defaults
                                                                                const dateValue = {
                                                                                    from: field.value?.from ? new Date(field.value.from) : undefined,
                                                                                    to: field.value?.to ? new Date(field.value.to) : undefined
                                                                                };

                                                                                return (
                                                                                    <FormItem className="flex flex-col">
                                                                                        <FormLabel>Discount Period</FormLabel>
                                                                                        <DatePickerWithRange
                                                                                            date={dateValue}
                                                                                            setDate={(date) => {
                                                                                                field.onChange({
                                                                                                    from: date?.from?.toISOString(),
                                                                                                    to: date?.to?.toISOString()
                                                                                                });
                                                                                            }}
                                                                                            className="w-full"
                                                                                        />
                                                                                        <FormMessage />
                                                                                        <p className="text-sm text-muted-foreground">
                                                                                            Select when this discount will start and end
                                                                                        </p>
                                                                                    </FormItem>
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`pricingOptions.${index}.paxRange.0`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Min Pax</FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        {...field}
                                                                                        value={field.value !== undefined ? field.value.toString() : ''}
                                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                                                        min={1}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`pricingOptions.${index}.paxRange.1`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Max Pax</FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        {...field}
                                                                                        value={field.value !== undefined ? field.value.toString() : ''}
                                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                                                        min={1}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                <DollarSign className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">No pricing options defined</h3>
                                            <p className="text-muted-foreground max-w-md mb-4">
                                                Add pricing options to create different tiers or categories for your tour
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={addPricingOption}
                                                size="sm"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                Add First Pricing Option
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Price Lock Section */}
            <div className="mb-6 rounded-lg border">
                <div className="flex w-full items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Price Lock Settings</span>
                    </div>
                </div>
                <div className="p-4 pt-0 space-y-4">
                    <FormField
                        control={form.control}
                        name="pricing.priceLockedUntil"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Lock Prices Until</FormLabel>
                                <FormControl>
                                    <DateTimePickerSimple
                                        value={field.value ? field.value.toISOString() : undefined}
                                        onChange={(value) => field.onChange(value ? new Date(value) : undefined)}
                                        placeholder="Pick a date and time"
                                        disabled={false}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Optional - Prices will remain fixed until this date. This is useful for tours that have a fixed price for a certain period.<br />
                                    Tour booking wont be shown to user after this date.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}