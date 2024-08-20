import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSingleImage } from "@/http/api";
import { ImageResource } from "@/Provider/types";
import { useQuery } from "@tanstack/react-query";
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRef, useState } from "react";
import { CheckIcon, PencilIcon, Trash2Icon, X } from "lucide-react";
import { InputTags } from "@/userDefinedComponents/InputTags";


interface ImageDetailProps {
    imageUrl: string;
    handleClose: () => void;
    handleUpload: () => void;
    files: File[] | null;
    setFiles: (files: File[]) => void;
    onDelete: (imageId: string) => void;
    setSelectedImage: string;
    userId: string | null;
}

interface ImageData extends ImageResource {
    description: string;
    title: string;
    bytes: number | any;
    width: string;
    height: string;
}

const ImageDetail = ({ userId, files, setFiles, imageUrl, setSelectedImage, onDelete, handleClose, handleUpload }: ImageDetailProps) => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<string[]>([])
    const [changesMade, setChangesMade] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { data: imageDetails, isLoading, error } = useQuery<ImageData[], Error>({
        queryKey: ['image', imageUrl],
        queryFn: () => getSingleImage(imageUrl, userId),
        enabled: !!imageUrl,
    });
    console.log("userId from imageDetails page", userId)

    const handleEdit = () => {
        setIsEditing(!isEditing)
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
        setChangesMade(!changesMade);
    };

    const handleUploadChange = async () => {
        console.log("files after uploading", files);
        setTimeout(() => {
            handleUpload();
        }, 100);
        setChangesMade(!changesMade);
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
            {imageDetails?.map((image, index) => (
                <Card key={index} className="w-full max-w-md ">
                    <CardHeader>
                        <CardTitle className="text-md">{image?.title || 'No title'} <Button className="float-right" onClick={handleClose} variant="destructive" size="icon"><X /></Button></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-md">

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <img
                                        src={image?.secure_url || image?.url}
                                        alt={image?.title || image?.asset_id}
                                        className="object-cover w-full rounded-md"
                                    />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[1100px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit Image</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your Image here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center gap-4 py-4">

                                        <ImageEditor
                                            ref={editorRef}
                                            includeUI={{
                                                loadImage: {
                                                    path: `${image?.url}`,
                                                    name: `${image?.title ? image?.title : image?.url}`,
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
                                            handleClickButton(image?.title ? image?.title : image?.url);

                                        }}
                                        >Save changes</Button>
                                        <Button onClick={() => {
                                            handleUploadChange()
                                                .then(() => setOpen(false));
                                        }}
                                            disabled={changesMade}
                                        >Upload changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Title:</p>
                            {isEditing ? (
                                <Input
                                    className="w-full"
                                    placeholder="No title"
                                    value={image?.title || ''}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">{image?.title || ''}</p>
                            )}

                            <p className="text-sm font-medium">Description:</p>
                            {isEditing ? (
                                <Input
                                    className="w-full"
                                    placeholder="Add Description Optional"
                                    value={image?.description || ''}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">{image?.description || ''}</p>
                            )}
                            <p className="text-sm font-medium">Tags:</p>
                            <InputTags placeholder="Enter your image tags" value={values} onChange={setValues} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Image Information:</p>
                            <p className="text-xs text-muted-foreground">Size: {image?.bytes ? (image.bytes / (1024 * 1024)).toFixed(2) : 'Unknown'} MB</p>
                            <p className="text-xs text-muted-foreground">Resolution: {image?.width}x{image?.height}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="outline" size="icon" onClick={handleEdit}>
                            {isEditing ? (
                                <CheckIcon className="h-4 w-4" />
                            ) : (
                                <PencilIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">{isEditing ? 'Save' : 'Edit'}</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null)
                            onDelete(image.asset_id);

                        }}>
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Delete image</span>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default ImageDetail;


const myTheme = {
    "header.display": "none"
};

