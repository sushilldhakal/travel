import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, DollarSign, Clock, RefreshCw, Lock, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PricingOption {
  id?: string;
  name: string;
  category: string;
  customCategory?: string;
  price: number;
  discountEnabled: boolean;
  discountPrice: number;
  discountDateRange?: DateRange;
  paxRange: [number, number];
}

interface DateRangeItem {
  id?: string;
  label: string;
  dateRange?: DateRange;
  selectedPricingOptions: string[];
  isRecurring?: boolean;
  recurrencePattern?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  recurrenceEndDate?: Date;
  priceLockedUntil?: Date;
}

interface TourPricingDatesProps {
  form: UseFormReturn<any>;
}

const TourPricingDates = ({ form }: TourPricingDatesProps) => {
  const { fields: pricingFields, append: pricingAppend, remove: pricingRemove } = useFieldArray({
    control: form.control,
    name: "pricingOptions",
  });
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>(undefined);
  const watchedPricing = form.watch('pricingOptions') || [];
  const watchedPricePerType = form.watch('pricePerType');
  const watchedPricingOptionsEnabled = form.watch('pricingOptionsEnabled');
  const watchedTourDatesRange = form.watch('tourDates.dateRange');
  const watchedIsRecurring = form.watch('tourDates.isRecurring');

  // Auto-calculate days and nights when date range changes for Non Fixed Departure
  useEffect(() => {
    if (watchedTourDatesRange?.from && watchedTourDatesRange?.to) {
      const startDate = new Date(watchedTourDatesRange.from);
      const endDate = new Date(watchedTourDatesRange.to);

      // Calculate the difference in days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Set days (including start and end date)
      form.setValue('tourDates.days', diffDays + 1);

      // Set nights (one less than days)
      form.setValue('tourDates.nights', diffDays);
    }
  }, [watchedTourDatesRange, form]);

  const addPricingOption = () => {
    pricingAppend({
      name: '',
      category: 'adult',
      customCategory: '',
      price: 0,
      discountEnabled: false,
      discountPrice: 0,
      discountDateRange: undefined,
      paxRange: [1, 1]
    });
  };

  const removePricingOption = (index: number) => {
    pricingRemove(index);
  };

  const addDateRange = () => {
    const currentDateRanges = form.getValues('dateRanges') || [];
    form.setValue('dateRanges', [
      ...currentDateRanges,
      {
        id: Date.now().toString(),
        label: `Date Range ${currentDateRanges.length + 1}`,
        dateRange: {
          from: new Date(),
          to: new Date(new Date().setDate(new Date().getDate() + 7))
        },
        selectedPricingOptions: []
      }
    ]);
  };

  const removeDateRange = (index: number) => {
    const currentDateRanges = form.getValues('dateRanges') || [];
    const updatedDateRanges = [...currentDateRanges];
    updatedDateRanges.splice(index, 1);
    form.setValue('dateRanges', updatedDateRanges);
  };

  const handleDateChange = (range: DateRange) => {
    setSelectedDateRange(range);
    form.setValue('dates.startDate', range.from);
    form.setValue('dates.endDate', range.to);
  };

  const watchedDateRanges = form.watch('dateRanges') || [];
  const watchedFixedDeparture = form.watch('fixedDeparture');
  const watchedMultipleDates = form.watch('multipleDates');

  return (
    <div id="pricing" className="space-y-8">
      {/* Pricing Section */}
      <Card className="shadow-sm">
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
              name="pricePerType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Price per</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="person" id="person" />
                        <label htmlFor="person" className="cursor-pointer">Person</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="group" />
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

            {watchedPricePerType === 'group' && (
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
              name="basePrice"
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
              name="discountEnabled"
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

            {form.watch('discountEnabled') && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="discountPrice"
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
                          step={0.01}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountDateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Discount Period</FormLabel>
                      <DatePickerWithRange
                        date={field.value}
                        setDate={(date) => field.onChange(date)}
                        className="w-full"
                      />
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Select when this discount will start and end. If no date range is selected it will assume that the discount will applies with entire range of dates when this tour is available.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Pricing Options</h3>

              </div>

              <FormField
                control={form.control}
                name="pricingOptionsEnabled"
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
              {watchedPricingOptionsEnabled && (
                <div className="space-y-4 mt-4">
                  {pricingFields.length > 0 ? (
                    pricingFields.map((field, index) => (
                      <Accordion
                        type="single"
                        collapsible
                        key={field.id}
                        defaultValue={`item-${index}`}
                        className="border rounded-md"
                      >
                        <AccordionItem value={`item-${index}`} className="border-none">
                          <AccordionTrigger className="px-4 py-2 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <span className="font-medium">
                                  {watchedPricing[index]?.name || `Option ${index + 1}`}
                                </span>
                                {watchedPricing[index]?.category && (
                                  <Badge variant="outline" className="ml-2">
                                    {watchedPricing[index]?.category === 'custom'
                                      ? watchedPricing[index]?.customCategory
                                      : watchedPricing[index]?.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge>
                                  ${watchedPricing[index]?.price || 0}
                                </Badge>
                                {watchedPricing[index]?.discountEnabled && (
                                  <Badge variant="secondary">
                                    Discount: ${watchedPricing[index]?.discountPrice || 0}
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

                              {watchedPricing[index]?.category === 'custom' && (
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
                                        step={0.01}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`pricingOptions.${index}.discountEnabled`}
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

                              {watchedPricing[index]?.discountEnabled && (
                                <div className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name={`pricingOptions.${index}.discountPrice`}
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
                                            step={0.01}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`pricingOptions.${index}.discountDateRange`}
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Discount Period</FormLabel>
                                        <DatePickerWithRange
                                          date={field.value}
                                          setDate={(date) => field.onChange(date)}
                                          className="w-full"
                                        />
                                        <FormMessage />
                                        <p className="text-sm text-muted-foreground">
                                          Select when this discount will start and end
                                        </p>
                                      </FormItem>
                                    )}
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
                    ))
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

      {/* Recurring Tour Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="tourDates.isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Recurring Tour
                  </FormLabel>
                  <FormDescription>
                    Enable to set up automatic recurring dates
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

          {watchedIsRecurring && (
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="tourDates.recurrencePattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tourDates.recurrenceEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date (runs indefinitely)</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Lock Section */}
      <Collapsible className="mb-6 rounded-lg border">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span className="font-medium">Price Lock Settings</span>
          </div>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 space-y-4">
          <FormField
            control={form.control}
            name="tourDates.priceLockedUntil"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Lock Prices Until</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>No lock date set</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Optional - Prices will remain fixed until this date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Dates Section */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-secondary pb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold">Tour Dates</CardTitle>
          </div>
          <CardDescription>
            Configure when your tour is available and schedule departure dates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="fixedDeparture"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Fixed Departure Dates</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Tours with scheduled, specific departure dates
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

            {!watchedFixedDeparture && (
              <div className="space-y-6 mt-2 p-4 border rounded-md">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Non-Fixed Departure</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tourDates.days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value !== undefined ? field.value.toString() : ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tourDates.nights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nights</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value !== undefined ? field.value.toString() : ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="tourDates.dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date Range</FormLabel>
                        <DatePickerWithRange
                          date={field.value}
                          setDate={(date) => {
                            field.onChange(date);
                            // The useEffect will handle calculation of days/nights
                          }}
                          className="w-full"
                        />
                        <FormMessage />
                        <p className="text-xs text-muted-foreground mt-1">
                          Days and nights will be calculated automatically
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {watchedFixedDeparture && (
              <div className="space-y-6">
                <div className="space-y-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="multipleDates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Multiple Date Ranges</FormLabel>
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

                  {!watchedMultipleDates && (
                    <div className="pt-4">
                      <FormField
                        control={form.control}
                        name="fixedDate.dateRange"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date Range</FormLabel>
                            <DatePickerWithRange
                              date={field.value}
                              setDate={(date) => field.onChange(date)}
                              className="w-full"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {watchedMultipleDates && (
                  <div className="space-y-4">
                    <Button type="button" onClick={addDateRange} variant="outline" className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Date Range
                    </Button>

                    {watchedDateRanges.map((dateRange, index) => (
                      <Accordion key={dateRange.id || index} type="single" collapsible className="border rounded-md">
                        <AccordionItem value={`date-${index}`} className="border-none">
                          <AccordionTrigger className="px-4 py-2 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{dateRange.label || `Date Range ${index + 1}`}</span>
                              {dateRange.dateRange?.from && dateRange.dateRange?.to && (
                                <Badge variant="outline" className="ml-2">
                                  {new Date(dateRange.dateRange.from).toLocaleDateString()} - {new Date(dateRange.dateRange.to).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-1">
                            <div className="grid gap-4">
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => removeDateRange(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              <FormField
                                control={form.control}
                                name={`dateRanges.${index}.label`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="pt-2">
                                <FormField
                                  control={form.control}
                                  name={`dateRanges.${index}.dateRange`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel>Date Range</FormLabel>
                                      <DatePickerWithRange
                                        date={field.value}
                                        setDate={(date) => field.onChange(date)}
                                        className="w-full"
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`dateRanges.${index}.isRecurring`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Is Recurring</FormLabel>
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

                              {watchedDateRanges[index]?.isRecurring && (
                                <div className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name={`dateRanges.${index}.recurrencePattern`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Recurrence Pattern</FormLabel>
                                        <FormControl>
                                          <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select a recurrence pattern" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="weekly">Weekly</SelectItem>
                                              <SelectItem value="biweekly">Biweekly</SelectItem>
                                              <SelectItem value="monthly">Monthly</SelectItem>
                                              <SelectItem value="quarterly">Quarterly</SelectItem>
                                              <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`dateRanges.${index}.recurrenceEndDate`}
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Recurrence End Date</FormLabel>
                                        <DatePickerWithRange
                                          date={field.value}
                                          setDate={(date) => field.onChange(date)}
                                          className="w-full"
                                        />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}

                              <FormField
                                control={form.control}
                                name={`dateRanges.${index}.priceLockedUntil`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Price Locked Until</FormLabel>
                                    <DatePickerWithRange
                                      date={field.value}
                                      setDate={(date) => field.onChange(date)}
                                      className="w-full"
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`dateRanges.${index}.selectedPricingOptions`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Linked Pricing Options</FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => {
                                          const currentOptions = field.value || [];
                                          if (currentOptions.includes(value)) {
                                            field.onChange(currentOptions.filter(option => option !== value));
                                          } else {
                                            field.onChange([...currentOptions, value]);
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select pricing options" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {watchedPricing && Array.isArray(watchedPricing) && watchedPricing.map((option, idx) => (
                                            <SelectItem
                                              key={idx}
                                              value={option.name || `Option ${idx + 1}`}
                                            >
                                              {option.name || `Option ${idx + 1}`}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {field.value && field.value.map((option, idx) => (
                                        <Badge key={idx} variant="secondary" className="gap-1">
                                          {option}
                                          <button
                                            type="button"
                                            className="ml-1 h-4 w-4 rounded-full text-xs"
                                            onClick={() => {
                                              field.onChange(field.value.filter((_, i) => i !== idx));
                                            }}
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Separator className="my-2" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourPricingDates;