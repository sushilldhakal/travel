'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, HelpCircle, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getDefaultFAQ } from '@/lib/utils/defaultTourValues';

/**
 * TourFaqs Component
 * Handles tour FAQs with dynamic question-answer pairs
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

export function TourFaqs() {
    const { control } = useFormContext();
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);

    // Field array for FAQs
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'faqs',
    });

    // Handle delete with confirmation
    const handleDeleteClick = (index: number) => {
        setDeleteIndex(index);
    };

    const handleDeleteConfirm = () => {
        if (deleteIndex !== null) {
            remove(deleteIndex);
            setDeleteIndex(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteIndex(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                        Add common questions and answers to help customers make informed decisions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No FAQs added yet. Add your first question to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <FaqItem
                                    key={field.id}
                                    index={index}
                                    onRemove={() => handleDeleteClick(index)}
                                />
                            ))}
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append(getDefaultFAQ())}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add FAQ
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete FAQ?
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete FAQ {deleteIndex !== null ? deleteIndex + 1 : ''}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * FAQ Item Component
 * Individual FAQ with question and answer fields
 */
interface FaqItemProps {
    index: number;
    onRemove: () => void;
}

function FaqItem({ index, onRemove }: FaqItemProps) {
    const { register, formState: { errors } } = useFormContext();

    // Safely access nested errors
    const faqErrors = errors.faqs as any;
    const questionError = faqErrors?.[index]?.question;
    const answerError = faqErrors?.[index]?.answer;

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                    <h4 className="font-semibold">FAQ {index + 1}</h4>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>

                {/* Question */}
                <div className="space-y-2">
                    <Label htmlFor={`faqs.${index}.question`}>
                        Question
                    </Label>
                    <Input
                        id={`faqs.${index}.question`}
                        placeholder="e.g., What is included in the tour price?"
                        {...register(`faqs.${index}.question`)}
                    />
                    {questionError && (
                        <p className="text-sm text-destructive">
                            {questionError.message as string}
                        </p>
                    )}
                </div>

                {/* Answer */}
                <div className="space-y-2">
                    <Label htmlFor={`faqs.${index}.answer`}>
                        Answer
                    </Label>
                    <Textarea
                        id={`faqs.${index}.answer`}
                        placeholder="Provide a detailed answer to the question..."
                        rows={4}
                        {...register(`faqs.${index}.answer`)}
                    />
                    {answerError && (
                        <p className="text-sm text-destructive">
                            {answerError.message as string}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
