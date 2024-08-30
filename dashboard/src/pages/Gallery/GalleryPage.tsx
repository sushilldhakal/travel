import { useEffect, useMemo, useState } from "react";
import ImageGrid from "./ImageGrid";
import UploadSheet from "./UploadSheet";
import { addMedia, deleteMedia, getAllMedia } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageResource } from "@/Provider/types";
import { getUserId } from "@/util/AuthLayout";
import { Skeleton } from "@/components/ui/skeleton";
import ImageDetail from "./ImageDetail";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GalleryPageProps {
    onImageSelect: (image: string) => void; // Adjusted type for the callback
    isGalleryPage: boolean;
    imageUrl?: string;
}

const GalleryPage = ({ onImageSelect }: GalleryPageProps) => {
    const userId = getUserId();
    const [tab, setTab] = useState("images");
    const [files, setFiles] = useState<File[] | null>(null);
    const queryClient = useQueryClient();
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
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
        queryKey: ["media", tab], // Dynamic media type based on tab
        queryFn: ({ pageParam = null, queryKey }) => {
            const MediaType: string = queryKey[1]; // This will be either 'image', 'video', or 'pdf'
            return getAllMedia({ pageParam, mediaType: MediaType });
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
        initialPageParam: null,
    });
    const allMedia = useMemo(() => {
        const mediaUrls = new Set<string>();
        const mergedMedia: ImageResource[] = [];

        data?.pages.forEach(page => {
            // Filter based on tab to match 'image', 'pdf', or 'video' types
            page.resources
                .forEach((resource: ImageResource) => {
                    if (!mediaUrls.has(resource.url)) {
                        mediaUrls.add(resource.url);
                        mergedMedia.push(resource);
                    }
                });
        });
        return mergedMedia;
    }, [data, tab]);
    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            if (!userId) throw new Error('User ID is null');
            return addMedia(formData, userId);
        },
        onMutate: (formData: FormData) => {
            const filesBeingUploaded = Array.from(formData.entries())
                .filter(([key]) => key === 'imageList' || key === 'pdfList')
                .map(([, file]) => file as File);

            setUploadingFiles(prev => [...prev, ...filesBeingUploaded]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media', tab] });
            queryClient.refetchQueries({ queryKey: ['media', tab] });
            setUploadingFiles([]);
            setFiles([]);
            toast({
                title: 'Files uploaded successfully',
                description: 'Your files have been uploaded.',
            });
        },
        onError: (error) => {
            setUploadingFiles([]);
            if (error.message === 'Request failed with status code 410') {
                toast({
                    title: 'please add Cloudinary API key to setting',
                    description: ` ${error}`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Error uploading files',
                    description: `There was an error uploading your files: ${error.message}`,
                    variant: 'destructive',
                });
            }

        },
    });

    const handleUpload = () => {
        if (!files || files.length === 0) return;

        const formData = new FormData();

        files.forEach((file) => {
            if (file.type === 'application/pdf') {
                formData.append('pdf', file);
            } else if (file.type.startsWith('video/')) {  // Check for video types
                formData.append('video', file);
            } else if (file.type.startsWith('image/')) {  // Check for image types
                formData.append('imageList', file);
            } else {
                console.warn('Unsupported file type:', file.type);
            }
        });

        uploadMutation.mutate(formData);
    };

    const deleteMutation = useMutation({
        mutationFn: ({ imageIds, mediaType }: { imageIds: string | string[], mediaType: string }) => deleteMedia(userId!, imageIds, mediaType),
        onSuccess: ({ data, mediaType }) => {
            queryClient.invalidateQueries({ queryKey: [mediaType] });
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

    const handleDelete = async (imageIds: string | string[], mediaType: string) => {
        try {
            if (userId) {
                await deleteMutation.mutateAsync({ imageIds, mediaType });
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
            "video/mp4": [".mp4"],
            "video/mpeg": [".mpeg"],
            "video/webm": [".webm"],
        },
        maxFiles: 10,
        multiple: true,
    };

    const handleImageSelect = (image: string) => {
        setSelectedImage(image);
        onImageSelect(image); // Correctly pass the selected image to the callback
    };

    const onTabChange = (value: string) => {
        setTab(value);
    }
    const handleClose = () => {
        //@ts-expect-error
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
    return (
        <>
            <div className="m">
                <UploadSheet
                    files={files}
                    setFiles={setFiles}
                    handleUpload={handleUpload}
                    dropZoneConfig={dropZoneConfig}
                />
            </div>
            <Tabs value={tab} onValueChange={onTabChange} className="w-full">
                <TabsList>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Video</TabsTrigger>
                    <TabsTrigger value="pdfs">PDF</TabsTrigger>
                </TabsList>
                <TabsContent value="images">
                    <div className={`grid gap-2 ${selectedImage && isGalleryPage ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        <div className="col-span-2">

                            {
                                isError ? <div className="text-red-600">Error loading images</div> : null
                            }
                            <ImageGrid
                                images={allMedia}
                                onImageSelect={handleImageSelect}
                                onDelete={handleDelete}
                                isLoading={isLoading}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                                fetchNextPage={fetchNextPage}
                                uploadingFiles={uploadingFiles}
                                uploadMutation={uploadMutation}
                            />
                        </div>
                        <div>
                            {
                                isGalleryPage && selectedImage ? <ImageDetail files={files}
                                    setFiles={setFiles}
                                    setSelectedImage={setSelectedImage}
                                    onDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    handleClose={handleClose}
                                    imageUrl={selectedImage}
                                    userId={userId}
                                /> : null

                            }
                            {/* Updated prop name */}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="videos">
                    <div className={`grid gap-2 ${selectedImage && isGalleryPage ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        <div className="col-span-2">

                            {
                                isError ? <div className="text-red-600">Error loading images</div> : null
                            }
                            <ImageGrid
                                images={allMedia}
                                onImageSelect={handleImageSelect}
                                onDelete={handleDelete}
                                isLoading={isLoading}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                                fetchNextPage={fetchNextPage}
                                uploadingFiles={uploadingFiles}
                                uploadMutation={uploadMutation}
                            />
                        </div>
                        <div>
                            {
                                isGalleryPage && selectedImage ? <ImageDetail files={files}
                                    setFiles={setFiles}
                                    setSelectedImage={setSelectedImage}
                                    onDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    handleClose={handleClose}
                                    imageUrl={selectedImage}
                                    userId={userId}
                                /> : null

                            }
                            {/* Updated prop name */}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="pdfs">
                    <div className={`grid gap-2 ${selectedImage && isGalleryPage ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        <div className="col-span-2">

                            {
                                isError ? <div className="text-red-600">Error loading images</div> : null
                            }
                            <ImageGrid
                                images={allMedia}
                                onImageSelect={handleImageSelect}
                                onDelete={handleDelete}
                                isLoading={isLoading}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                                fetchNextPage={fetchNextPage}
                                uploadingFiles={uploadingFiles}
                                uploadMutation={uploadMutation}
                            />
                        </div>
                        <div>
                            {
                                isGalleryPage && selectedImage ? <ImageDetail files={files}
                                    setFiles={setFiles}
                                    setSelectedImage={setSelectedImage}
                                    onDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    handleClose={handleClose}
                                    imageUrl={selectedImage}
                                    userId={userId}
                                /> : null

                            }
                            {/* Updated prop name */}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>


        </>

    );
};

export default GalleryPage;
