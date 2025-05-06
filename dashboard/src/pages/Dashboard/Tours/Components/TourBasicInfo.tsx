import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { JSONContent } from "novel";
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Eye, FileText, HelpCircle, Paperclip, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import MultipleSelector, { Option } from '@/userDefinedComponents/MultipleSelector';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

interface TourBasicInfoProps {
    form: UseFormReturn<any>;
    tripCode: string | undefined;
    handleGenerateCode: () => string;
    editorContent: JSONContent;
    onEditorContentChange: (content: JSONContent) => void;
    categoryOptions: Option[];
    imageDialogOpen: boolean;
    setImageDialogOpen: (open: boolean) => void;
    handleImageSelect: (imageUrl: string, onChange: (value: string) => void) => void;
    handleRemoveImage: (onChange: (value: string) => void) => void;
    pdfDialogOpen: boolean;
    setPdfDialogOpen: (open: boolean) => void;
    handlePdfSelect: (pdfUrl: string, onChange: (value: string) => void) => void;
    handleRemovePdf: (onChange: (value: string) => void) => void;
}

const TourBasicInfo: React.FC<TourBasicInfoProps> = ({
    form,
    tripCode,
    handleGenerateCode,
    editorContent,
    onEditorContentChange,
    categoryOptions,
    imageDialogOpen,
    setImageDialogOpen,
    handleImageSelect,
    handleRemoveImage,
    pdfDialogOpen,
    setPdfDialogOpen,
    handlePdfSelect,
    handleRemovePdf
}) => {

    const params = useParams();
    const singleTour = params.tourId !== undefined;
    return (
        <Card className="shadow-sm">
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
                                {
                                    singleTour ?

                                        <FormControl className="relative">
                                            <Input
                                                type="text"
                                                className="w-full uppercase"
                                                {...field}
                                                placeholder='Trip Code'
                                                disabled
                                            />

                                        </FormControl> :
                                        <>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    className="w-full uppercase"
                                                    {...field}
                                                    placeholder='Trip Code'
                                                    // value={tripCode}
                                                    disabled

                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const generatedCode = handleGenerateCode();
                                                    field.onChange(generatedCode);
                                                }}
                                            >
                                                Generate
                                            </Button>
                                        </>

                                }

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
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            defaultOptions={categoryOptions}
                                            placeholder="Select Category"
                                            className="w-full"
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
                                    placeholder='Small Tour Description to be used in listing page'
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <div className="prose min-h-[200px] max-w-full rounded-md border border-input">
                                    <Editor
                                        initialValue={editorContent}
                                        onContentChange={(content) => {
                                            onEditorContentChange(content);
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
                    <div className="w-[100%] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">

                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <FormField
                                control={form.control}
                                name="coverImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image <br /></FormLabel>
                                        {field.value ? (
                                            <div className="mt-2 relative">
                                                <Link to={field.value} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={field.value}
                                                        alt="Selected Cover Image"
                                                        className="rounded-md w-full "

                                                    />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(field.onChange)}
                                                    className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        ) : (
                                            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                                                <DialogTrigger >
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
                                                    <span className="pl-2">Choose Image</span></DialogTrigger>
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
                                                                onImageSelect={(imageUrl) =>
                                                                    handleImageSelect(imageUrl, field.onChange)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        Select a Image.
                                                    </DialogDescription>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className='w-[100%] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                        <div className="flex flex-col min-h-20 space-y-1.5 p-6 relative">
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PDF<br /></FormLabel>
                                        {field.value ? (
                                            <div className="mt-2 relative">
                                                <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-border bg-primary/5 flex flex-col items-center justify-center p-4">
                                                    <FileText className="h-16 w-16 text-primary/80 mb-2" />
                                                    <iframe src={field.value} width="100%" height="300px" />

                                                    <div className="text-center">
                                                        <p className="text-xs font-semibold">PDF Document</p>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-3 text-xs gap-1 hover:bg-primary/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(field.value, '_blank');
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View PDF
                                                    </Button>
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
                                                <DialogTrigger >
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
                                                    <span className="pl-2">Choose PDF</span></DialogTrigger>
                                                <DialogContent
                                                    className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                    onInteractOutside={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <DialogHeader>
                                                        <DialogTitle className="mb-3 text-left">Choose pdf From Gallery</DialogTitle>
                                                        <div className="upload dialog">
                                                            <GalleryPage
                                                                isGalleryPage={false}
                                                                activeTab="pdfs"
                                                                onImageSelect={(pdfUrl) =>
                                                                    handlePdfSelect(pdfUrl, field.onChange)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        Select a Pdf.
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

                <CardHeader>
                    <CardTitle>Enquiry</CardTitle>
                    <CardDescription>Turn on Enquiry for the tour.</CardDescription>
                </CardHeader>
                <CardContent>

                    <FormField
                        control={form.control}
                        name="enquiry"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Enquiry emails
                                    </FormLabel>
                                    <FormDescription>
                                        Lets users send you emails about tours details.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
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
