import { useEffect, useMemo, useState } from "react";
import ImageGrid from "./ImageGrid";
import UploadSheet from "./UploadSheet";
import { addMedia, deleteMedia, getAllMedia } from "@/http";
import { toast } from "@/components/ui/use-toast";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageResource } from "@/Provider/types";
import { getUserId } from "@/util/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import ImageDetail from "./ImageDetail";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, FileVideo, FileArchive, Upload, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryPageProps {
    onImageSelect: (image: string | string[] | null) => void; // Adjusted type for the callback
    isGalleryPage: boolean;
    imageUrl?: string;
    activeTab?: string | null;
}

const GalleryPage = ({ onImageSelect, activeTab }: GalleryPageProps) => {
    const userId = getUserId();
    const [tab, setTab] = useState<string>(() => activeTab ?? "images");
    const [files, setFiles] = useState<File[] | null>(null);
    const queryClient = useQueryClient();
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [isGalleryPage, setIsGalleryPage] = useState<boolean>(false);
    const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabFromQuery = activeTab ? activeTab : queryParams.get('tab') || 'images';
        onTabChange(tabFromQuery);

    }, [location.search, activeTab]);

    const handleTabClick = (tabValue: string) => {
        onTabChange(tabValue);
        // Update URL with the new tab value
        navigate(`?tab=${tabValue}`);
    };

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
        queryFn: ({ pageParam = 1, queryKey }) => {
            const MediaType: string = queryKey[1]; // This will be either 'image', 'video', or 'pdf'
            return getAllMedia({ pageParam, mediaType: MediaType });
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor ?? null;  // Ensure `nextCursor` is returned properly
        },
        initialPageParam: 1,
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
        mutationFn: async ({ imageIds, mediaType }: { imageIds: string | string[], mediaType: string }) => {
            return await deleteMedia(userId!, imageIds, mediaType);
        },
        onSuccess: (data, { imageIds, mediaType }) => { // Use the second parameter for `mediaType`
            // Query key based on media type
            queryClient.invalidateQueries({
                queryKey: ['media']
            });
            setSelectedMediaUrls((prevMedia) =>
                prevMedia.filter((media) => !imageIds.includes(media.public_id)) // Remove deleted media
            );
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

    const handleMediaDeleteArray = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const imageIds = selectedMediaUrls.map((item) => item.public_id);
        const mediaType = selectedMediaUrls[0]?.mediaType === "image" ? 'images' : selectedMediaUrls[0]?.mediaType === "video" ? 'videos' : 'PDF'
        deleteMutation.mutate({ imageIds, mediaType });
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

        // Update the selected image
        setSelectedImage(image);
        onImageSelect(image);
    };

    const onTabChange = (value: string) => {
        setTab(value);
        setSelectedMediaUrls([]);
    }

    const handleClose = () => {
        //@ts-expect-error
        setSelectedImage(null);
    };

    const renderTabContent = () => (
        <div className={`grid gap-4 ${selectedImage && isGalleryPage ? 'md:grid-cols-3' : 'grid-cols-1'}`}>
            <div className="col-span-2">
                {isError ? (
                    <Card className="bg-destructive/10 border-destructive/30">
                        <CardContent className="pt-6">
                            <div className="text-destructive text-center">
                                <p className="font-semibold">Error loading media</p>
                                <p className="text-sm">Please try again or contact support</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

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
                    setSelectedMediaUrls={setSelectedMediaUrls}
                />
            </div>

            {isGalleryPage && selectedImage && selectedMediaUrls && selectedMediaUrls.length === 0 ? (
                <Card className="shadow-xs border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center">
                            {tab === 'images' && <Image className="w-5 h-5 mr-2 text-primary" />}
                            {tab === 'videos' && <FileVideo className="w-5 h-5 mr-2 text-primary" />}
                            {tab === 'pdfs' && <FileArchive className="w-5 h-5 mr-2 text-primary" />}
                            Media Details
                        </CardTitle>
                        <CardDescription>Edit details for the selected item</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ImageDetail
                            files={files}
                            setFiles={setFiles}
                            setSelectedImage={setSelectedImage}
                            onDelete={handleDelete}
                            handleUpload={handleUpload}
                            handleClose={handleClose}
                            imageUrl={selectedImage}
                            userId={userId}
                        />
                    </CardContent>
                </Card>
            ) : null}

            {isGalleryPage && selectedImage && selectedMediaUrls && selectedMediaUrls.length > 0 && (
                <Card className="shadow-xs border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <Trash2 className="w-5 h-5 mr-2 text-destructive" />
                            Bulk Actions
                        </CardTitle>
                        <CardDescription>
                            {selectedMediaUrls.length} items selected
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="destructive"
                            onClick={(e) => handleMediaDeleteArray(e)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected Items
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 15 }).map((_, index) => (
                                <div key={index} className="flex flex-col space-y-2">
                                    <Skeleton className="h-[125px] w-full rounded-md" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card className="shadow-xs border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                    <div className="flex items-center">
                        {tab === 'images' && <Image className="w-5 h-5 mr-2 text-primary" />}
                        {tab === 'videos' && <FileVideo className="w-5 h-5 mr-2 text-primary" />}
                        {tab === 'pdfs' && <FileArchive className="w-5 h-5 mr-2 text-primary" />}
                        Media Gallery
                        <Badge variant="outline" className="ml-2">
                            {allMedia?.length || 0} items
                        </Badge>
                    </div>
                    <UploadSheet
                        files={files}
                        setFiles={setFiles}
                        handleUpload={handleUpload}
                        dropZoneConfig={dropZoneConfig}
                    >
                        <Button variant="outline" size="sm" className="gap-1">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Files
                        </Button>
                    </UploadSheet>
                </CardTitle>
                <CardDescription>Manage your media files for tours and content</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Tabs
                    value={tab}
                    onValueChange={onTabChange}
                    className="w-full"
                >
                    <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex mb-4">
                        <TabsTrigger
                            value="images"
                            onClick={() => handleTabClick('images')}
                            className={cn("flex items-center gap-2", tab === 'images' ? 'text-primary' : '')}
                        >
                            <Image className="h-4 w-4" />
                            Images
                        </TabsTrigger>
                        <TabsTrigger
                            value="videos"
                            onClick={() => handleTabClick('videos')}
                            className={cn("flex items-center gap-2", tab === 'videos' ? 'text-primary' : '')}
                        >
                            <FileVideo className="h-4 w-4" />
                            Videos
                        </TabsTrigger>
                        <TabsTrigger
                            value="pdfs"
                            onClick={() => handleTabClick('pdfs')}
                            className={cn("flex items-center gap-2", tab === 'pdfs' ? 'text-primary' : '')}
                        >
                            <FileArchive className="h-4 w-4" />
                            PDFs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="images" className="mt-0">
                        {renderTabContent()}
                    </TabsContent>
                    <TabsContent value="videos" className="mt-0">
                        {renderTabContent()}
                    </TabsContent>
                    <TabsContent value="pdfs" className="mt-0">
                        {renderTabContent()}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default GalleryPage;
