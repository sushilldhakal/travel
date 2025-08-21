import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FactData } from '@/Provider/types';
import { Plus, Info, Trash2, FileText, Award, Clock, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useTourForm } from '@/Provider/hooks/useTourContext';
import { useFacts } from '../FACTS/useFacts';
import { getUserId } from '@/util/authUtils';
import Icon from '@/userDefinedComponents/Icon';


const TourFacts = () => {
    // State to keep track of selected facts for each row
    const [selectedFact, setSelectedFact] = useState<Record<number, FactData | undefined>>({});

    const { form, factsAppend, factsRemove, factsFields } = useTourForm();
    const watchedFacts = form.watch('facts');
    const userId = getUserId();
    const { data: facts } = useFacts(userId);

    // Auto-populate selectedFact state when facts are loaded during edit mode
    useMemo(() => {
        if (Array.isArray(watchedFacts) && Array.isArray(facts) && facts.length > 0 && watchedFacts.length > 0) {
            const newSelectedFacts: Record<number, FactData | undefined> = {};

            watchedFacts.forEach((watchedFact, index) => {
                if (watchedFact?.title) {
                    // Try exact match first
                    let foundFact = facts.find((f) => f.name === watchedFact.title);

                    // If no exact match, try removing the suffix (e.g., "Tour Availability-10" -> "Tour Availability")
                    if (!foundFact && watchedFact.title && watchedFact.title.includes('-')) {
                        const baseName = watchedFact.title.split('-').slice(0, -1).join('-');
                        foundFact = facts.find((f) => f.name === baseName);
                    }

                    // If still no match, try partial match
                    if (!foundFact && watchedFact.title) {
                        foundFact = facts.find((f) =>
                            f.name.toLowerCase().includes(watchedFact.title!.toLowerCase()) ||
                            watchedFact.title!.toLowerCase().includes(f.name.toLowerCase())
                        );
                    }

                    if (foundFact) {
                        newSelectedFacts[index] = foundFact;
                    }
                }
            });

            // Only update if we found some facts to link and selectedFact is empty
            if (Object.keys(newSelectedFacts).length > 0 && Object.keys(selectedFact).length === 0) {
                setSelectedFact(newSelectedFacts);
            }
        }
        return null;
    }, [watchedFacts, facts, selectedFact]);



    // Helper function to get an icon for a fact
    const getFactIcon = (fact: any) => {
        const iconName = fact?.icon || '';
        switch (iconName) {
            case 'clock':
                return <Clock className="h-4 w-4" />;
            case 'award':
                return <Award className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    // Initialize selectedFact from watchedFacts when component mounts or watchedFacts changes
    useEffect(() => {
        if (Array.isArray(watchedFacts) && watchedFacts.length > 0) {
            const initialSelectedFacts: Record<number, FactData | undefined> = {};

            watchedFacts.forEach((fact, idx) => {
                if (fact && fact.title) {
                    // Find the matching fact from the facts array
                    const matchingFact = facts && Array.isArray(facts) ? facts.find(f => f.name === fact.title) : undefined;
                    if (matchingFact) {
                        initialSelectedFacts[idx] = matchingFact;
                    }
                }
            });

            setSelectedFact(initialSelectedFacts);
        }
    }, [watchedFacts, facts]);

    const handleFactSelect = (fact: FactData | undefined, index: number) => {
        if (fact) {
            setSelectedFact({ ...selectedFact, [index]: fact });
            // Make sure we still set the field_type and icon
            form.setValue(`facts.${index}.field_type`, fact.field_type as 'Plain Text' | 'Single Select' | 'Multi Select' || 'Plain Text');
            form.setValue(`facts.${index}.icon`, fact.icon || '');
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-secondary border-b pb-6">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Tour Facts</CardTitle>
                </div>
                <CardDescription>
                    Add important details and specifications about the tour
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-md font-medium">Facts & Specifications</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => factsAppend?.({
                            title: '',
                            value: '',
                            field_type: 'Plain Text',
                            icon: ''
                        })}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Fact</span>
                    </Button>
                </div>

                {/* Show facts if we have watchedFacts (edit mode) or factsFields (create mode) */}
                {((Array.isArray(watchedFacts) && watchedFacts.length > 0) || (Array.isArray(factsFields) && factsFields.length > 0)) ? (
                    <div className="space-y-4">
                        {/* Use watchedFacts in edit mode, factsFields in create mode */}
                        {(Array.isArray(watchedFacts) && watchedFacts.length > 0 ? watchedFacts : (factsFields || []))?.map((field, index) => {
                            // Check if the fact has actual content - check for title, field_type, or value
                            const currentFact = Array.isArray(watchedFacts) ? watchedFacts[index] : null;
                            const hasFact = currentFact && (
                                currentFact.title ||
                                currentFact.field_type ||
                                (currentFact.value && (
                                    (Array.isArray(currentFact.value) && currentFact.value.length > 0) ||
                                    (typeof currentFact.value === 'string' && currentFact.value.trim() !== '')
                                ))
                            );

                            return (
                                <Card key={`fact-card-${index}`} className={cn(
                                    "border overflow-hidden transition-all",
                                    hasFact ? "border-border" : "bg-secondary/50"
                                )}>
                                    {/* Only show accordion if field has been initialized OR the user wants to create a new fact */}
                                    {hasFact ? (
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value={`item-${index}`} className="border-none">
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70">
                                                    <div className="flex items-center space-x-3 w-full">
                                                        <Badge variant="default"
                                                            className="rounded-md h-7 w-7 p-0 flex items-center justify-center font-medium">
                                                            {/* {getFactIcon(currentFact)} */}

                                                            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                                <Icon name={currentFact.icon || ''} size={20} />
                                                            </div>
                                                        </Badge>
                                                        <div className="flex-1 font-medium text-base">
                                                            {currentFact?.title || `Fact ${index + 1}`}
                                                        </div>
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Update selectedFact by removing the entry for this index
                                                                setSelectedFact(prev => {
                                                                    const updated = { ...prev };
                                                                    delete updated[index];
                                                                    return updated;
                                                                });
                                                                factsRemove?.(index);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.stopPropagation();
                                                                    // Update selectedFact by removing the entry for this index
                                                                    setSelectedFact(prev => {
                                                                        const updated = { ...prev };
                                                                        delete updated[index];
                                                                        return updated;
                                                                    });
                                                                    factsRemove?.(index);
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
                                                    <div className="grid grid-cols-1 gap-5 mt-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`facts.${index}.title`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Fact Name</FormLabel>
                                                                    <FormControl>
                                                                        <Select
                                                                            value={field.value}
                                                                            onValueChange={(value) => {
                                                                                field.onChange(value);
                                                                                // Extract just the name part from our composite value (name-index)
                                                                                const factName = value.split('-').slice(0, -1).join('-');

                                                                                // Find the selected fact from the facts array
                                                                                const foundFact = facts && Array.isArray(facts)
                                                                                    ? facts.find((f) => f.name === factName)
                                                                                    : undefined;
                                                                                setSelectedFact({ ...selectedFact, [index]: foundFact });

                                                                                // Make sure we still set the field_type and icon
                                                                                if (foundFact) {
                                                                                    form.setValue(`facts.${index}.field_type`, foundFact.field_type as 'Plain Text' | 'Single Select' | 'Multi Select' || 'Plain Text');
                                                                                    form.setValue(`facts.${index}.icon`, foundFact.icon || '');
                                                                                }
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue placeholder="Select a fact" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {Array.isArray(facts) && facts.length > 0 ? facts.map((fact, factIndex) => (
                                                                                    <SelectItem
                                                                                        key={`fact-${fact.name}-${factIndex}`}
                                                                                        value={`${fact.name}-${factIndex}`}
                                                                                    >
                                                                                        {fact.name}
                                                                                    </SelectItem>
                                                                                )) : (
                                                                                    <SelectItem value="no-facts" disabled>No facts available</SelectItem>
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`facts.${index}.field_type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Field Type</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            disabled
                                                                            placeholder="Field type is set automatically"
                                                                            className="bg-secondary/30"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        {selectedFact && Array.isArray(watchedFacts) && watchedFacts[index]?.field_type === 'Plain Text' && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`facts.${index}.value`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Fact Details</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                value={Array.isArray(field.value) && field.value.length > 0 ?
                                                                                    (typeof field.value[0] === 'string' ? field.value[0] : '') : ''}
                                                                                onChange={(e) => {
                                                                                    // Store as array with single item
                                                                                    field.onChange([e.target.value]);
                                                                                }}
                                                                                placeholder={`Enter ${selectedFact[index]?.name || 'Fact Details'}`}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        {Array.isArray(watchedFacts) && watchedFacts[index]?.field_type === 'Single Select' && selectedFact[index] && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`facts.${index}.value`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Fact Details</FormLabel>
                                                                        <FormControl>
                                                                            <Select
                                                                                value={Array.isArray(field.value) && field.value.length > 0 ?
                                                                                    (typeof field.value[0] === 'string'
                                                                                        ? field.value[0]
                                                                                        : (field.value[0] && typeof field.value[0] === 'object' && 'value' in field.value[0]
                                                                                            ? field.value[0].value
                                                                                            : ''))
                                                                                    : ''}
                                                                                onValueChange={(value) => {
                                                                                    // Store as array with single item
                                                                                    field.onChange([value]);

                                                                                }}


                                                                            >
                                                                                <SelectTrigger className="w-full">
                                                                                    <SelectValue placeholder="Select an option" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {Array.isArray(selectedFact[index]?.value) &&
                                                                                        selectedFact[index]?.value.map((option, idx: number) => {
                                                                                            // Handle both string and object types
                                                                                            const optionValue = typeof option === 'string'
                                                                                                ? option
                                                                                                : option.value;
                                                                                            const optionLabel = typeof option === 'string'
                                                                                                ? option
                                                                                                : option.label;

                                                                                            return (
                                                                                                <SelectItem key={idx} value={String(optionValue)}>
                                                                                                    {String(optionLabel)}
                                                                                                </SelectItem>
                                                                                            );
                                                                                        })}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        {Array.isArray(watchedFacts) && watchedFacts[index]?.field_type === 'Multi Select' && selectedFact[index] && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`facts.${index}.value`}
                                                                render={({ field }) => {
                                                                    // Extract current field value and handle nested arrays
                                                                    let fieldValue: Array<{ label: string; value: string }> = [];
                                                                    if (Array.isArray(field.value)) {
                                                                        if (field.value.length > 0 && typeof field.value[0] === 'object') {
                                                                            // It's an array of objects
                                                                            fieldValue = field.value as Array<{ label: string; value: string }>;
                                                                        } else if (field.value.length > 0 && Array.isArray(field.value[0])) {
                                                                            // It's a nested array, extract the inner array
                                                                            fieldValue = field.value[0] as Array<{ label: string; value: string }>;
                                                                        }
                                                                    }
                                                                    // Map our string array to object format needed by MultiSelect
                                                                    const optionsMulti = Array.isArray(selectedFact[index]?.value)
                                                                        ? selectedFact[index]?.value.map((option: string | { label: string; value: string }) => {
                                                                            if (typeof option === 'string') {
                                                                                return {
                                                                                    value: option,
                                                                                    label: option,
                                                                                };
                                                                            }
                                                                            // If it's already an object with label/value, return it as is
                                                                            return option;
                                                                        })
                                                                        : [];

                                                                    // Format current values to match MultiSelect expected format
                                                                    const currentValues = (Array.isArray(fieldValue) ?
                                                                        fieldValue.map(val => {
                                                                            // Handle different possible formats
                                                                            if (typeof val === 'string') {
                                                                                return { value: val, label: val };
                                                                            } else if (val && typeof val === 'object' && 'value' in val) {
                                                                                return val;
                                                                            }
                                                                            return null;
                                                                        }).filter(Boolean) : []) as { label: string; value: string }[];

                                                                    return (
                                                                        <FormItem>
                                                                            <FormLabel>Fact Details</FormLabel>
                                                                            <FormControl>
                                                                                <MultiSelect
                                                                                    options={optionsMulti}
                                                                                    value={currentValues}
                                                                                    onValueChange={(selectedValues) => {
                                                                                        // Store as a flat array, not nested
                                                                                        field.onChange(selectedValues);
                                                                                    }}
                                                                                    placeholder="Select options"
                                                                                    className="w-full"
                                                                                    maxDisplayValues={10}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ) : (
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Badge variant="outline"
                                                    className="rounded-md h-7 w-7 p-0 flex items-center justify-center font-medium">
                                                    <FileText className="h-4 w-4" />
                                                </Badge>
                                                <div className="flex-1 font-medium text-base text-muted-foreground">
                                                    New Fact
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`facts.${index}.title`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        const factName = value.split('-').slice(0, -1).join('-');
                                                                        const foundFact = facts && Array.isArray(facts)
                                                                            ? facts.find((f) => f.name === factName)
                                                                            : undefined;
                                                                        handleFactSelect(foundFact, index);
                                                                    }}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <SelectTrigger className="w-[220px]">
                                                                        <SelectValue placeholder="Select a fact" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.isArray(facts) && facts.length > 0 ? facts.map((fact, factIndex) => (
                                                                            <SelectItem
                                                                                key={`fact-${fact.name}-${factIndex}`}
                                                                                value={`${fact.name}-${factIndex}`}
                                                                            >
                                                                                {fact.name}
                                                                            </SelectItem>
                                                                        )) : (
                                                                            <SelectItem disabled value="no-facts">No facts available</SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        factsRemove?.(index);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.stopPropagation();
                                                            factsRemove?.(index);
                                                        }
                                                    }}
                                                    className="h-10 w-10 p-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (


                    <div className="flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed border-border text-center bg-secondary">
                        <div className="bg-primary/10 p-3 rounded-full mb-3">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">No Facts added yet</h3>
                        <p className="text-muted-foreground mb-5 max-w-md">Add important details about your tour such as duration, group size, accommodations, etc.</p>
                        <Button
                            type="button"
                            onClick={() => factsAppend?.({
                                title: '',
                                value: '',
                                field_type: 'Plain Text' as 'Plain Text' | 'Single Select' | 'Multi Select',
                                icon: ''
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span>Add First Fact</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TourFacts;
