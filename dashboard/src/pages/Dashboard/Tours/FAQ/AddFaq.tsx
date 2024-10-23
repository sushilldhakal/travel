import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { addFaq } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { getUserId } from "@/util/AuthLayout";
import { Textarea } from "@/components/ui/textarea";


interface FaqFormData {
    question: string;
    answer: string;
    userId: string | null;
}


const AddFaq = ({ onFaqAdded }: { onFaqAdded: () => void }) => {
    const userId = getUserId();
    const form = useForm({
        defaultValues: {
            question: '',
            answer: '',
            userId: userId,
        },
    });
    const faqsMutation = useMutation({
        mutationFn: (data: FormData) => addFaq(data),
        onSuccess: () => {
            toast({
                title: 'Faqs added successfully',
                description: 'Faqs has been added successfully.',
            });
            onFaqAdded();
            form.reset();

        },
        onError: (error: unknown) => {
            toast({
                title: 'Failed to create faqs',
                description: `An error occurred while creating the faqs.${error}`,
            });
        },
    });

    const handleCreateFaq = async (values: FaqFormData) => {
        event?.preventDefault();
        const formData = new FormData();
        formData.append('question', values.question);
        formData.append('answer', values.answer);
        formData.append('userId', values.userId || '');

        try {
            await faqsMutation.mutate(formData);
        } catch (error) {
            toast({
                title: 'Failed to create faqs',
                description: 'Please try again later.',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleCreateFaq)();
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Faqs</CardTitle>
                        <CardDescription>Add a new Faq to your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faqs Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Faq question" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="answer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faqs Name</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={8} placeholder="Faq answer" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Create Faq</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default AddFaq;
