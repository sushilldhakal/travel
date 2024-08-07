import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { addImages, deleteImage, getAllImages } from '@/http/api';
import { getUserId } from '@/util/AuthLayout';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paperclip, UploadIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { DropzoneOptions } from 'react-dropzone';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/userDefinedComponents/FileUploader';
interface ImageResource {
    asset_id: string;
    secure_url: string;
    display_name: string;
    description: string;
    url: string;
    uploadedAt: Date;
}

const FileSvgDraw = () => {
    return (
        <>
            <svg
                className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
            </svg>
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
                &nbsp; or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or JPEG
            </p>
        </>
    );
};



const GalleryPage = ({ onImageSelect }) => {
    const userId = getUserId();
    const [files, setFiles] = useState<File[] | null>(null);
    const queryClient = useQueryClient();
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

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
            return addImages(formData, userId); // Ensure this function accepts FormData
        },
        onMutate: (formData: FormData) => {
            const filesBeingUploaded = Array.from(formData.entries())
                .filter(([key]) => key === 'imageList' || key === 'pdfList')
                .map(([, file]) => file as File);

            setUploadingFiles(prev => [...prev, ...filesBeingUploaded]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            // Optionally refetch or fetch the next page to ensure data is up-to-date
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
                title: 'Upload Error',
                description: `There was an error uploading your files. Please try again later. ${error.message}`,
                variant: 'destructive',
            });
        },
        onSettled: () => {
            setUploadingFiles([]); // Clear on settled to ensure all cases are handled
        }
    });

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

    const handleUpload = () => {
        if (files && files.length > 0) {
            const formData = new FormData();

            // Separate files based on their types
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    formData.append('imageList', file);
                } else if (file.type === 'application/pdf') {
                    formData.append('pdfList', file);
                }
            });

            if (!userId) throw new Error('User ID is null');

            uploadMutation.mutate(formData); // Pass FormData to the mutation
            setFiles([]); // Clear files after uploading
        }
    };

    const dropZoneConfig: DropzoneOptions = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png'],
            'application/pdf': ['.pdf']
        },
        multiple: true,
        maxFiles: 10,
        maxSize: 1 * 1024 * 1024, // 1 MB
        onDrop: acceptedFiles => setFiles(acceptedFiles),
    };


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
        <div>
            <div className="flex items-center justify-between top-12 right-5 absolute">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <UploadIcon className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Upload Images/PDF</SheetTitle>
                            <SheetDescription>
                                Upload your images or PDFs here. Click "Upload" when you're ready.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid items-center gap-4">
                                <FileUploader
                                    value={files}
                                    onValueChange={setFiles}
                                    dropzoneOptions={dropZoneConfig}
                                >
                                    <FileInput>
                                        <div className="flex items-center justify-center h-32 w-full border bg-background rounded-md">
                                            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                                                {files && files.length > 0 ? files.length + " files selected" : "Click to upload"}   <FileSvgDraw />
                                            </div>
                                        </div>
                                    </FileInput>
                                    <FileUploaderContent className="grid grid-rows-3 grid-cols-3 grid-flow-row gap-2">
                                        {files &&
                                            files.length > 0 &&
                                            files.map((file, i) => (
                                                <FileUploaderItem key={i} index={i} className="size-20 p-0 rounded-md overflow-hidden"
                                                    aria-roledescription={`file ${i + 1} containing ${file.name}`}>
                                                    <Paperclip className="h-4 w-4 stroke-current" />
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        height={80}
                                                        width={80}
                                                        className="size-20 p-0 object-cover"
                                                    />
                                                </FileUploaderItem>
                                            ))}
                                    </FileUploaderContent>
                                </FileUploader>
                            </div>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button onClick={handleUpload} type="button">Upload</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
            <div className=" grid grid-cols-2  sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">

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
                {allImages.map((image, index) => {
                    const isLastImage = index === allImages.length - 1;
                    return (
                        <div
                            key={image.secure_url ? image.asset_id : image.url}
                            className="relative group"
                            ref={isLastImage ? lastImageElementRef : null}
                            onClick={() => onImageSelect(image.secure_url)}
                        >
                            <img
                                src={image.secure_url ? image.secure_url : image.url}
                                alt={image.display_name ? image.display_name : image.asset_id}
                                width={300}
                                height={300}
                                className="aspect-square object-cover rounded-md"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                                onClick={() => handleDelete(image.asset_id)}
                            >
                                <XIcon className="w-4 h-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    )
                }

                )}
            </div>
            {isFetchingNextPage && <div>Loading more images...</div>}
            {!isFetchingNextPage && hasNextPage && (
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    Load More
                </Button>
            )}

            {allImages.length === 0 && <div>Please Upload Images.</div>}
        </div>
    );
};

export default GalleryPage;
