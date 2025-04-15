import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Image as ImageIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import { UseFormReturn } from 'react-hook-form';

import clsx from "clsx";

interface GalleryItem {
    _id?: string;
    image: string | { image: string };
}

interface TourGalleryProps {
    form: UseFormReturn<any>;
    imageDialogOpen: boolean;
    setImageDialogOpen: (open: boolean) => void;
    imageArray: GalleryItem[];
    handleGalleryImage: (imageUrl: string) => void;
    handleRemoveImageGallery: (index: number) => void;
}

const TourGallery: React.FC<TourGalleryProps> = ({
    form,
    imageDialogOpen,
    setImageDialogOpen,
    imageArray,
    handleGalleryImage,
    handleRemoveImageGallery
}) => {
    const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, 'loading' | 'error' | 'success'>>({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);

    // Update form values when imageArray changes
    useEffect(() => {
        // Reset the form gallery field to ensure clean state
        form.setValue('gallery', []);

        // Set values for each image in the array
        imageArray.forEach((imageItem, index) => {
            if (imageItem) {
                form.setValue(`gallery.${index}.image`, imageItem);
                // Initialize loading state for new images
                setImageLoadStatus(prev => ({ ...prev, [index]: 'loading' }));
            }
        });
    }, [imageArray, form]);



    // Handle image load events
    const handleImageLoad = (index: number) => {
        setImageLoadStatus(prev => ({ ...prev, [index]: 'success' }));
    };

    const handleImageError = (index: number) => {
        setImageLoadStatus(prev => ({ ...prev, [index]: 'error' }));
    };


    const goNext = () => {
        setSelectedIndex((prev) => (prev + 1) % imageArray.length);
    };

    const goPrev = () => {
        setSelectedIndex((prev) =>
            prev === 0 ? imageArray.length - 1 : prev - 1
        );
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b bg-secondary pb-6">
                <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Tour Gallery</CardTitle>
                </div>
                <CardDescription>
                    Add beautiful images to showcase your tour
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-md font-medium">Gallery Images</h3>
                    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Images</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[65%] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Gallery</DialogTitle>
                            </DialogHeader>
                            <GalleryPage
                                isGalleryPage={false}
                                onImageSelect={(imageUrl) =>
                                    handleGalleryImage(imageUrl)
                                }
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {imageArray.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {imageArray.map((imageItem, index) => (
                            <div
                                key={index}
                                className="relative group overflow-hidden rounded-lg border border-border transition-all hover:shadow-md cursor-pointer"
                                onClick={() => {
                                    setSelectedIndex(index);
                                    setOpen(true);
                                }}
                            >
                                {imageLoadStatus[index] === "error" ? (
                                    <div className="aspect-video w-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                        <p className="text-xs mt-2">Failed to load</p>
                                    </div>
                                ) : (
                                    <img
                                        src={typeof imageItem === 'string' ? imageItem : imageItem.image}
                                        alt={`Gallery ${index}`}
                                        className="aspect-video w-full object-cover transition-all"
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                    />
                                )}

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImageGallery(index);
                                    }}
                                    aria-label="Remove image"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed border-border text-center bg-secondary">
                        <div className="bg-primary/10 p-3 rounded-full mb-3">
                            <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">No images added yet</h3>
                        <p className="text-muted-foreground mb-5 max-w-md">Add beautiful images to showcase your tour and attract potential customers</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span>Add First Image</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[65%] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Gallery</DialogTitle>
                                </DialogHeader>
                                <GalleryPage
                                    isGalleryPage={false}
                                    onImageSelect={(imageUrl) =>
                                        handleGalleryImage(imageUrl)
                                    }
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-3xl p-4 flex flex-col items-center gap-4">
                        {/* Image */}
                        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
                        <DialogDescription className="sr-only">
                            A full screen image viewer with next/previous controls.
                        </DialogDescription>
                        <div className="relative w-full h-[60vh] flex items-center justify-center bg-muted rounded-md">
                            {imageArray[selectedIndex] ? (
                                <img
                                    src={typeof imageArray[selectedIndex] === 'string' ? imageArray[selectedIndex] : imageArray[selectedIndex].image}
                                    alt={`Image ${selectedIndex}`}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            )}

                            {/* Prev/Next buttons */}
                            <Button
                                variant="ghost"
                                className="absolute left-2 top-1/2 -translate-y-1/2"
                                onClick={goPrev}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={goNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-2">
                            {imageArray.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIndex(i)}
                                    className={clsx(
                                        "w-3 h-3 rounded-full",
                                        selectedIndex === i
                                            ? "bg-primary"
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                                    )}
                                />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default TourGallery;
