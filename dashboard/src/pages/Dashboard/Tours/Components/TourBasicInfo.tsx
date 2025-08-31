import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Eye, FileText, HelpCircle, Paperclip, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import MultipleSelector, { Option } from '@/userDefinedComponents/MultipleSelector';
import { cn } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/Provider/types';
import { useTourContext } from '@/Provider/hooks/useTourContext';
import { useTourForm } from '@/Provider/hooks/useTourForm';
import { useCategories } from '../Category/useCategories';
import { getUserId } from '@/util/authUtils';

const TourBasicInfo = () => {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const { editorContent, setEditorContent } = useTourContext();

    // Get everything we need from the form context
    const {
        handleGenerateCode,
        form
    } = useTourForm();

    const params = useParams();
    const singleTour = params.tourId !== undefined;
    const userId = getUserId();
    const categoriesQuery = useCategories(userId);

    // Convert categories to options array for the MultipleSelector component
    const categoryOptions: Option[] = Array.isArray(categoriesQuery.data)
        ? categoriesQuery.data.map((category) => ({
            label: category.name || '',
            value: category.id || '', // This handles null case by converting to empty string
            ...(category.isActive === false ? { disable: true } : {})
        }))
        : [];

    const handleImageSelect = (imageUrl: string | string[] | null, onChange: (value: string) => void) => {
        if (imageUrl) {
            onChange(imageUrl as string);
            setImageDialogOpen(false);
        }
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };

    const handlePdfSelect = (pdfUrl: string, onChange: (value: string) => void) => {
        if (pdfUrl) {
            onChange(pdfUrl);
            setPdfDialogOpen(false); // Close the PDF dialog
        }
    };

    const handleRemovePdf = (onChange: (value: string) => void) => {
        onChange('');
    };

    return (
        <Card className="shadow-xs">
            <CardHeader className="bg-secondary border-b pb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Tour Overview</CardTitle>
                </div>
                <CardDescription>
                    Add basic information about the tour
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-8">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tour Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Tour name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className='relative'>
                                <FormLabel>Trip Code:</FormLabel>
                                {singleTour ? (
                                    <FormControl className="relative">
                                        <Input
                                            type="text"
                                            className="w-full uppercase"
                                            {...field}
                                            placeholder='Trip Code'
                                            disabled
                                        />
                                    </FormControl>
                                ) : (
                                    <div className="flex space-x-2">
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full uppercase"
                                                {...field}
                                                placeholder='Trip Code'
                                                disabled
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (typeof handleGenerateCode === 'function') {
                                                    const generatedCode = handleGenerateCode();
                                                    field.onChange(generatedCode);
                                                } else {
                                                    console.error('handleGenerateCode is not a function');
                                                }
                                            }}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {categoryOptions && categoryOptions.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            value={field.value ?
                                                field.value.map((cat: Category) => ({
                                                    label: cat.name || '',
                                                    value: cat.id || ''
                                                })) : []
                                            }
                                            onChange={(selected) => {
                                                // Convert back to the format your form expects
                                                const selectedCategories = selected.map((option) => ({
                                                    id: option.value,
                                                    name: option.label,
                                                    isActive: true
                                                }));
                                                field.onChange(selectedCategories);
                                            }}
                                            options={categoryOptions}
                                            placeholder="Select categories..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="min-h-32"
                                    {...field}
                                    placeholder='Tour Excerpt'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tourStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tour Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Published">Published</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={() => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <div className="prose min-h-[200px] max-w-full rounded-md border border-input">
                                    <Editor
                                        key={editorContent ? JSON.stringify(editorContent) : 'empty-editor'}
                                        initialValue={editorContent}
                                        onContentChange={(content) => {
                                            setEditorContent(content);
                                            form.setValue('description', JSON.stringify(content));
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-flow-col grid-cols-2 gap-3">
                    <div className="w-full rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <FormField
                                control={form.control}
                                name="coverImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image<br /></FormLabel>
                                        {field.value ? (
                                            <div className="mt-2 relative">
                                                <div className="relative aspect-4/3 rounded-md overflow-hidden border border-border bg-primary/5">
                                                    <img
                                                        src={field.value}
                                                        alt="Selected cover"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(field.onChange)}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                                                    aria-label="Remove image"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                                                <DialogTrigger>
                                                    <div
                                                        className={cn(
                                                            buttonVariants({
                                                                size: "icon",
                                                            }),
                                                            "size-8"
                                                        )}
                                                    >
                                                        <Paperclip className="size-4" />
                                                        <span className="sr-only">Select an image</span>
                                                    </div>
                                                    <span className="pl-2">Choose Image</span>
                                                </DialogTrigger>
                                                <DialogContent
                                                    className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                    onInteractOutside={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <DialogHeader>
                                                        <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                        <div className="upload dialog">
                                                            <GalleryPage
                                                                isGalleryPage={false}
                                                                activeTab="images"
                                                                onImageSelect={(imageUrl) =>
                                                                    handleImageSelect(imageUrl, field.onChange)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        Select an image for your tour cover.
                                                    </DialogDescription>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='w-full rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden'>
                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PDF<br /></FormLabel>
                                        {field.value ? (
                                            <div className="mt-2 relative">
                                                <div className="relative aspect-4/3 rounded-md overflow-hidden border border-border bg-primary/5 flex flex-col items-center justify-center p-4">
                                                    <FileText className="h-12 w-12 text-primary" />
                                                    <Link to={field.value} target="_blank" className="flex items-center mt-2 text-primary hover:underline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View PDF
                                                    </Link>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePdf(field.onChange)}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                                                    aria-label="Remove PDF"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                                                <DialogTrigger>
                                                    <div
                                                        className={cn(
                                                            buttonVariants({
                                                                size: "icon",
                                                            }),
                                                            "size-8"
                                                        )}
                                                    >
                                                        <Paperclip className="size-4" />
                                                        <span className="sr-only">Select your files</span>
                                                    </div>
                                                    <span className="pl-2">Choose PDF</span>
                                                </DialogTrigger>
                                                <DialogContent
                                                    className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                    onInteractOutside={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <DialogHeader>
                                                        <DialogTitle className="mb-3 text-left">Choose PDF From Gallery</DialogTitle>
                                                        <div className="upload dialog">
                                                            <GalleryPage
                                                                isGalleryPage={false}
                                                                activeTab="pdfs"
                                                                onImageSelect={(pdfUrl) =>
                                                                    handlePdfSelect(pdfUrl as string || '', field.onChange)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        Select a PDF.
                                                    </DialogDescription>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <CardHeader className="pt-6 pb-2">
                    <CardTitle>Tour Settings</CardTitle>
                    <CardDescription>Configure additional settings for the tour</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="enquiry"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Enable Enquiries
                                    </FormLabel>
                                    <FormDescription>
                                        Allow users to send inquiries about this tour
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                </CardContent>
            </CardContent>
        </Card>
    );
};

export default TourBasicInfo;
