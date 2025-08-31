import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Plus, ImageIcon, ChevronLeft, ChevronRight, Play, Video } from 'lucide-react';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';
import { GalleryItem } from '@/Provider/types';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import { Button } from '@/components/ui/button';


const TourGallery: React.FC = () => {
    const { watch, setValue } = useFormContext();
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);

    // This can now handle both strings and gallery item objects
    const [imageArray, setImageArray] = useState<(string | GalleryItem)[]>([]);
    const [imageLoadStatus, setImageLoadStatus] = useState<{ [key: number]: 'success' | 'error' }>({});

    // Helper function to detect if an item is a video
    const isVideo = (url: string): boolean => {
        // Check file extension
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
        const urlLower = url.toLowerCase();

        // Check if the URL contains video in the path (common for CDNs like Cloudinary)
        const isVideoInPath = urlLower.includes('/video/') || urlLower.includes('/video_upload/');

        // Check if the URL ends with a video extension
        const hasVideoExtension = videoExtensions.some(ext => urlLower.endsWith(ext));

        return isVideoInPath || hasVideoExtension;
    };

    // Get the URL from a gallery item or string
    const getItemUrl = (item: string | GalleryItem): string => {
        return typeof item === 'string' ? item : item.image;
    };

    // Sync gallery from form values to local state
    useEffect(() => {
        const galleryValue = watch('gallery');
        if (galleryValue && Array.isArray(galleryValue) && galleryValue.length > 0) {
            setImageArray(galleryValue);
        }
    }, [watch]);



    const handleImageLoad = (index: number) => {
        setImageLoadStatus(prev => ({ ...prev, [index]: 'success' }));
    };

    const handleImageError = (index: number) => {
        setImageLoadStatus(prev => ({ ...prev, [index]: 'error' }));
    };



    const handleGalleryImage = (imageUrl: string | string[]) => {
        setImageArray((prevImageArray) => {
            // Ensure we're working with an array of URLs
            const newImageUrls = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

            // Get current image URLs to check for duplicates
            const existingUrls = prevImageArray.map(item =>
                typeof item === 'string' ? item : item.image
            );

            // Filter out any URLs that already exist in the gallery
            const uniqueNewUrls = newImageUrls.filter(url =>
                !existingUrls.includes(url)
            );

            // If no new unique images, return the current array
            if (uniqueNewUrls.length === 0) {
                return prevImageArray;
            }

            // Create gallery items from unique new images
            // IMPORTANT: Don't use _id for new items as MongoDB needs a specific format
            const newGalleryItems = uniqueNewUrls.map(url => ({
                // Use a temporary client-side ID that won't be sent to the server
                // The server will generate proper ObjectIds
                tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                image: url,
                sortOrder: 0,
                isFeatured: false
            }));

            // Update form's gallery value with deduped array
            const updatedArray = [...prevImageArray, ...newGalleryItems];
            setValue('gallery', updatedArray, { shouldDirty: true });
            return updatedArray;
        });
    };

    const handleRemoveImageGallery = (index: number, event?: React.MouseEvent) => {
        event?.preventDefault();
        // Update the state array
        setImageArray((prevImageArray) => {
            const filtered = prevImageArray.filter((_, i) => i !== index);
            // Update form's gallery value
            setValue('gallery', filtered, { shouldDirty: true });
            return filtered;
        });
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
        <Card className="shadow-xs">
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
                                    imageUrl && handleGalleryImage(imageUrl)
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
                                {imageLoadStatus[index] === "error" && !isVideo(getItemUrl(imageItem)) ? (
                                    <div className="aspect-video w-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                        <p className="text-xs mt-2">Failed to load</p>
                                    </div>
                                ) : isVideo(getItemUrl(imageItem)) ? (
                                    <div className="aspect-video w-full relative group">
                                        <video
                                            src={getItemUrl(imageItem)}
                                            className="w-full h-full object-cover"
                                            onLoadedData={() => handleImageLoad(index)}
                                            onError={() => handleImageError(index)}
                                            muted
                                            playsInline
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                            <Play className="h-12 w-12 text-white opacity-80 group-hover:opacity-100" />
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                            <Video className="h-3 w-3" />
                                            <span>Video</span>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={getItemUrl(imageItem)}
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
                                        imageUrl && handleGalleryImage(imageUrl)
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
                                isVideo(getItemUrl(imageArray[selectedIndex])) ? (
                                    <video
                                        src={getItemUrl(imageArray[selectedIndex])}
                                        className="max-h-full max-w-full object-contain"
                                        controls
                                        autoPlay
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={getItemUrl(imageArray[selectedIndex])}
                                        alt={`Image ${selectedIndex}`}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )
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