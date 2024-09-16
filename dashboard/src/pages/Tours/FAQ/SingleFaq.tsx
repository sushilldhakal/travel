import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getSingleFaq, updateFaq } from "@/http/api";
import { FaqData } from "@/Provider/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";


interface SingleFaqProps {
    faq?: FaqData;
    DeleteFaq?: (id: string) => void;
}
interface FaqFormData {
    question: string;
    answer: string;
    userId: string | null;
}

const SingleFaq = ({
    faq,
    DeleteFaq,
}: SingleFaqProps) => {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
    const [uploadSubmit, setUploadSubmit] = useState(false);

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            question: '',
            answer: '',
            userId: '',
        },
    });
    // Fetch single faq data if faqId is provided
    const { data: faqSingle, isLoading, isError } = useQuery<FaqData>({
        queryKey: ['singleFaq', editingFaqId],
        queryFn: () => editingFaqId ? getSingleFaq('66dfe3620c3db3a4da2b8925') : Promise.reject('No faq ID provided'),
        enabled: isEditMode && !!editingFaqId,
    });

    console.log("faqSingle", faqSingle)

    useEffect(() => {
        if (faqSingle && isEditMode) {
            form.setValue('question', faqSingle.question);
            form.setValue('answer', faqSingle.answer);
        }
    }, [faqSingle, isEditMode, form]);

    const updateFaqMutation = useMutation({
        mutationFn: (faqData: FormData) => updateFaq(faqData, faq?.id || ''),

        onSuccess: () => {
            toast({
                title: 'Faq updated successfully',
                description: 'Faq has been updated successfully.',
            });
            if (setEditingFaqId) setEditingFaqId(null);
            setIsEditMode(false);
            setUploadSubmit(!uploadSubmit);
            queryClient.invalidateQueries({
                queryKey: ['faqs'], // Match the query key used in useQuery
            })
        },
        onError: () => {
            toast({
                title: 'Failed to update Faq',
                description: 'An error occurred while updating the Faq.',
            });
        },
    });

    const handleUpdateFaq = async (values: FaqFormData) => {
        if (uploadSubmit) {
            const formData = new FormData();
            formData.append('question', form.getValues('question') || '');
            formData.append('answer', form.getValues('answer') || '');

            try {
                await updateFaqMutation.mutateAsync(formData);
            } catch (error) {
                toast({
                    title: 'Failed to update Faq',
                    description: 'Please try again later.',
                });
            }
        }

    };

    const handleDeleteFaq = (faqId: string) => {
        if (DeleteFaq && faqId) {
            DeleteFaq(faqId);
        }
    };


    const handleEditClick = () => {
        if (faq) {
            setEditingFaqId(faq.id || '');
            setIsEditMode(true);
        }
    }

    const handleCancelClick = () => {
        if (setEditingFaqId) setEditingFaqId(null);
        setIsEditMode(false);
    }


    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p className="text-red-600">Failed to load faq</p>;

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(handleUpdateFaq)();
                }}
            >
                <Card>
                    {editingFaqId === faq?.id ? (
                        <>
                            <CardHeader className="">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Faq Question</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Faq Question" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="answer"
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Faq Answer</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={8} placeholder="Faq Answer" />
                                            </FormControl>
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
                                    <h2 className="font-semibold text-md"> {faq?.question}</h2>
                                </div>
                                <div className="mb-2">
                                    <h2 className="font-semibold text-md"> {faq?.answer}</h2>
                                </div>

                            </div>

                        </div>
                    )}
                    <CardFooter className="border-t px-6 py-4">
                        {editingFaqId === faq?.id ? (
                            <>
                                <Button type="submit" onClick={(e) => {
                                    handleUpdateFaq
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
                                    onClick={() => faq?.id && handleDeleteFaq(faq?.id)}
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

export default SingleFaq;
