import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSingleImage } from "@/http/api";
import { ImageResource } from "@/Provider/types";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon, X } from "lucide-react";

interface ImageDetailProps {
    imageUrl: string;
    handleClose: () => void;
}

interface ImageData extends ImageResource {
    description: string;
    title: string;
    bytes: number | any;
    width: string;
    height: string;
}

const ImageDetail = ({ imageUrl, handleClose }: ImageDetailProps) => {

    console.log(imageUrl)
    const { data: imageDetails, isLoading, error } = useQuery<ImageData[], Error>({
        queryKey: ['image', imageUrl],
        queryFn: () => getSingleImage(imageUrl),
        enabled: !!imageUrl,
    });

    // Handle loading and error states
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading image: {error.message}</div>;
    }

    // Display the image details
    return (
        <div className="grid grid-cols-1 sticky top-3">
            {imageDetails?.map((image, index) => (
                <Card key={index} className="w-full max-w-md ">
                    <CardHeader>
                        <CardTitle>{image?.title || 'No title'} <Button className="float-right" onClick={handleClose} variant="destructive" size="icon"><X /></Button></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-md">
                            <img
                                src={image?.secure_url || image?.url}
                                alt={image?.title || image?.asset_id}
                                className="object-cover w-full rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Description:</p>
                            <Input
                                className="w-full"
                                placeholder="No title"
                                value={image?.title || ''}
                                readOnly
                            />
                            <Input
                                className="w-full"
                                placeholder="No description"
                                value={image?.description || ''}
                                readOnly
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Image Information:</p>
                            <p className="text-xs text-muted-foreground">Size: {image?.bytes ? (image.bytes / (1024 * 1024)).toFixed(2) : 'Unknown'} MB</p>
                            <p className="text-xs text-muted-foreground">Resolution: {image?.width}x{image?.height}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="outline" size="icon">
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit description</span>
                        </Button>
                        <Button variant="destructive" size="icon">
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
