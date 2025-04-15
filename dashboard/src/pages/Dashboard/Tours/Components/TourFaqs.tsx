import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FaqData } from '@/Provider/types';
import { HelpCircle, Plus, Trash2, MessageCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TourFaqsProps {
    form: UseFormReturn<any>;
    faqFields: any[];
    faqAppend: (value: Partial<any>) => void;
    faqRemove: (index: number) => void;
    faq: FaqData[];
    watchedFaq: any[];
    handleFaqSelect: (faqData: FaqData | undefined, index: number) => void;
}

const TourFaqs: React.FC<TourFaqsProps> = ({
    form,
    faqFields,
    faqAppend,
    faqRemove,
    faq,
    watchedFaq,
    handleFaqSelect
}) => {
    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-secondary border-b pb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Frequently Asked Questions</CardTitle>
                </div>
                <CardDescription>
                    Add common questions and answers about the tour
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-md font-medium">Tour FAQs</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => faqAppend({
                            question: '',
                            answer: ''
                        })}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add FAQ</span>
                    </Button>
                </div>

                {faqFields.length > 0 ? (
                    <div className="space-y-4">
                        {faqFields.map((field, index) => (
                            <Card 
                                key={field.id} 
                                className={cn(
                                    "border overflow-hidden transition-all", 
                                    watchedFaq[index]?.question ? "border-border" : "bg-secondary/50"
                                )}
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value={`item-${index}`} className="border-none">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70">
                                            <div className="flex items-center space-x-3 w-full">
                                                <Badge 
                                                    variant={watchedFaq[index]?.question ? "default" : "outline"} 
                                                    className="rounded-md h-7 w-7 p-0 flex items-center justify-center"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                </Badge>
                                                <div className="flex-1 font-medium text-base truncate">
                                                    {watchedFaq[index]?.question || `Question ${index + 1}`}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        faqRemove(index);
                                                    }}
                                                    className="ml-auto h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </Button>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6 pt-2 border-t border-border">
                                            <div className="grid grid-cols-1 gap-5 mt-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`faqs.${index}.question`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-1">
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                                <span>Question</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select 
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        const faqData = faq.find(f => f.question === value);
                                                                        handleFaqSelect(faqData, index);
                                                                    }}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select a question" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {faq.map((faqItem, faqIndex) => (
                                                                            <SelectItem key={faqIndex} value={faqItem.question}>
                                                                                {faqItem.question}
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
                                                    name={`faqs.${index}.answer`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-1">
                                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                                <span>Answer</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Enter detailed answer to the question"
                                                                    className="min-h-[120px] resize-y"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
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
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">No FAQs added yet</h3>
                        <p className="text-muted-foreground mb-5 max-w-md">Add frequently asked questions to help your customers get quick answers to common inquiries</p>
                        <Button
                            type="button"
                            onClick={() => faqAppend({
                                question: '',
                                answer: ''
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span>Add First FAQ</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TourFaqs;
