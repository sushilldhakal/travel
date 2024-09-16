import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { addFacts } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { getUserId } from "@/util/AuthLayout";
import { InputTags } from "@/userDefinedComponents/InputTags";
import AllIcons from "./AllIcons";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Icon from "@/userDefinedComponents/Icon";

interface FactFormData {
    name: string;
    field_type: string;
    value: string[];
    icon: string;
    userId: string | null;
}


const AddFact = ({ onFactAdded }: { onFactAdded: () => void }) => {
    const userId = getUserId();
    const [valuesTag, setValuesTag] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            name: '',
            field_type: '',
            value: [],
            icon: '',
            userId: userId,
        },
    });
    const { watch } = form;
    const fieldType = watch('field_type');
    const factMutation = useMutation({
        mutationFn: (data: FormData) => addFacts(data),
        onSuccess: () => {
            toast({
                title: 'Facts added successfully',
                description: 'Facts has been added successfully.',
            });
            onFactAdded();
            setValuesTag([]);
            setSelectedIcon(null);
            form.reset();

        },
        onError: (error: unknown) => {
            toast({
                title: 'Failed to create fact',
                description: `An error occurred while creating the fact.${error}`,
            });
        },
    });

    const handleCreateFact = async (values: FactFormData) => {
        event?.preventDefault();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('field_type', values.field_type);

        values.value.forEach((item, index) => {
            formData.append(`value[${index}]`, item);
        });
        if (selectedIcon) {
            formData.append('icon', selectedIcon);
        }
        formData.append('userId', values.userId || '');

        try {
            await factMutation.mutate(formData);
        } catch (error) {
            toast({
                title: 'Failed to create fact',
                description: 'Please try again later.',
            });
        }
    };

    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
        setIsOpen(false); // Close the dialog
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleCreateFact)();
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Facts</CardTitle>
                        <CardDescription>Add a new Fact to your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facts Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Fact Name" />
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
                                            <FormLabel>Facts Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                        value={valuesTag}
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
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Create Fact</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default AddFact;
