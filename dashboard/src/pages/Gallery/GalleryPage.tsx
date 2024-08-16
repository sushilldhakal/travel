import { useEffect, useMemo, useState } from "react";
import ImageGrid from "./ImageGrid";
import UploadSheet from "./UploadSheet";
import { addImages, deleteImage, getAllImages } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageResource } from "@/Provider/types";
import { getUserId } from "@/util/AuthLayout";
import { Skeleton } from "@/components/ui/skeleton";
import ImageDetail from "./ImageDetail";
import { useLocation } from "react-router-dom";

interface GalleryPageProps {
    onImageSelect: (image: string) => void; // Adjusted type for the callback
    isGalleryPage: boolean;
    imageUrl?: string;
}

const GalleryPage = ({ onImageSelect }: GalleryPageProps) => {
    const userId = getUserId();
    const [files, setFiles] = useState<File[] | null>(null);
    const queryClient = useQueryClient();
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isGalleryPage, setIsGalleryPage] = useState<boolean>(false);
    const location = useLocation();


    useEffect(() => {
        if (location.pathname === '/dashboard/gallery') {
            setIsGalleryPage(true)
        } else {
            // Remove the class if the path does not match
            setIsGalleryPage(false);
        }
    }, [location.pathname]);
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['images'],
        queryFn: ({ pageParam = null }) => getAllImages({ pageParam }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
        initialPageParam: null,
    });

    const allImages = useMemo(() => {
        const allImageUrls = new Set<string>();
        const mergedImages: ImageResource[] = [];

        if (data?.pages) {
            data.pages.forEach(page => {
                page.resources.forEach((image: ImageResource) => {
                    if (!allImageUrls.has(image.secure_url)) {
                        allImageUrls.add(image.secure_url);
                        mergedImages.push(image);
                    }
                });
            });
        }

        return mergedImages;
    }, [data]);

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            if (!userId) throw new Error('User ID is null');
            return addImages(formData, userId);
        },
        onMutate: (formData: FormData) => {
            const filesBeingUploaded = Array.from(formData.entries())
                .filter(([key]) => key === 'imageList' || key === 'pdfList')
                .map(([, file]) => file as File);

            setUploadingFiles(prev => [...prev, ...filesBeingUploaded]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            queryClient.refetchQueries({ queryKey: ['images'] });
            setUploadingFiles([]);
            toast({
                title: 'Files uploaded successfully',
                description: 'Your files have been uploaded.',
            });
        },
        onError: (error) => {
            setUploadingFiles([]);
            toast({
                title: 'Error uploading files',
                description: `There was an error uploading your files: ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const handleUpload = () => {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        files.forEach((file) => {
            if (file.type === 'application/pdf') {
                formData.append('pdfList', file);
            } else {
                formData.append('imageList', file);
            }
        });

        uploadMutation.mutate(formData);
    };

    const deleteMutation = useMutation({
        mutationFn: (imageIds: string | string[]) => deleteImage(userId!, imageIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            toast({
                title: 'Deletion Successful',
                description: 'The selected image/file has been deleted.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Deletion Error',
                description: `There was an error deleting the image/file. Please try again later. ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const handleDelete = async (imageIds: string | string[]) => {
        try {
            if (userId) {
                await deleteMutation.mutateAsync(imageIds);
            } else {
                toast({
                    title: 'User Error',
                    description: 'Cannot find the user. Please logout and login again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: `Error: ${(error as Error).message}`,
                variant: 'destructive',
            });
        }
    };

    const dropZoneConfig = {
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf'],
        },
        maxFiles: 10,
        multiple: true,
    };

    const handleImageSelect = (image: string) => {
        setSelectedImage(image);
        onImageSelect(image); // Correctly pass the selected image to the callback
    };
    const handleClose = () => {
        setSelectedImage(null);
    };

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center justify-center">
                            <Skeleton className="h-[125px] w-[100%] rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[100%]" />
                                <Skeleton className="h-4 w-[100%]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-600">Error loading images</div>;
    }

    return (
        <div className={`grid gap-2 ${selectedImage && isGalleryPage ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <div className="col-span-2">
                <div className="mb-4">
                    <UploadSheet
                        files={files}
                        setFiles={setFiles}
                        handleUpload={handleUpload}
                        dropZoneConfig={dropZoneConfig}
                    />
                </div>
                <ImageGrid
                    images={allImages}
                    onImageSelect={handleImageSelect}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                />
            </div>
            <div>
                {
                    isGalleryPage ? <ImageDetail handleClose={handleClose} imageUrl={selectedImage} /> : null
                }
                {/* Updated prop name */}
            </div>
        </div>
    );
};

export default GalleryPage;
