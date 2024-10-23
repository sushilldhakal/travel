import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addPost, deletePost, getSinglePost, updatePost } from "@/http/api";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import { InputTags } from "@/userDefinedComponents/InputTags";
import Loader from "@/userDefinedComponents/Loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Paperclip, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { cn } from "@/lib/utils";
import GalleryPage from "../Gallery/GalleryPage";
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb, Post, PostData } from "@/Provider/types";
import { toast } from "@/components/ui/use-toast";
import { JSONContent } from "novel";
import { Switch } from "@/components/ui/switch";
import Component from "./CommentComponents";



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


const EditPost = () => {
    const { postId } = useParams<{ postId: string }>();
    const { updateBreadcrumbs } = useBreadcrumbs();
    const navigate = useNavigate();
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [editorContent, setEditorContent] = useState<JSONContent>();

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

    const { data: initialPostData } = useQuery<PostData, Error>({
        queryKey: ['posts', postId],
        queryFn: () => postId ? getSinglePost(postId) : Promise.reject('No post ID provided'),
        enabled: !!postId,

    });
    console.log("initialPostData in edit post", initialPostData)


    useEffect(() => {
        if (initialPostData && postId && initialPostData.post?.content) {
            // Update breadcrumbs
            const breadcrumbLabel = initialPostData.breadcrumbs?.[0]?.label ?
                initialPostData.breadcrumbs[0].label.charAt(0).toUpperCase() + initialPostData.breadcrumbs[0].label.slice(1)
                : '';
            const breadcrumbs: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Posts', href: '/dashboard/posts', type: 'link' },
                { label: breadcrumbLabel, href: `/dashboard/posts/edit_post${postId}`, type: 'page' },
            ];
            updateBreadcrumbs(breadcrumbs);

            // Set the form data after fetching the post data
            const defaultValues = {
                title: initialPostData.post?.title || '',
                content: initialPostData.post?.content || '', // No need to parse it here if it's already JSON
                image: initialPostData.post?.image || '',
                status: initialPostData.post?.status || '',
                tags: initialPostData.post?.tags || [],
            };
            form.reset(defaultValues);  // Reset the form with the fetched post data
            // If content is already in the correct format, set it directly
            setEditorContent(JSON.parse(initialPostData?.post?.content))

        }
    }, [initialPostData, postId, updateBreadcrumbs, form]);



    const mutation = useMutation({
        mutationFn: (data: FormData) => {
            if (postId) {
                return updatePost(data, postId)
            }
            throw new Error('No post ID provided')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast({
                title: 'Post updated successfully',
                description: 'The post has been updated successfully.',
            });
        },
    });


    const deleteMutation = useMutation({
        mutationFn: () => {
            if (postId) {
                return deletePost(postId)
            }
            throw new Error('No post ID provided')
        },
        onSuccess: () => {
            //queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast({
                title: 'post deleted successfully',
                description: 'The post has been deleted successfully.',
            });
        },
        onError: () => {
            toast({
                title: 'Failed to delete post',
                description: 'An error occurred while deleting the post. Please try again later.',
            });
        }
    });

    const handleDeletePost = async () => {
        try {
            await deleteMutation.mutateAsync();
        } catch (error) {
            toast({
                title: "Failed to delete post",
                description: `An error occurred while deleting the post. Please try again later.${error}`,
            });
        }
    };


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
        if (values.enableComments) formdata.append('enableComments', values.enableComments.toString());
        if (values.tags) {
            values.tags.forEach((tag) => {
                formdata.append('tags[]', tag); // Send each tag individually
            });
        }
        mutation.mutate(formdata);
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            {mutation.isPending && (
                <div className="flex flex-col space-y-3 ">
                    <Skeleton className="h-[100%] w-[100%] top-0 left-0 absolute z-10 rounded-xl" />
                    <div className="space-y-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loader />
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
                    <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
                        <Button size="sm" variant={'destructive'} onClick={handleDeletePost}>
                            <span className="ml-2">
                                <span>Delete</span>
                            </span>
                        </Button>
                        <Button type="submit" size="sm">
                            {mutation.isPending && <LoaderCircle className="animate-spin" />}
                            <span className="ml-2">Update Post</span>
                        </Button>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3">
                        {/* Left side (2/3): Title and Content */}
                        <div className="col-span-2 space-y-6 max-lg:col-span-3">
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Edit Post</CardTitle>
                                    <CardDescription>
                                        Fill out the form below to edit a  post.
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
                                                    initialValue={editorContent}  // Pass the content directly to the editor
                                                    onContentChange={(content) => {
                                                        setEditorContent(content);
                                                        form.setValue('content', JSON.stringify(content)); // Update the form value
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
                            <Card className="mt-6 p-5">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
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
                            </Card>

                            <Card className="mt-6 p-5">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image <br /></FormLabel>
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
                            </Card>

                            <Card className="mt-6 p-5">
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
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
                            </Card>
                        </div>
                    </div>

                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comments</CardTitle>
                                <CardDescription>Turn on Comments for the post.</CardDescription>
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
            <Component />
        </div>

    )
}

export default EditPost