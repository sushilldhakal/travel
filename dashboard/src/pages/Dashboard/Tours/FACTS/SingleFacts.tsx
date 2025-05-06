import React, { memo, useCallback, useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { getSingleFacts, updateFacts } from "@/http";
import { FactData } from "@/Provider/types";
import Icon from "@/userDefinedComponents/Icon";
import { InputTags } from "@/userDefinedComponents/InputTags";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import AllIcons from "./AllIcons";
import { Edit, FileText, Save, Tag, TagsIcon, Trash2, Type, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserId } from "@/util/authUtils";

// Extended interface for FactData to include id and handle value type variations
interface FactDataWithId extends FactData {
    id?: string;
    _id?: string;
    value: string[] | string | { label: string; value: string }[];
}

interface SingleFactProps {
    fact?: FactDataWithId;
    DeleteFact?: (id: string) => void;
}

// Extended interface to handle the nested API response
interface FactApiResponse {
    facts?: FactDataWithId;
    [key: string]: unknown;
}

// Create a memoized SingleFact component to prevent unnecessary re-renders
const SingleFact = memo(({
    fact,
    DeleteFact,
}: SingleFactProps) => {

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [valuesTag, setValuesTag] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Get user ID for cache invalidation
    const userId = getUserId();

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            name: fact?.name || '',
            field_type: fact?.field_type || '',
            value: Array.isArray(fact?.value) ? fact.value : [],
            icon: fact?.icon || '',
        },
    });

    const { watch } = form;
    const fieldType = watch('field_type');

    // Memoize initial form setup to avoid expensive operations
    const setupFormFromFact = useCallback((factData: FactDataWithId) => {
        form.setValue('name', factData.name);
        form.setValue('field_type', factData.field_type);
        form.setValue('icon', factData.icon || '');

        // Handle fact values (tags for Single/Multi Select)
        let parsedValues: string[] = [];

        if (Array.isArray(factData.value)) {
            parsedValues = [...factData.value];
        } else if (typeof factData.value === 'string') {
            try {
                const parsed = JSON.parse(factData.value);
                if (Array.isArray(parsed)) {
                    parsedValues = parsed;
                }
            } catch (e) {
                // Silent error - use empty array
            }
        }

        form.setValue('value', parsedValues);
        setValuesTag(parsedValues);
        setSelectedIcon(factData.icon || null);
    }, [form]);

    // Initialize tags when fact data is available or when entering edit mode
    useEffect(() => {
        if (fact && !isEditMode) {
            setSelectedIcon(fact.icon || null);
        }
    }, [fact, isEditMode]);

    // Fetch single fact data if factId is provided and we're in edit mode
    const { data: factSingle, isLoading, isError, refetch } = useQuery<FactApiResponse>({
        queryKey: ['singleFact', fact?.id || fact?._id],
        queryFn: () => {
            const factId = fact?.id || fact?._id;
            if (factId) {
                return getSingleFacts(factId);
            }
            return Promise.reject('No fact ID provided');
        },
        enabled: !!(fact?.id || fact?._id), // Always fetch the fact data, not just in edit mode
        staleTime: 0, // Don't cache the data, always refetch on mount
    });

    // Update form values when fact data is loaded - combined with other effects for efficiency
    useEffect(() => {
        if (factSingle && isEditMode) {
            // Extract the actual fact data from the nested response structure
            const factData = factSingle.facts || factSingle;
            setupFormFromFact(factData as FactDataWithId);
        }
    }, [factSingle, isEditMode, setupFormFromFact]);

    // Handle entering edit mode - memoized to prevent recreation
    const enterEditMode = useCallback(() => {
        if (fact) {
            // We need to ensure we have the latest data before setting up the form
            refetch().then(() => {
                const factData = factSingle?.facts || factSingle || fact;
                setupFormFromFact(factData as FactDataWithId);
                setIsEditMode(true);
            });
        }
    }, [fact, setupFormFromFact, factSingle, refetch]);

    // Memoize update mutation to prevent recreation on every render
    const updateFactMutation = useMutation({
        mutationFn: (factData: FormData) => updateFacts(factData, fact?.id || fact?._id || ''),
        onSuccess: () => {
            toast({
                title: 'Fact updated successfully',
                description: 'Your changes have been saved.',
                variant: 'default',
            });
            setIsEditMode(false);

            // Force refetch the current fact data
            refetch();

            // Also invalidate other queries that match both the case-sensitive keys
            queryClient.invalidateQueries({
                queryKey: ['facts'], // lowercase f used in some components
            });

            queryClient.invalidateQueries({
                queryKey: ['Facts'], // capital F used in useFacts.ts
            });

            // Also invalidate with user ID since it's used in the Facts list
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: ['Facts', userId],
                });
            }
        },
        onError: (e) => {
            toast({
                title: 'Failed to update fact',
                description: 'An error occurred while saving changes.',
                variant: 'destructive',
            });
            console.error("Error on facts update", e);
        },
    });

    // Memoize handlers to prevent recreation on every render
    const handleUpdateFact = useCallback(async () => {
        const formData = new FormData();
        formData.append('name', form.getValues('name') || '');
        formData.append('field_type', form.getValues('field_type') || '');

        // Handle tags based on field type
        if (fieldType === 'Single Select' || fieldType === 'Multi Select') {
            const values = form.getValues('value');

            if (Array.isArray(values) && values.length > 0) {
                // Use JSON.stringify for complex objects to ensure we only send strings to FormData
                values.forEach((item, index) => {
                    // Handle both string and object values
                    const itemValue = typeof item === 'object' && item !== null ? item.value : String(item);
                    formData.append(`value[${index}]`, itemValue);
                });
            } else if (valuesTag.length > 0) {
                // Fallback to valuesTag if form value is not an array
                valuesTag.forEach((item, index) => {
                    const itemValue = typeof item === 'object' && item !== null ? item.value : String(item);
                    formData.append(`value[${index}]`, itemValue);
                });
            } else {
                // Empty array case
                formData.append('value', '[]');
            }
        }

        if (selectedIcon) {
            formData.append('icon', selectedIcon);
        }

        try {
            await updateFactMutation.mutateAsync(formData);
        } catch (error) {
            toast({
                title: 'Failed to update fact',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        }
    }, [fieldType, form, selectedIcon, updateFactMutation, valuesTag]);

    const handleDeleteFact = useCallback((factId: string) => {
        if (DeleteFact && factId) {
            DeleteFact(factId);
        }
    }, [DeleteFact]);

    const handleEditClick = useCallback(() => {
        enterEditMode();
    }, [enterEditMode]);

    const handleCancelClick = useCallback(() => {
        setIsEditMode(false);
        form.reset({
            name: fact?.name || '',
            field_type: fact?.field_type || '',
            value: Array.isArray(fact?.value) ? fact.value : [],
            icon: fact?.icon || '',
        });

        // Reset tag values and selected icon
        if (fact) {
            let parsedValues: string[] = [];

            if (Array.isArray(fact.value)) {
                parsedValues = fact.value;
            } else if (typeof fact.value === 'string') {
                try {
                    const parsed = JSON.parse(fact.value);
                    if (Array.isArray(parsed)) {
                        parsedValues = parsed;
                    }
                } catch (e) {
                    // Silent error - use empty array
                }
            }

            setValuesTag(parsedValues);
            setSelectedIcon(fact.icon || null);
        }
    }, [fact, form]);

    const handleIconSelect = useCallback((iconName: string) => {
        setSelectedIcon(iconName);
        setIsOpen(false); // Close the dialog
    }, []);

    // Memoize loading and error states
    const loadingComponent = useMemo(() => (
        <Card className="shadow-sm animate-pulse">
            <CardContent className="p-6 space-y-4">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded w-full"></div>
            </CardContent>
        </Card>
    ), []);

    const errorComponent = useMemo(() => (
        <Card className="shadow-sm border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
                <p className="text-destructive">Error loading fact details. Please try again later.</p>
            </CardContent>
        </Card>
    ), []);

    // Return early for loading/error states
    if (isLoading) return loadingComponent;
    if (isError) return errorComponent;

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleUpdateFact)();
            }}>
                <Card className={cn(
                    "shadow-sm overflow-hidden transition-all",
                    isEditMode ? "border-primary/30 bg-primary/5" : "hover:border-border/80"
                )}>
                    <CardContent className="p-0">
                        {isEditMode ? (
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary">Editing</Badge>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                                Fact Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter fact name"
                                                    className="focus-visible:ring-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="field_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Type className="h-3.5 w-3.5 text-primary" />
                                                Fact Type
                                            </FormLabel>
                                            <Select onValueChange={(value) => {
                                                // When field type changes, reset tags if switching to/from tag-based types
                                                if ((value === 'Single Select' || value === 'Multi Select') &&
                                                    (field.value !== 'Single Select' && field.value !== 'Multi Select')) {
                                                    setValuesTag([]);
                                                    form.setValue('value', []);
                                                }
                                                field.onChange(value);
                                            }} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus-visible:ring-primary">
                                                        <SelectValue placeholder="Select type for fact value" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Plain Text">Plain Text</SelectItem>
                                                    <SelectItem value="Single Select">Single Select</SelectItem>
                                                    <SelectItem value="Multi Select">Multi Select</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                This determines how the fact value will be displayed
                                            </p>
                                        </FormItem>
                                    )}
                                />
                                {(fieldType === 'Single Select' || fieldType === 'Multi Select') && (
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => {
                                            return (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5">
                                                        <TagsIcon className="h-3.5 w-3.5 text-primary" />
                                                        {fieldType === 'Single Select' ? 'Options' : 'Multiple Options'}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <InputTags
                                                            value={valuesTag}
                                                            placeholder={fieldType === 'Single Select' ?
                                                                "Enter options (press Enter after each)" :
                                                                "Enter multiple options (press Enter after each)"}
                                                            onChange={(newTags) => {
                                                                setValuesTag(newTags); // Update the state with new tags
                                                                field.onChange(newTags); // Update the form field value
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {fieldType === 'Single Select'
                                                            ? 'These are the options users can select from (exactly one)'
                                                            : 'These are the options users can select from (multiple allowed)'}
                                                    </p>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="icon"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                {selectedIcon ? (
                                                    <Icon name={selectedIcon} size={14} />
                                                ) : (
                                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                                )}
                                                Icon
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-3">
                                                    {selectedIcon && (
                                                        <div className="flex items-center justify-center h-10 w-10 bg-secondary/50 rounded-md">
                                                            <Icon name={selectedIcon} size={24} />
                                                        </div>
                                                    )}
                                                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="ml-2"
                                                                onClick={() => setIsOpen(true)}
                                                            >
                                                                Select Icon
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Select an Icon</DialogTitle>
                                                                <DialogDescription>
                                                                    Choose an icon for this fact
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {/* Fix props type by properly typing AllIcons component */}
                                                            {React.createElement(AllIcons, { onSelectIcon: handleIconSelect })}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    {fact?.icon ? (
                                        <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Icon name={fact.icon} size={20} />
                                        </div>
                                    ) : (
                                        <FileText className="h-5 w-5 text-primary" />
                                    )}
                                    <h3 className="font-semibold text-base">
                                        {fact?.name}
                                    </h3>
                                </div>
                                <Separator className="my-3" />
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Type className="h-4 w-4" />
                                        <span className="font-medium">Type:</span>
                                        <Badge variant="secondary">{fact?.field_type}</Badge>
                                    </div>
                                    {fact?.value && Array.isArray(fact.value) && fact.value.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                                                <TagsIcon className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {fact.field_type === 'Single Select' ? 'Options:' : 'Multiple Options:'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {fact.value.map((item, index) => {
                                                    // Handle both string and object values
                                                    const tagValue = typeof item === 'object' && item !== null
                                                        ? item.label || item.value
                                                        : String(item);

                                                    return (
                                                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                                            {tagValue}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className={cn(
                        "flex justify-end gap-2 px-5 py-3 bg-secondary/50 border-t",
                        isEditMode && "bg-primary/5 border-primary/20"
                    )}>
                        {isEditMode ? (
                            <>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updateFactMutation.isPending}
                                    className="gap-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    Save
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelClick}
                                    className="gap-1.5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEditClick}
                                    className="text-muted-foreground hover:text-primary gap-1.5"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fact?.id && handleDeleteFact(fact?.id)}
                                    className="text-muted-foreground hover:text-destructive gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
});

// Add display name for debugging
SingleFact.displayName = 'SingleFact';

export default SingleFact;