import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getSingleFaq, updateFaq } from "@/http";
import { FaqData } from "@/Provider/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, HelpCircle, MessageCircle, Save, Trash2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SingleFaqProps {
    faq?: FaqData;
    DeleteFaq?: (id: string) => void;
}

const SingleFaq = ({
    faq,
    DeleteFaq,
}: SingleFaqProps) => {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            question: faq?.question || '',
            answer: faq?.answer || '',
            userId: '',
        },
    });

    // Fetch single faq data if faqId is provided
    const { data: faqSingle, isLoading, isError } = useQuery<FaqData>({
        queryKey: ['singleFaq', editingFaqId],
        queryFn: () => editingFaqId ? getSingleFaq(editingFaqId) : Promise.reject('No faq ID provided'),
        enabled: isEditMode && !!editingFaqId,
    });

    useEffect(() => {
        if (faqSingle && isEditMode) {
            form.setValue('question', faqSingle.question);
            form.setValue('answer', faqSingle.answer);
        } else if (faq && isEditMode) {
            // Initialize form with current faq data if available
            form.setValue('question', faq.question);
            form.setValue('answer', faq.answer);
        }
    }, [faqSingle, isEditMode, form, faq]);

    const updateFaqMutation = useMutation({
        mutationFn: (faqData: FormData) => updateFaq(faqData, faq?.id || ''),
        onSuccess: () => {
            toast({
                title: 'FAQ updated successfully',
                description: 'Your changes have been saved.',
                variant: 'default',
            });
            if (setEditingFaqId) setEditingFaqId(null);
            setIsEditMode(false);
            queryClient.invalidateQueries({
                queryKey: ['faqs'], // Match the query key used in useQuery
            });
        },
        onError: () => {
            toast({
                title: 'Failed to update FAQ',
                description: 'An error occurred while saving changes.',
                variant: 'destructive',
            });
        },
    });

    const handleUpdateFaq = async () => {
        const formData = new FormData();
        formData.append('question', form.getValues('question') || '');
        formData.append('answer', form.getValues('answer') || '');

        try {
            await updateFaqMutation.mutateAsync(formData);
        } catch (error) {
            toast({
                title: 'Failed to update FAQ',
                description: 'Please try again later.',
                variant: 'destructive',
            });
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
    };

    const handleCancelClick = () => {
        if (setEditingFaqId) setEditingFaqId(null);
        setIsEditMode(false);
        form.reset();
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
                <p className="text-destructive">Failed to load FAQ data</p>
            </CardContent>
        </Card>
    );

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleUpdateFaq)();
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
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                                                Question
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Enter frequently asked question" 
                                                    className="focus-visible:ring-primary"
                                                />
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
                                            <FormLabel className="flex items-center gap-1.5">
                                                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                                                Answer
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    rows={4} 
                                                    placeholder="Provide a clear, helpful answer" 
                                                    className="focus-visible:ring-primary resize-y min-h-[120px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="p-5">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-base text-foreground flex items-start gap-2">
                                        <HelpCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <span>{faq?.question}</span>
                                    </h3>
                                </div>
                                <Separator className="my-3" />
                                <div className="mt-3">
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {faq?.answer}
                                    </p>
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
                                    disabled={updateFaqMutation.isPending}
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
                                    onClick={() => faq?.id && handleDeleteFaq(faq?.id)}
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

export default SingleFaq;
