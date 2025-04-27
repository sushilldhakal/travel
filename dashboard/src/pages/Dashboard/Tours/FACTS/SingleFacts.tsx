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
import { useEffect, useState } from "react";
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

interface SingleFactProps {
    fact?: FactData;
    DeleteFact?: (id: string) => void;
}

// Extended interface to handle the nested API response
interface FactApiResponse {
    facts?: FactData;
    [key: string]: unknown;
}

const SingleFact = ({
    fact,
    DeleteFact,
}: SingleFactProps) => {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [valuesTag, setValuesTag] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            name: fact?.name || '',
            field_type: fact?.field_type || '',
            value: Array.isArray(fact?.value) ? fact.value : [],
            icon: fact?.icon || '',
            userId: '',
        },
    });

    const { watch } = form;
    const fieldType = watch('field_type');

    // Initialize tags when fact data is available or when entering edit mode
    useEffect(() => {
        if (fact && !isEditMode) {
            // Initialize selected icon from fact data when not in edit mode
            setSelectedIcon(fact.icon || null);
        }
    }, [fact, isEditMode]);

    // Handle entering edit mode
    const enterEditMode = () => {
        if (fact) {
            console.log("Entering edit mode with fact:", fact);
            // Set form values from fact data
            form.setValue('name', fact.name);
            form.setValue('field_type', fact.field_type);
            form.setValue('icon', fact.icon || '');

            // Handle fact values (tags for Single/Multi Select)
            if (Array.isArray(fact.value)) {
                console.log("Setting tag values:", fact.value);
                const tagValues = [...fact.value]; // Create a copy to avoid reference issues
                form.setValue('value', tagValues);
                setValuesTag(tagValues);
            } else if (typeof fact.value === 'string') {
                // Handle case where value might be a string that needs to be parsed
                try {
                    const parsedValue = JSON.parse(fact.value);
                    if (Array.isArray(parsedValue)) {
                        console.log("Parsed tag values from string:", parsedValue);
                        form.setValue('value', parsedValue);
                        setValuesTag(parsedValue);
                    }
                } catch (e) {
                    // If parsing fails, just use empty array
                    console.log("Failed to parse value, using empty array");
                    form.setValue('value', []);
                    setValuesTag([]);
                }
            } else {
                console.log("No valid tag values found, using empty array");
                form.setValue('value', []);
                setValuesTag([]);
            }

            setSelectedIcon(fact.icon || null);
            setIsEditMode(true);
        }
    };

    // Fetch single fact data if factId is provided
    const { data: factSingle, isLoading, isError } = useQuery<FactApiResponse>({
        queryKey: ['singleFact', fact?.id],
        queryFn: () => fact?.id ? getSingleFacts(fact?.id) : Promise.reject('No fact ID provided'),
        enabled: isEditMode && !!fact?.id,
    });

    // Update form values when fact data is loaded
    useEffect(() => {
        if (factSingle && isEditMode) {
            console.log("Loaded fact data:", factSingle);

            // Extract the actual fact data from the nested response structure
            const factData = factSingle.facts || factSingle;

            form.setValue('name', factData.name);
            form.setValue('field_type', factData.field_type);
            form.setValue('icon', factData.icon || '');

            // Handle fact values (tags for Single/Multi Select)
            if (Array.isArray(factData.value)) {
                console.log("Setting tag values from fetched data:", factData.value);
                const tagValues = [...factData.value]; // Create a copy to avoid reference issues
                form.setValue('value', tagValues);
                setValuesTag(tagValues);
            } else if (typeof factData.value === 'string') {
                // Handle case where value might be a string that needs to be parsed
                try {
                    const parsedValue = JSON.parse(factData.value);
                    if (Array.isArray(parsedValue)) {
                        console.log("Parsed tag values from string:", parsedValue);
                        form.setValue('value', parsedValue);
                        setValuesTag(parsedValue);
                    }
                } catch (e) {
                    // If parsing fails, just use empty array
                    console.log("Failed to parse value, using empty array");
                    form.setValue('value', []);
                    setValuesTag([]);
                }
            } else {
                console.log("No valid tag values found, using empty array");
                form.setValue('value', []);
                setValuesTag([]);
            }

            setSelectedIcon(factData.icon || null);
        }
    }, [factSingle, isEditMode, form]);

    const updateFactMutation = useMutation({
        mutationFn: (factData: FormData) => updateFacts(factData, fact?.id || ''),
        onSuccess: () => {
            toast({
                title: 'Fact updated successfully',
                description: 'Your changes have been saved.',
                variant: 'default',
            });
            setIsEditMode(false);
            queryClient.invalidateQueries({
                queryKey: ['facts'], // Match the query key used in useQuery
            });
        },
        onError: (e) => {
            toast({
                title: 'Failed to update fact',
                description: 'An error occurred while saving changes.',
                variant: 'destructive',
            });
            console.log("error on facts update", e)
        },
    });

    const handleUpdateFact = async () => {
        const formData = new FormData();
        formData.append('name', form.getValues('name') || '');
        formData.append('field_type', form.getValues('field_type') || '');

        // Handle tags based on field type
        if (fieldType === 'Single Select' || fieldType === 'Multi Select') {
            const values = form.getValues('value');
            console.log("Submitting tag values:", values);

            if (Array.isArray(values) && values.length > 0) {
                values.forEach((item, index) => {
                    formData.append(`value[${index}]`, item);
                });
            } else if (valuesTag.length > 0) {
                // Fallback to valuesTag if form value is not an array
                console.log("Using valuesTag fallback:", valuesTag);
                valuesTag.forEach((item, index) => {
                    formData.append(`value[${index}]`, item);
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
    };

    const handleDeleteFact = (factId: string) => {
        if (DeleteFact && factId) {
            DeleteFact(factId);
        }
    };

    const handleEditClick = () => {
        enterEditMode();
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
        form.reset({
            name: fact?.name || '',
            field_type: fact?.field_type || '',
            value: Array.isArray(fact?.value) ? fact.value : [],
            icon: fact?.icon || '',
            userId: '',
        });

        // Reset tag values and selected icon
        if (Array.isArray(fact?.value)) {
            setValuesTag(fact.value);
        } else if (typeof fact?.value === 'string') {
            try {
                const parsedValue = JSON.parse(fact.value);
                if (Array.isArray(parsedValue)) {
                    setValuesTag(parsedValue);
                } else {
                    setValuesTag([]);
                }
            } catch (e) {
                setValuesTag([]);
            }
        } else {
            setValuesTag([]);
        }
        setSelectedIcon(fact?.icon || null);
    };

    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
        setIsOpen(false); // Close the dialog
    };

    if (isLoading) return (
        <Card className="shadow-sm animate-pulse">
            <CardContent className="p-6 space-y-4">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded w-full"></div>
            </CardContent>
        </Card>
    );

    if (isError) return (
        <Card className="shadow-sm border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
                <p className="text-destructive">Failed to load fact data</p>
            </CardContent>
        </Card>
    );

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
                                            console.log("Rendering tag field with values:", valuesTag, field.value);
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
                                                                console.log("Tags changed to:", newTags);
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
                                                            <Button variant="outline" size="sm">
                                                                {selectedIcon ? 'Change Icon' : 'Choose Icon'}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="h-[80vh] max-w-[1000px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Select Icon</DialogTitle>
                                                                <DialogDescription>
                                                                    Choose an icon to represent this fact
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4 overflow-y-auto">
                                                                <AllIcons onSelectIcon={handleIconSelect} />
                                                            </div>
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
                                                {fact.value.map((item: string, index: number) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="bg-secondary/70"
                                                    >
                                                        {item}
                                                    </Badge>
                                                ))}
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
};

export default SingleFact;