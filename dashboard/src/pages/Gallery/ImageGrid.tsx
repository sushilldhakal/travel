import React, { useCallback, useRef } from "react";
import ImageItem from "./ImageItem";
import { ImageResource } from "@/Provider/types";
import ImageDetail from "./ImageDetail";

interface ImageGridProps {
    images: ImageResource[];
    onImageSelect: (imageUrl: string) => void;
    onDelete: (imageId: string) => void;
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageSelect, onDelete, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage }) => {
    const observer = useRef<IntersectionObserver>();

    const lastImageElementRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading || isFetchingNextPage) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <ImageItem
                    key={image.secure_url ? image.asset_id : image.url}
                    image={image}
                    onDelete={onDelete}
                    onSelect={onImageSelect}
                    ref={index === images.length - 1 ? lastImageElementRef : null}
                />
            ))}
            {isFetchingNextPage && (
                <div className="w-full text-center py-4">
                    <span>Loading more images...</span>
                </div>
            )}

        </div>
    );
};

export default ImageGrid;
