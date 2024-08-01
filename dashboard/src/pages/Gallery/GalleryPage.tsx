import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { addImages, deleteImage, getAllImages } from '@/http/api';
import { getUserId } from '@/layouts/AuthLayout';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UploadIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
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

const GalleryPage = () => {
    const userId = getUserId();
    const [files, setFiles] = useState<File[]>([]);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['images'],
        queryFn: getAllImages,
    });

    console.log("data:", data)

    // const images = useMemo(() => data ? data.pages.flatMap(page => page?.resources) : [], [data]);

    const uploadMutation = useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach(file => formData.append('file', file));
            if (!userId) throw new Error('User ID is null');
            return addImages(formData, userId);
        },
        onSuccess: () => {
            toast({
                title: 'Files uploaded successfully',
                description: 'Your files have been uploaded.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Upload Error',
                description: `There was an error uploading your files. Please try again later. ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (imageIds: string | string[]) => deleteImage(userId!, imageIds),
        onSuccess: () => {
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
        if (files.length > 0) {
            uploadMutation.mutate(files);
            setFiles([]); // Clear files after uploading
        }
    };

    const dropzone: DropzoneOptions = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png'],
        },
        multiple: true,
        maxFiles: 4,
        maxSize: 1 * 1024 * 1024, // 1 MB
    };

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center justify-center">
                            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
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
                                    dropzoneOptions={dropzone}
                                >
                                    <FileInput>
                                        <div className="flex items-center justify-center h-32 w-full border bg-background rounded-md">
                                            <p className="text-gray-400">Drop files here</p>
                                            {files.length > 0 && (
                                                <p className="text-gray-400">
                                                    {files.length} files selected
                                                </p>
                                            )}
                                        </div>
                                    </FileInput>
                                    <FileUploaderContent className="flex items-center flex-row gap-2">
                                        {files.map((file, i) => (
                                            <FileUploaderItem
                                                key={i}
                                                index={i}
                                                className="size-20 p-0 rounded-md overflow-hidden"
                                                aria-roledescription={`file ${i + 1} containing ${file.name}`}
                                            >
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    height={80}
                                                    width={80}
                                                    className="size-20 p-0"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data?.data.map((image, index) => (
                    <div
                        key={index}
                        className="relative group"
                    >
                        <img
                            src={image.secure_url}
                            alt={image.display_name}
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
                ))}
            </div>
            {/* {isFetching && <div>Loading more images...</div>}
            {!isFetching && hasNextPage && (
                <Button onClick={() => fetchNextPage()} disabled={isFetching}>
                    Load More
                </Button>
            )} */}
        </div>
    );
};

export default GalleryPage;
