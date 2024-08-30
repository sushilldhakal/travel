import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSingleMedia, updateMedia } from "@/http/api";
import { ImageResource } from "@/Provider/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronLeft, ChevronRight, PencilIcon, Trash2Icon, X } from "lucide-react";
import { InputTags } from "@/userDefinedComponents/InputTags";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";


interface ImageDetailProps {
    imageUrl: string;
    handleClose: () => void;
    handleUpload: () => void;
    files: File[] | null;
    setFiles: (files: File[]) => void;
    onDelete: (imageId: string, mediaType: 'images' | 'videos' | 'PDF') => void;
    setSelectedImage: string;
    userId: string | null;
}

interface ImageData extends ImageResource {
    description: string;
    title: string;
    bytes: number | any;
    width: number;
    height: number;
    tags: string[];
}


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};


const ImageDetail = ({ userId, files, setFiles, imageUrl, setSelectedImage, onDelete, handleClose, handleUpload }: ImageDetailProps) => {
    const [open, setOpen] = useState(false);
    const [valuesTag, setValuesTag] = useState<string[]>([])
    const [changesMade, setChangesMade] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const { data: imageDetails, isLoading, error } = useQuery<ImageResource, Error>({
        queryKey: ['image', imageUrl],
        queryFn: () => getSingleMedia(imageUrl, userId),
        enabled: !!imageUrl,
    });



    const handleEdit = (event: any) => {
        event?.preventDefault()
        setTimeout(() => {
            setIsEditing(!isEditing)
        }, 200);
    }




    const editorRef = useRef<any>(null);
    // Define handleClickButton function
    const handleClickButton = async (image: string) => {

        let fileName: string;

        try {
            const url = new URL(imageUrl);
            fileName = url.pathname.split('/').pop()?.split('.')[0] || imageUrl;
        } catch (error) {
            fileName = image;
        }
        const editorInstance = editorRef.current.getInstance();
        const data = editorInstance.toDataURL();
        const byteString = atob(data.split(",")[1]);
        const mimeString = data.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const newFile = new Blob([ab], { type: mimeString })
        const file = new File([newFile], `edited-` + fileName, {
            type: "image/jpeg",
        });
        setFiles(prevFiles => {
            if (!Array.isArray(prevFiles)) {
                // If prevFiles is not an array, default to an empty array
                return [file];
            }
            // Otherwise, append the new file to the existing array
            return [...prevFiles, file];
        });
    };

    const handleUploadChange = async () => {
        setTimeout(() => {
            handleUpload();
        }, 100);

    };

    function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy): void {
        setNumPages(numPages);
        setPageNumber(1);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const nextPage = () => {
        changePage(1);
    };

    const prevPage = () => {
        changePage(-1);
    };
    const form = useForm({
        defaultValues: {
            title: imageDetails?.title || '',
            description: imageDetails?.description || '',
            tags: imageDetails?.tags || '',
            id: imageDetails?.id || '',
        },
    });



    useEffect(() => {
        if (imageDetails) {
            setValuesTag(imageDetails?.tags);

            const defaultValues = {
                title: imageDetails.title || '',
                description: imageDetails.description || '',
                tags: imageDetails.tags || '',
                id: imageDetails?._id || '',
                mediaType: imageDetails?.resource_type || '',
            };
            form.reset(defaultValues);
        }
    }, [imageDetails, form]);
    console.log("form", form);

    const updateMediaMutation = useMutation({
        mutationFn: async ({ formData, userId, imageId, mediaType }: { formData: FormData, userId: string | null, imageId: string, mediaType: string }) => {
            console.log("upload mutation")
            if (userId) {
                return updateMedia(formData, userId, imageId, mediaType);
            }
        },
        onSuccess: () => {
            // Optionally handle success, e.g., show a notification
        },
        onError: (error) => {
            console.error('Error updating media:', error);
        }
    });
    console.log("imageDetails", imageDetails)
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isEditing) {
            setIsEditing(!isEditing);
        }
        const { title, description, tags, id } = form.getValues();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', JSON.stringify(tags)); // Adjust this based on your backend implementation
        console.log("handlesubmit function");

        const imageId = imageDetails?.id; // Get imageId from imageDetails
        const mediaType = imageDetails?.resource_type;
        console.log("imageId", imageDetails?.id)
        if (imageId && mediaType) {
            updateMediaMutation.mutate({ formData, userId, imageId, mediaType });
        } else {
            console.error("Image ID is missing");
        }
        // Optionally, reset form and/or handle success
    };

    // Handle loading and error states
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading image:{''} {error.message}</div>;
    }
    // Display the image details
    return (
        <div className="grid grid-cols-1 sticky top-3">
            <Card className="w-full max-w-md ">
                <CardHeader>
                    <CardTitle className="text-md break-words">{imageDetails?.title || 'No title'} <Button className="float-right" onClick={handleClose} variant="destructive" size="icon"><X /></Button></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative aspect-video overflow-hidden rounded-md">

                        {
                            imageDetails?.resource_type === 'raw' &&
                            <div className="relative group pdf-container">
                                <Document file={imageDetails.url} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page
                                        pageNumber={pageNumber}
                                        height={400}
                                        width={300}
                                        className="w-full" />
                                </Document>
                                <div className="absolute flex justify-center min-w-[155px] leading-10 bottom-5 right-0 left-[50%] transform translate-x-[-50%] z-10 text-center p-2 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity transition-250">
                                    <Button className="p-0 bg-white rounded-md px-2 text-xs hover:bg-white" onClick={prevPage} disabled={pageNumber <= 1}><ChevronLeft /></Button>
                                    <span className="bg-white rounded-md px-2">{` ${pageNumber} of ${numPages} `}</span>
                                    <Button className="p-0 bg-white rounded-md px-2 text-xs hover:bg-white" onClick={nextPage} disabled={pageNumber >= numPages}><ChevronRight /></Button>
                                </div>
                            </div>

                        }
                        {
                            imageDetails?.resource_type === 'video' &&
                            <div className="relative group pdf-container">
                                <video src={imageDetails.secure_url ? imageDetails.secure_url : imageDetails.url} width="750" height="500" controls />
                            </div>
                        }
                        {
                            imageDetails?.resource_type === 'image' &&
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <img
                                        src={imageDetails?.secure_url || imageDetails?.url}
                                        alt={imageDetails?.title || imageDetails?.asset_id}
                                        className="object-cover w-full rounded-md"
                                    />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[1100px]">
                                    <DialogHeader>
                                        <DialogTitle className="break-words">Edit Image</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your Image here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center gap-4 py-4">
                                        <ImageEditor
                                            ref={editorRef}
                                            includeUI={{
                                                loadImage: {
                                                    path: `${imageDetails?.url}`,
                                                    name: `${imageDetails?.title ? imageDetails?.title : imageDetails?.url}`,
                                                },
                                                theme: myTheme,
                                                menu: ['crop', 'flip', 'rotate', 'shape', 'filter', 'icon', 'text', 'draw', 'mask', 'resize'],
                                                initMenu: 'filter',
                                                uiSize: {
                                                    width: '1050px',
                                                    height: '700px',
                                                },
                                                menuBarPosition: 'bottom',
                                            }}
                                            cssMaxHeight={600}
                                            cssMaxWidth={800}

                                            selectionStyle={{
                                                cornerSize: 20,
                                                rotatingPointOffset: 70,
                                            }}
                                            usageStatistics={true}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => {
                                            handleClickButton(imageDetails?.title ? imageDetails?.title : imageDetails?.url).then(() => setChangesMade(false));
                                        }}
                                            disabled={!changesMade}
                                        >Save changes</Button>
                                        <Button onClick={() => {
                                            handleUploadChange()
                                                .then(() => setOpen(false));
                                            setChangesMade(true);
                                        }}
                                            disabled={changesMade}
                                        >Upload changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        }
                    </div>
                    <div className="space-y-2">
                        <Form {...form}>
                            <form onSubmit={handleFormSubmit}>
                                {isEditing ? (
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input type="text" className="w-full" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                ) : (
                                    <p className="text-sm text-muted-foreground break-words"><span className="text-sm font-medium">Title:</span> {imageDetails?.title || ''}</p>
                                )}

                                {isEditing ? (
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input type="text" className="w-full" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground break-words"><span className="text-sm font-medium">Description:</span> {imageDetails?.description || ''}</p>
                                )}
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <InputTags
                                                    value={valuesTag}
                                                    placeholder="Enter your image tags"
                                                    onChange={(newTags) => {
                                                        setValuesTag(newTags); // Update the state with new tags
                                                        field.onChange(newTags); // Update the form field value
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Image Information:</p>
                                    <p className="text-xs text-muted-foreground">Size: {imageDetails?.bytes ? (imageDetails.bytes / (1024 * 1024)).toFixed(2) : 'Unknown'} MB</p>
                                    <p className="text-xs text-muted-foreground">Resolution: {imageDetails?.width}x{imageDetails?.height}</p>
                                </div>
                                <CardFooter className="justify-between">

                                    {isEditing ? (
                                        <Button variant="outline" size="icon" type="submit" onClick={handleFormSubmit}>
                                            <CheckIcon className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="icon" onClick={handleEdit}><PencilIcon className="h-4 w-4" /></Button>
                                    )
                                    }

                                    <Button variant="destructive" size="icon" onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(imageDetails?.public_id, imageDetails?.resource_type === "image" ? 'images' : imageDetails?.resource_type === "video" ? 'videos' : 'PDF');
                                    }}>
                                        <Trash2Icon className="h-4 w-4" />
                                        <span className="sr-only">Delete image</span>
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageDetail;


const myTheme = {
    "header.display": "none"
};

