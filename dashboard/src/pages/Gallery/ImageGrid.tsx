import React, { useCallback, useRef } from "react";
import ImageItem from "./ImageItem";
import { ImageResource } from "@/Provider/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UseMutationResult } from "@tanstack/react-query";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";

interface ImageGridProps {
    images: ImageResource[];
    onImageSelect: (imageUrl: string) => void;
    onDelete: (imageId: string) => void;
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    uploadingFiles: File[];
    uploadMutation: UseMutationResult<any, Error, FormData, void>; // Update type here
}

const ImageGrid: React.FC<ImageGridProps> = ({ uploadingFiles, uploadMutation, images, onImageSelect, onDelete, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage }) => {
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
        <>

            <div className="grid grid-cols-2  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">

                {uploadingFiles.length > 0 && uploadMutation.isPending && (
                    <>
                        {uploadingFiles.map((file, index) => (
                            <div key={index} className="flex flex-col items-center justify-center">
                                <Skeleton className="h-[125px] w-[100%] rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[100%]" />
                                    <Skeleton className="h-4 w-[100%]" />
                                </div>
                            </div>
                        ))}
                    </>
                )}


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
        </>

    );
};

export default ImageGrid;
