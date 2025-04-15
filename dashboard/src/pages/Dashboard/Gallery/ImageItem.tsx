import { Button } from "@/components/ui/button";
import { ImageResource } from "@/Provider/types";
import { Circle, CircleCheckBig, XIcon, FileText, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, memo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


interface ImageItemProps {
    image: ImageResource;
    onDelete: (imageId: string, mediaType: 'images' | 'videos' | 'PDF') => void;
    onSelect: (imageUrl: string) => void;
    setSelectedMediaUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageItem = memo(
    forwardRef<HTMLDivElement, ImageItemProps>(
        ({ image, onDelete, setSelectedMediaUrls, onSelect, ...props }, ref) => {
            const [isSelected, setIsSelected] = useState(false);
            const [imageLoaded, setImageLoaded] = useState(false);
            const [imageError, setImageError] = useState(false);


            const handleSelect = (imageUrl: string, mediaType: 'images' | 'videos' | 'PDF', public_id: string) => {
                setSelectedMediaUrls((prevselectedMediaUrls) => {
                    const updatedSelectedImages = prevselectedMediaUrls.filter((item) => item.imageUrl !== imageUrl);
                    if (prevselectedMediaUrls.some((item) => item.imageUrl === imageUrl)) {
                        onSelect(updatedSelectedImages.map((item) => item.imageUrl));
                    } else {
                        updatedSelectedImages.push({ imageUrl, mediaType, public_id });
                        onSelect(updatedSelectedImages.map((item) => item.imageUrl));
                    }
                    return updatedSelectedImages;
                });
            };

            // Helper function to check if the resource is a PDF
            const isPDF = () => {
                // Check multiple conditions to identify PDFs
                return (
                    image.resource_type === "raw" ||
                    image.format === "pdf" ||
                    image.url?.toLowerCase().endsWith('.pdf') ||
                    image.secure_url?.toLowerCase().endsWith('.pdf')
                );
            };

            // Get a display name for the media
            const getDisplayName = () => {
                if (image.display_name) return image.display_name;

                // Extract name from URL if no display name
                const url = image.secure_url || image.url;
                if (url) {
                    const urlParts = url.split('/');
                    let fileName = urlParts[urlParts.length - 1];

                    // Remove query parameters if any
                    fileName = fileName.split('?')[0];

                    // Decode URL-encoded characters
                    try {
                        fileName = decodeURIComponent(fileName);
                    } catch (e) {
                        // If decoding fails, use as is
                    }

                    return fileName;
                }

                return image.public_id || "Untitled";
            };

            return (
                <div
                    className="relative group break-inside-avoid mb-4 cursor-pointer"
                    ref={ref}
                    {...props}
                    onClick={(e) => {
                        // Prevent div click if a button is clicked
                        if (!e.defaultPrevented) {
                            onSelect(image.url);
                        }
                    }}
                >
                    {image.resource_type === "image" && (
                        <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-border bg-muted/20">
                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Skeleton className="h-full w-full absolute" />
                                </div>
                            )}
                            {imageError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-muted-foreground">
                                    <p className="text-sm text-center">Unable to load image</p>
                                </div>
                            ) : (
                                <img
                                    src={image.secure_url ? image.secure_url : image.url}
                                    alt={getDisplayName()}
                                    className={cn(
                                        "rounded-md w-full h-full object-cover transition-opacity",
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    loading="lazy"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                        </div>
                    )}

                    {image.resource_type === "video" && (
                        <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-border">
                            <video
                                src={image.secure_url ? image.secure_url : image.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                controls
                                onClick={() => onSelect(image.url)}
                            />
                        </div>
                    )}

                    {isPDF() && (
                        <>

                            <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-border bg-primary/5 flex flex-col items-center justify-center p-4">

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 text-xs gap-1 hover:bg-primary/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(image.secure_url || image.url, '_blank');
                                    }}
                                ><FileText className="h-16 w-16 text-primary/80 mb-2" />
                                    <iframe src={image.secure_url ? image.secure_url : image.url} width="100%" height="800px" />

                                    <div className="text-center">
                                        <p className="text-xs font-semibold">PDF Document</p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-full">
                                            {getDisplayName()}
                                        </p>
                                    </div>


                                    <Eye className="h-3 w-3 mr-1" />
                                    View PDF
                                </Button>
                            </div>
                        </>
                    )
                    }

                    {/* Item name */}
                    {/* < div className="mt-1 text-xs truncate px-0.5" >
                        {getDisplayName()}
                    </div > */}

                    {/* Select button */}
                    < Button
                        variant="outline"
                        size="icon"
                        className="absolute z-10 w-8 h-8 bg-background/90 border-0 transition ease-in-out top-2 left-2 hover:bg-background/95 shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSelected(!isSelected);
                            handleSelect(image.url, image.resource_type, image.public_id);
                        }}
                    >
                        {isSelected ? <CircleCheckBig className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                        <span className="sr-only">select</span>
                    </Button >

                    {/* Delete button */}
                    < Button
                        variant="ghost"
                        size="icon"
                        className="absolute w-6 h-6 transition ease-in-out delay-150 group-hover:opacity-100 opacity-0 top-2 right-2 bg-background/90 hover:bg-destructive shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(image.public_id, image.resource_type === "image" ? 'images' : image.resource_type === "video" ? 'videos' : 'PDF');
                        }}
                    >
                        <XIcon className="w-3 h-3" />
                        <span className="sr-only">Delete</span>
                    </Button >
                </div >
            );
        }
    )
);

export default ImageItem;
