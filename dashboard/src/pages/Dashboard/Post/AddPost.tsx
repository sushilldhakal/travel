import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addPost } from "@/http";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import type { JSONContent } from "novel";
import { InputTags } from "@/userDefinedComponents/InputTags";
import Loader from "@/userDefinedComponents/Loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    LoaderCircle,
    Paperclip,
    Trash2,
    FileText,
    Image as ImageIcon,
    Tags,
    MessageSquare,
    Save,
    Eye,
    Settings,
    Hash
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { cn } from "@/lib/utils";
import GalleryPage from "../Gallery/GalleryPage";
import { Switch } from "@/components/ui/switch";



const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    status: z.string().min(2, {
        message: 'Genre must be at least 2 characters.',
    }),
    content: z.string().min(2, {
        message: 'content must be at least 2 characters.',
    }),
    image: z.string().min(2, {
        message: 'Image URL must be at least 2 characters.',
    }),
    tags: z.array(z.string()).optional(),
    enableComments: z.boolean().optional(),
});


const AddPost = () => {

    const navigate = useNavigate();
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [editorContent, setEditorContent] = useState({});
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            status: '',
            content: '',
            image: '',
            tags: [],
            enableComments: true,
        },
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            navigate('/dashboard/posts');
        },
    });


    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        if (imageUrl) {
            onChange(imageUrl);
            setImageDialogOpen(false); // Close the image dialog
        }
    };
    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };


    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const formdata = new FormData();
        formdata.append('title', values.title);
        formdata.append('status', values.status);
        formdata.append('content', JSON.stringify(editorContent));
        formdata.append('image', values.image);
        formdata.append('tags', JSON.stringify(values.tags));
        if (values.enableComments) formdata.append('enableComments', values.enableComments.toString());
        mutation.mutate(formdata);

    }

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-7xl">
            {mutation.isPending && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg border">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader />
                            <p className="text-sm text-muted-foreground">Creating your post...</p>
                        </div>
                    </div>
                </div>
            )}

            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log("form", form.getValues());
                        form.handleSubmit(
                            (values) => {
                                onSubmit(values); // your submit logic
                            },
                            (errors) => {
                                console.log("Form Errors:", errors); // log errors
                            }
                        )();
                    }}
                >
                    {/* Page Header Actions */}
                    <div className="mb-6">
                        <Card className="border shadow-xs">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span>Post Editor</span>
                                    </div>
                                    <h1 className="text-lg font-semibold">Create Post</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link to="/dashboard/posts">
                                        <Button size="sm" variant={'outline-solid'}>
                                            Discard
                                        </Button>
                                    </Link>
                                    <Button type="submit" size="sm" disabled={mutation.isPending}>
                                        {mutation.isPending ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Post
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3">
                        {/* Left side (2/3): Title and Content */}
                        <div className="col-span-2 space-y-6 max-lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Post Content
                                    </CardTitle>
                                    <CardDescription>
                                        Write your post title and content here.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
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

                                        <Controller
                                            name="content"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Editor
                                                    initialValue={field.value || editorContent}
                                                    onContentChange={(content: JSONContent) => {
                                                        setEditorContent(content);
                                                        field.onChange(content);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right side (1/3): Status, Image, and Tags */}
                        <div className="col-span-1 space-y-6 max-lg:col-span-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Settings className="h-4 w-4 text-primary" />
                                        Post Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Status
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Published">Published</SelectItem>
                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                        <SelectItem value="Expired">Expired</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ImageIcon className="h-4 w-4 text-primary" />
                                        Featured Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4" />
                                                    Cover Image
                                                </FormLabel>
                                                {field.value ? (
                                                    <div className="mt-2 relative">
                                                        <Link to={field.value} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={field.value}
                                                                alt="Selected Cover Image"
                                                                className="rounded-md w-full"
                                                            />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(field.onChange)}
                                                            className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                                                        <DialogTrigger>
                                                            <div
                                                                className={cn(
                                                                    buttonVariants({
                                                                        size: "icon",
                                                                    }),
                                                                    "size-8"
                                                                )}
                                                            >
                                                                <Paperclip className="size-4" />
                                                                <span className="sr-only">Select your files</span>
                                                            </div>
                                                            <span className="pl-2">Choose Image</span>
                                                        </DialogTrigger>
                                                        <DialogContent
                                                            className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                            onInteractOutside={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <DialogHeader>
                                                                <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                                <div className="upload dialog">
                                                                    <GalleryPage
                                                                        isGalleryPage={false}
                                                                        onImageSelect={(imageUrl) =>
                                                                            handleImageSelect(imageUrl, field.onChange)
                                                                        }
                                                                    />
                                                                </div>
                                                            </DialogHeader>
                                                            <DialogDescription>
                                                                Select an Image.
                                                            </DialogDescription>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Hash className="h-4 w-4 text-primary" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Tags className="h-4 w-4" />
                                                    Post Tags
                                                </FormLabel>
                                                <FormControl>
                                                    <InputTags
                                                        value={field.value || []}
                                                        onChange={(newTags) => {
                                                            field.onChange(newTags);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Comments
                                </CardTitle>
                                <CardDescription>Allow readers to comment on your post.</CardDescription>
                            </CardHeader>
                            <CardContent>

                                <FormField
                                    control={form.control}
                                    name="enableComments"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Enable Comments
                                                </FormLabel>
                                                <FormDescription>
                                                    Enable users to add comments on your post.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>

                    </div>
                </form>
            </Form>
        </div>

    )
}

export default AddPost