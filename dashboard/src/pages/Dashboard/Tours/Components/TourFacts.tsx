import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FactData } from '@/Provider/types';
import { Plus, Info, Trash2, FileText, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/MultiSelect';

interface TourFactsProps {
    form: UseFormReturn<any>;
    factsFields: any[];
    factsAppend: (value: Partial<any>) => void;
    factsRemove: (index: number) => void;
    facts: FactData[];
    watchedFacts: any[];
}

const TourFacts: React.FC<TourFactsProps> = ({
    form,
    factsFields,
    factsAppend,
    factsRemove,
    facts,
    watchedFacts
}) => {
    // State to keep track of selected facts for each row
    const [selectedFact, setSelectedFact] = useState<Record<number, FactData | undefined>>({});

    // Helper function to get an icon for a fact
    const getFactIcon = (index: number) => {
        const iconName = watchedFacts[index]?.icon || '';
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
        if (watchedFacts && watchedFacts.length > 0) {
            const initialSelectedFacts: Record<number, FactData | undefined> = {};

            watchedFacts.forEach((fact, idx) => {
                if (fact && fact.title) {
                    // Find the matching fact from the facts array
                    const matchingFact = facts.find(f => f.name === fact.title);
                    if (matchingFact) {
                        initialSelectedFacts[idx] = matchingFact;
                    }
                }
            });

            setSelectedFact(initialSelectedFacts);
            console.log("Initial selected facts:", initialSelectedFacts);
            console.log("Watched facts:", watchedFacts);
        }
    }, [watchedFacts, facts]);

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
                        onClick={() => factsAppend({
                            title: '',
                            value: [''],
                            field_type: '',
                            icon: ''
                        })}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Fact</span>
                    </Button>
                </div>

                {factsFields.length > 0 ? (
                    <div className="space-y-4">
                        {factsFields.map((field, index) => (
                            <Card key={field.id} className={cn(
                                "border overflow-hidden transition-all",
                                watchedFacts[index]?.title ? "border-border" : "bg-secondary/50"
                            )}>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value={`item-${index}`} className="border-none">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70">
                                            <div className="flex items-center space-x-3 w-full">
                                                <Badge variant={watchedFacts[index]?.title ? "default" : "outline"}
                                                    className="rounded-md h-7 w-7 p-0 flex items-center justify-center font-medium">
                                                    {getFactIcon(index)}
                                                </Badge>
                                                <div className="flex-1 font-medium text-base">
                                                    {watchedFacts[index]?.title || `Fact ${index + 1}`}
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
                                                        factsRemove(index);
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
                                                            factsRemove(index);
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
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        const fact = facts.find(f => f.name === value);

                                                                        // Update selectedFact for this specific index while preserving other entries
                                                                        setSelectedFact(prev => ({
                                                                            ...prev,
                                                                            [index]: fact
                                                                        }));
                                                                        form.setValue(`facts.${index}.field_type`, fact?.field_type || '');
                                                                        form.setValue(`facts.${index}.icon`, fact?.icon || '');
                                                                        console.log("selected fact", selectedFact);
                                                                    }}
                                                                    value={field.value || ''}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select a fact" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {facts.map((fact, factIndex) => (
                                                                            <SelectItem key={factIndex} value={fact.name}>
                                                                                {fact.name}
                                                                            </SelectItem>
                                                                        ))}
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

                                                {/* Value field - changes based on field type */}
                                                {selectedFact && watchedFacts[index]?.field_type === 'Plain Text' && (
                                                    <FormField
                                                        control={form.control}
                                                        name={`facts.${index}.value`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Fact Details</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        value={Array.isArray(field.value) ? field.value[0] || '' : ''}
                                                                        onChange={(e) => {
                                                                            // Store as array with single item
                                                                            field.onChange([e.target.value]);
                                                                        }}
                                                                        placeholder={`Enter ${selectedFact?.name}`}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {watchedFacts[index]?.field_type === 'Single Select' && selectedFact[index] && (
                                                    <FormField
                                                        control={form.control}
                                                        name={`facts.${index}.value`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Fact Details</FormLabel>
                                                                <FormControl>
                                                                    <Select
                                                                        value={Array.isArray(field.value) ? field.value[0] || '' : ''}
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
                                                                                selectedFact[index]?.value.map((option: string, idx: number) => (
                                                                                    <SelectItem key={idx} value={String(option)}>
                                                                                        {String(option)}


                                                                                    </SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {watchedFacts[index]?.field_type === 'Multi Select' && selectedFact[index] && (
                                                    <FormField
                                                        control={form.control}
                                                        name={`facts.${index}.value`}
                                                        render={({ field }) => {
                                                            // Extract current field value and handle nested arrays
                                                            let fieldValue = [];
                                                            if (Array.isArray(field.value)) {
                                                                if (Array.isArray(field.value[0])) {
                                                                    // It's a nested array, extract the inner array
                                                                    fieldValue = field.value[0];
                                                                } else {
                                                                    // It's a flat array
                                                                    fieldValue = field.value;
                                                                }
                                                            }

                                                            console.log("Current field value:", field.value);
                                                            console.log("Processed field value:", fieldValue);

                                                            // Map our string array to object format needed by MultiSelect
                                                            const optionsMulti = Array.isArray(selectedFact[index]?.value)
                                                                ? selectedFact[index]?.value.map((option: string) => ({
                                                                    value: option,
                                                                    label: option,
                                                                }))
                                                                : [];

                                                            // Format current values to match MultiSelect expected format
                                                            const currentValues = Array.isArray(fieldValue) ?
                                                                fieldValue.map(val => {
                                                                    // Handle different possible formats
                                                                    if (typeof val === 'string') {
                                                                        return { value: val, label: val };
                                                                    } else if (val && typeof val === 'object' && 'value' in val) {
                                                                        return val;
                                                                    }
                                                                    return null;
                                                                }).filter(Boolean) : [];

                                                            console.log("Current values formatted:", currentValues);

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
                                                                                console.log("Selected values:", selectedValues);
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
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed border-border text-center bg-secondary">
                        <div className="bg-primary/10 p-3 rounded-full mb-3">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">No facts added yet</h3>
                        <p className="text-muted-foreground mb-5 max-w-md">Add facts to provide important details about the tour such as duration, group size, and other key information</p>
                        <Button
                            type="button"
                            onClick={() => factsAppend({
                                title: '',
                                value: [''],
                                field_type: '',
                                icon: ''
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Fact
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TourFacts;
