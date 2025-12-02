'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FileText, Paperclip, Trash2, Eye, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import NovelEditor from '@/components/dashboard/editor/NovelEditor';
import { useTourContext } from '@/providers/TourProvider';
import { getEnabledCategories } from '@/lib/api/categories';
import { getSellerDestinations } from '@/lib/api/destinations';
import type { JSONContent } from 'novel';

/**
 * TourBasicInfo Component
 * Handles basic tour information including title, code, category, description, and media
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

export function TourBasicInfo() {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const { editorContent, setEditorContent } = useTourContext();
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

    // Watch form values
    const tourStatus = watch('tourStatus') || 'Draft';
    const enquiry = watch('enquiry');
    const featured = watch('featured');
    const selectedCategories = watch('category') || [];
    const coverImage = watch('coverImage');
    const destination = watch('destination');
    const file = watch('file');

    // Fetch categories
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories', 'enabled'],
        queryFn: getEnabledCategories,
    });

    // Fetch destinations
    const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
        queryKey: ['destinations', 'seller'],
        queryFn: getSellerDestinations,
    });

    // Transform categories to options
    const categoryOptions: Option[] = React.useMemo(() => {
        const data = categoriesData as any;
        if (!data?.data) return [];
        return data.data.map((cat: any) => ({
            label: cat.name,
            value: cat._id,
        }));
    }, [categoriesData]);

    // Transform destinations to options
    const destinationOptions = React.useMemo(() => {
        const data = destinationsData as any;
        if (!data?.data) return [];
        return data.data.map((dest: any) => ({
            label: dest.name,
            value: dest._id,
        }));
    }, [destinationsData]);

    // Get selected destination name
    const selectedDestination = React.useMemo(() => {
        if (!destination) return 'Select Destination';
        const dest = destinationOptions.find((d: { value: string; label: string }) => d.value === destination);
        return dest?.label || 'Select Destination';
    }, [destination, destinationOptions]);

    // Generate unique tour code
    const generateTourCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setValue('code', code, { shouldValidate: true });
    };

    // Handle cover image upload
    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('coverImage', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('file', file);
        }
    };

    // Handle category change
    const handleCategoryChange = (options: Option[]) => {
        setValue('category', options, { shouldValidate: true });
    };

    // Handle destination change
    const handleDestinationChange = (value: string) => {
        setValue('destination', value, { shouldValidate: true });
    };

    // Handle image select from gallery (placeholder - you'll need to implement gallery)
    const handleImageSelect = (imageUrl: string) => {
        setValue('coverImage', imageUrl);
        setCoverImagePreview(imageUrl);
        setImageDialogOpen(false);
    };

    // Handle PDF select from gallery (placeholder - you'll need to implement gallery)
    const handlePdfSelect = (pdfUrl: string) => {
        setValue('file', pdfUrl);
        setPdfDialogOpen(false);
    };

    // Handle remove image
    const handleRemoveImage = () => {
        setValue('coverImage', '');
        setCoverImagePreview(null);
    };

    // Handle remove PDF
    const handleRemovePdf = () => {
        setValue('file', '');
    };

    return (
        <Card className="shadow-xs pt-0">
            <CardHeader className="bg-secondary border-b p-6 rounded-xl">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Tour Overview</CardTitle>
                </div>
                <CardDescription>
                    Add basic information about the tour
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
                {/* Title and Code */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tour Name</Label>
                        <Input
                            id="title"
                            placeholder="Tour name"
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message as string}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Trip Code</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="code"
                                type="text"
                                className="w-full uppercase"
                                placeholder="Trip Code"
                                disabled
                                {...register('code')}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={generateTourCode}
                            >
                                Generate
                            </Button>
                        </div>
                        {errors.code && (
                            <p className="text-sm text-destructive">{errors.code.message as string}</p>
                        )}
                    </div>
                </div>

                {/* Categories */}
                {categoryOptions && categoryOptions.length > 0 && (
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <MultipleSelector
                            value={selectedCategories}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            placeholder="Select categories..."
                            emptyIndicator={
                                <p className="text-center text-sm text-muted-foreground">
                                    {categoriesLoading ? 'Loading...' : 'No categories found'}
                                </p>
                            }
                        />
                        {errors.category && (
                            <p className="text-sm text-destructive">{errors.category.message as string}</p>
                        )}
                    </div>
                )}

                {/* Destination */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Destination</Label>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedDestination}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] z-50" align="start">
                                {destinationsLoading ? (
                                    <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                                ) : destinationOptions.length === 0 ? (
                                    <DropdownMenuItem disabled>No destinations found</DropdownMenuItem>
                                ) : (
                                    destinationOptions.map((dest: { value: string; label: string }) => (
                                        <DropdownMenuItem
                                            key={dest.value}
                                            onClick={() => handleDestinationChange(dest.value)}
                                        >
                                            {dest.label}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* Tour Status */}
                    <div className="space-y-2">
                        <Label>Tour Status</Label>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {tourStatus}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] z-50" align="start">
                                <DropdownMenuItem onClick={() => setValue('tourStatus', 'Published')}>
                                    Published
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setValue('tourStatus', 'Draft')}>
                                    Draft
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setValue('tourStatus', 'Expired')}>
                                    Expired
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>


                {/* Excerpt */}
                <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                        id="excerpt"
                        className="min-h-32"
                        placeholder="Tour Excerpt"
                        {...register('excerpt')}
                    />
                    {errors.excerpt && (
                        <p className="text-sm text-destructive">{errors.excerpt.message as string}</p>
                    )}
                </div>



                {/* Description */}
                <div className="space-y-2">
                    <Label>Description</Label>
                    <NovelEditor
                        initialValue={editorContent}
                        onContentChange={(content: JSONContent) => {
                            setEditorContent(content);
                            setValue('description', JSON.stringify(content));
                        }}
                        placeholder="Describe the tour details..."
                        minHeight="300px"
                        enableAI={false}
                        enableGallery={true}
                    />
                </div>

                {/* Cover Image and PDF */}
                <div className="grid grid-flow-col grid-cols-2 gap-3">
                    {/* Cover Image */}
                    <div className="w-full rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <Label>Cover Image</Label>
                            {coverImage || coverImagePreview ? (
                                <div className="mt-2 relative">
                                    <div className="relative aspect-4/3 rounded-md overflow-hidden border border-border bg-primary/5">
                                        <img
                                            src={coverImagePreview || coverImage}
                                            alt="Selected cover"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                                        aria-label="Remove image"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="mt-2">
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Choose Image
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[90%] max-h-[90%] overflow-auto">
                                        <DialogHeader>
                                            <DialogTitle className="mb-3 text-left">
                                                Choose Image From Gallery
                                            </DialogTitle>
                                            <DialogDescription>
                                                Select an image for your tour cover. (Gallery integration needed)
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4">
                                            {/* TODO: Integrate with your gallery component */}
                                            <p className="text-muted-foreground">Gallery component integration needed</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* PDF */}
                    <div className="w-full rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <Label>PDF</Label>
                            {file ? (
                                <div className="mt-2 relative">
                                    <div className="relative aspect-4/3 rounded-md overflow-hidden border border-border bg-primary/5 flex flex-col items-center justify-center p-4">
                                        <FileText className="h-12 w-12 text-primary" />
                                        <a
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center mt-2 text-primary hover:underline"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View PDF
                                        </a>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemovePdf}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                                        aria-label="Remove PDF"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="mt-2">
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Choose PDF
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[90%] max-h-[90%] overflow-auto">
                                        <DialogHeader>
                                            <DialogTitle className="mb-3 text-left">
                                                Choose PDF From Gallery
                                            </DialogTitle>
                                            <DialogDescription>
                                                Select a PDF. (Gallery integration needed)
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4">
                                            {/* TODO: Integrate with your gallery component */}
                                            <p className="text-muted-foreground">Gallery component integration needed</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tour Settings */}
                <div className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Tour Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure additional settings for the tour</p>
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable Enquiries</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow users to send inquiries about this tour
                            </p>
                        </div>
                        <Switch
                            checked={Boolean(enquiry)}
                            onCheckedChange={(v) => setValue('enquiry', v)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
