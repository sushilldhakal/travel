'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTour, getSingleTour, updateTour } from '@/lib/api/tours';
import { toast } from '@/components/ui/use-toast';

/**
 * Tour Provider Context
 * Migrated from dashboard/src/Provider/TourContext.tsx
 * Manages tour form state, editor content, and CRUD operations
 */

// Types
export interface Tour {
    _id?: string;
    title: string;
    code: string;
    excerpt: string;
    description: any;
    tourStatus: 'draft' | 'published' | 'archived';
    coverImage: string;
    gallery: any[];
    category: any[];
    destination: any;
    pricing: any;
    pricingOptions: any[];
    dates: any;
    itinerary: any;
    include: any;
    exclude: any;
    facts: any[];
    faqs: any[];
}

interface TourContextType {
    form: any;
    tourId?: string;
    isEditing: boolean;
    editorContent: any;
    setEditorContent: (content: any) => void;
    inclusionsContent: any;
    setInclusionsContent: (content: any) => void;
    exclusionsContent: any;
    setExclusionsContent: (content: any) => void;
    onSubmit: (values: FieldValues) => Promise<void>;
    isLoading: boolean;
    isSaving: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTourContext() {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTourContext must be used within TourProvider');
    }
    return context;
}

interface TourProviderProps {
    children: React.ReactNode;
    defaultValues?: Partial<Tour>;
    isEditing?: boolean;
}

export function TourProvider({ children, defaultValues, isEditing = false }: TourProviderProps) {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const tourId = params?.id as string | undefined;

    // Editor states
    const [editorContent, setEditorContent] = useState<any>(null);
    const [inclusionsContent, setInclusionsContent] = useState<any>(null);
    const [exclusionsContent, setExclusionsContent] = useState<any>(null);

    // Initialize form
    const form = useForm<Tour>({
        defaultValues: defaultValues as any || {
            title: '',
            code: '',
            excerpt: '',
            tourStatus: 'draft',
            coverImage: '',
            gallery: [],
            category: [],
            pricing: {
                price: 0,
                pricePerPerson: true,
                minSize: 1,
                maxSize: 10,
            },
            pricingOptions: [],
            facts: [],
            faqs: [],
        },
    });

    // Fetch tour data if editing
    const { data: fetchedTourData, isLoading } = useQuery({
        queryKey: ['tour', tourId],
        queryFn: () => getSingleTour(tourId!),
        enabled: !!tourId && isEditing,
    });

    // Update form when data is fetched
    useEffect(() => {
        if (fetchedTourData) {
            const tourData = fetchedTourData.data?.tour || fetchedTourData;
            form.reset(tourData);

            // Set editor content
            if (tourData.description) {
                try {
                    const desc = typeof tourData.description === 'string'
                        ? JSON.parse(tourData.description)
                        : tourData.description;
                    setEditorContent(desc);
                } catch (e) {
                    console.error('Error parsing description:', e);
                }
            }

            if (tourData.include) {
                try {
                    const inc = typeof tourData.include === 'string'
                        ? JSON.parse(tourData.include)
                        : tourData.include;
                    setInclusionsContent(inc);
                } catch (e) {
                    console.error('Error parsing inclusions:', e);
                }
            }

            if (tourData.exclude) {
                try {
                    const exc = typeof tourData.exclude === 'string'
                        ? JSON.parse(tourData.exclude)
                        : tourData.exclude;
                    setExclusionsContent(exc);
                } catch (e) {
                    console.error('Error parsing exclusions:', e);
                }
            }
        }
    }, [fetchedTourData, form]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (formData: FormData) => createTour(formData),
        onSuccess: (data: any) => {
            toast({
                title: 'Success!',
                description: 'Tour created successfully',
            });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
            // Handle different response structures
            const tourId = data?.tour?._id || data?._id;
            if (tourId) {
                router.push(`/dashboard/tours/edit/${tourId}`);
            } else {
                router.push('/dashboard/tours');
            }
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error creating tour',
                description: error.message || 'Failed to create tour',
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (formData: FormData) => updateTour(tourId!, formData),
        onSuccess: () => {
            toast({
                title: 'Success!',
                description: 'Tour updated successfully',
            });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
            queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error updating tour',
                description: error.message || 'Failed to update tour',
            });
        },
    });

    // Submit handler
    const onSubmit = async (values: FieldValues) => {
        const formData = new FormData();

        // Add basic fields
        Object.keys(values).forEach((key) => {
            const value = values[key];
            if (value !== undefined && value !== null) {
                if (key === 'description' && editorContent) {
                    formData.append(key, JSON.stringify(editorContent));
                } else if (key === 'include' && inclusionsContent) {
                    formData.append(key, JSON.stringify(inclusionsContent));
                } else if (key === 'exclude' && exclusionsContent) {
                    formData.append(key, JSON.stringify(exclusionsContent));
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (tourId) {
            formData.append('id', tourId);
        }

        // Execute mutation
        if (isEditing && tourId) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
    };

    const contextValue: TourContextType = {
        form,
        tourId,
        isEditing,
        editorContent,
        setEditorContent,
        inclusionsContent,
        setInclusionsContent,
        exclusionsContent,
        setExclusionsContent,
        onSubmit,
        isLoading,
        isSaving: createMutation.isPending || updateMutation.isPending,
    };

    return <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>;
}
