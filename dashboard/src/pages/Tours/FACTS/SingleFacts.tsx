import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { getSingleFacts, updateFacts } from "@/http/api";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import AllIcons from "./AllIcons";

interface SingleFactProps {
    fact?: FactData;
    DeleteFact?: (id: string) => void;
}
interface FactFormData {
    name: string;
    field_type: string;
    value: string[];
    icon: string;
    userId: string | null;
}

const SingleFact = ({
    fact,
    DeleteFact,
}: SingleFactProps) => {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingFactId, setEditingFactId] = useState<string | null>(null);
    const [uploadSubmit, setUploadSubmit] = useState(false);
    const [valuesTag, setValuesTag] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            name: '',
            field_type: '',
            value: '',
            icon: '',
            userId: '',
        },
    });
    const { watch } = form;
    const fieldType = watch('field_type');
    // Fetch single fact data if factId is provided
    const { data: factSingle, isLoading, isError } = useQuery<FactData>({
        queryKey: ['singleFact', fact?.id],
        queryFn: () => fact?.id ? getSingleFacts(fact?.id) : Promise.reject('No fact ID provided'),
        enabled: isEditMode && !!fact?.id,
    });


    useEffect(() => {
        if (factSingle && isEditMode) {
            form.setValue('name', factSingle.name);
            form.setValue('field_type', factSingle.field_type);
            form.setValue('value', factSingle?.value || '');
            form.setValue('icon', factSingle.icon);
            setSelectedIcon(factSingle.icon);
        }
    }, [factSingle, isEditMode, form]);

    const updateFactMutation = useMutation({
        mutationFn: (factData: FormData) => updateFacts(factData, fact?.id || ''),

        onSuccess: () => {
            toast({
                title: 'Fact updated successfully',
                description: 'Fact has been updated successfully.',
            });
            if (setEditingFactId) setEditingFactId(null);
            setIsEditMode(false);
            setUploadSubmit(!uploadSubmit);
            queryClient.invalidateQueries({
                queryKey: ['facts'], // Match the query key used in useQuery
            })
        },
        onError: () => {
            toast({
                title: 'Failed to update Fact',
                description: 'An error occurred while updating the Fact.',
            });
        },
    });

    const handleUpdateFact = async (values: FactFormData) => {
        if (uploadSubmit) {
            const formData = new FormData();
            formData.append('name', form.getValues('name') || '');
            formData.append('field_type', form.getValues('field_type') || '');
            values.value.forEach((item, index) => {
                formData.append(`value[${index}]`, item);
            });
            if (selectedIcon) {
                formData.append('icon', selectedIcon);
            }

            console.log('FormData:', {
                name: values.name,
                field_type: values.field_type,
                value: JSON.stringify(values.value),
                icon: selectedIcon || '',
                userId: values.userId || '',
            });
            try {
                await updateFactMutation.mutateAsync(formData);
            } catch (error) {
                toast({
                    title: 'Failed to update Fact',
                    description: 'Please try again later.',
                });
            }
        }

    };

    const handleDeleteFact = (factId: string) => {
        if (DeleteFact && factId) {
            DeleteFact(factId);
        }
    };


    const handleEditClick = () => {
        if (fact) {
            setEditingFactId(fact.id || '');
            setIsEditMode(true);
        }
    }

    const handleCancelClick = () => {
        if (setEditingFactId) setEditingFactId(null);
        setIsEditMode(false);
    }


    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
        setIsOpen(false); // Close the dialog
    };


    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p className="text-red-600">Failed to load fact</p>;

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(handleUpdateFact)();
                }}
            >
                <Card>
                    {editingFactId === fact?.id ? (
                        <>
                            <CardHeader className="">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Fact Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Fact name" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="field_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facts Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type for Fact Value" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Plain Text">Plain Text</SelectItem>
                                                    <SelectItem value="Single Select">Single Select</SelectItem>
                                                    <SelectItem value="Multi Select">Multi Select</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {(fieldType === 'Single Select' || fieldType === 'Multi Select') && (
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <FormControl>
                                                    <InputTags
                                                        value={field.value || field}
                                                        placeholder="Enter your facts tags"
                                                        onChange={(newTags) => {
                                                            setValuesTag(newTags); // Update the state with new tags
                                                            field.onChange(newTags); // Update the form field value
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="icon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Icon</FormLabel>
                                            {/* show selected icon here */}
                                            <FormControl>
                                                <div className="flex items-center">
                                                    {selectedIcon && (
                                                        <div className="mr-2" >
                                                            <Icon name={selectedIcon} size={24} />
                                                        </div>
                                                    )}
                                                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline">Choose Icons </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="h-[80vh] max-w-[1000px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Icons</DialogTitle>
                                                                <DialogDescription>
                                                                    Add Icons to facts
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4  overflow-y-auto">
                                                                <AllIcons onSelectIcon={handleIconSelect} />
                                                            </div>
                                                            <DialogFooter>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="col-span-5 grid gap-4">

                                    </div>
                                </div>

                            </CardContent>
                        </>
                    ) : (
                        <div className="grid gap-2">

                            <div className="px-6 pt-6 pb-6">
                                <div className="mb-2">
                                    <h2 className="font-semibold text-md"> {fact?.name}</h2>
                                </div>
                                <div className="mb-2">
                                    <h2 className="font-semibold text-md"> {fact?.field_type}</h2>
                                </div>
                                <div className="mb-2">
                                    {
                                        fact?.value && fact?.value.length > 0 ? fact?.value.map((item, index) => (
                                            <span key={index} className="mb-2">
                                                <span className="font-semibold text-xs"> {item}</span>
                                            </span>
                                        )) : null
                                    }
                                </div>
                                <div className="mb-2">
                                    <h2 className="font-semibold text-md"> <Icon name={fact?.icon} /></h2>
                                </div>

                            </div>

                        </div>
                    )}
                    <CardFooter className="border-t px-6 py-4">
                        {editingFactId === fact?.id ? (
                            <>
                                <Button type="submit" onClick={(e) => {
                                    handleUpdateFact
                                    setUploadSubmit(!uploadSubmit);
                                }}>Save</Button>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    className="ml-2"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    onClick={handleEditClick}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    className="ml-2"
                                    onClick={() => fact?.id && handleDeleteFact(fact?.id)}
                                >
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
