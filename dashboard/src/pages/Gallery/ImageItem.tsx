import { Button } from "@/components/ui/button";
import { ImageResource } from "@/Provider/types";
import { XIcon } from "lucide-react";
import { forwardRef, memo } from "react";

interface ImageItemProps {
    image: ImageResource;
    onDelete: (imageId: string) => void;
    onSelect: (imageUrl: string) => void;
}

const ImageItem = memo(
    forwardRef<HTMLDivElement, ImageItemProps>(
        ({ image, onDelete, onSelect, ...props }, ref) => {
            return (
                <div
                    className="relative group break-inside-avoid mb-2 cursor-pointer"
                    ref={ref}
                    {...props}
                    onClick={() => onSelect(image.url)}
                >
                    <img
                        src={image.secure_url ? image.secure_url : image.url}
                        alt={image.display_name ? image.display_name : image.asset_id}
                        className="rounded-md w-full"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute w-4 h-4 transition ease-in-out delay-150 group-hover:opacity-100 opacity-0 top-2 right-2 bg-background/80 hover:bg-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(image.asset_id);
                        }}
                    >
                        <XIcon className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            );
        }
    )
);

export default ImageItem;
