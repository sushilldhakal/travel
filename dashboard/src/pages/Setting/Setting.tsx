import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getUserSetting, userSetting } from "@/http/api"
import { useEffect, useState } from "react"
import { getUserId } from "@/util/AuthLayout"
import { Eye, EyeOff } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
    CLOUDINARY_CLOUD: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
});


const Setting = () => {
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const userId = getUserId();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['userSettings'], // Key used to cache and invalidate the query
        queryFn: () => getUserSetting(`${userId}`), // Replace with actual user ID if needed
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            CLOUDINARY_CLOUD: '',
            CLOUDINARY_API_KEY: '',
            CLOUDINARY_API_SECRET: '',
            OPENAI_API_KEY: '',
        },
    });
    // Populate form with fetched data
    useEffect(() => {
        if (data) {
            form.reset({
                CLOUDINARY_CLOUD: data?.data.cloudinaryCloud || '',
                CLOUDINARY_API_KEY: data?.data.cloudinaryApiKey || '',
                CLOUDINARY_API_SECRET: data?.data.cloudinaryApiSecret || '',
                OPENAI_API_KEY: data?.data.openaiApiKey || '',
            });
        }
    }, [data, form]);

    const queryClient = useQueryClient();
    const userSettingUpdate = useMutation({
        mutationFn: ({ userId, formData }: { userId: string; formData: FormData }) =>
            userSetting(`${userId}`, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['setting'] });
            toast({
                title: 'Success!',
                description: 'Your keys have been updated.',
                variant: 'success',
            });
        },
        onError: (error) => {
            console.error('Error updating settings:', error);
        }
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        if (values.CLOUDINARY_CLOUD) {
            formData.append('CLOUDINARY_CLOUD', values.CLOUDINARY_CLOUD);
        }
        if (values.CLOUDINARY_API_KEY) {
            formData.append('CLOUDINARY_API_KEY', values.CLOUDINARY_API_KEY);
        }
        if (values.CLOUDINARY_API_SECRET) {
            formData.append('CLOUDINARY_API_SECRET', values.CLOUDINARY_API_SECRET);
        }
        if (values.OPENAI_API_KEY) {
            formData.append('OPENAI_API_KEY', values.OPENAI_API_KEY);
        }
        if (userId) {
            userSettingUpdate.mutate({ userId, formData });
        }
    }

    const toggleVisibility = (key: string) => {
        setVisibleKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="flex min-h-screen w-full flex-col">


            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit(onSubmit)();
                }}>
                    <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
                        <Button size="sm">
                            <span className="ml-2">
                                <span>Save</span>
                            </span>
                        </Button>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 grid-cols-3 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                        <aside className="sticky top-8 inset-x-0 z-20 text-left px-4 sm:px-6 lg:px-8">
                            <nav className="sticky top-4 flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full gap-2 rounded-md px-3 py-2 text-left font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                                >
                                    Cloudinary
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full gap-2 rounded-md px-3 py-2 text-left font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                                >
                                    OpenAI
                                </Button>

                                <Button size="sm">
                                    <span className="ml-2">
                                        <span>Save Change</span>
                                    </span>
                                </Button>
                            </nav>
                        </aside>

                        <div className="grid gap-3 lg:col-span-1">
                            {
                                isLoading ? <div>Loading...</div> : ""
                            }
                            {
                                isError ? <div>Error loading settings. Add values</div> : ""
                            }
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cloudinary</CardTitle>
                                    <CardDescription>
                                        Visit {' '}
                                        <Link className="text-primary" target={"_blank"} to="https://cloudinary.com/">
                                            Cloudinary {' '}
                                        </Link>
                                        and signup for free. Then navigate to you {' '}
                                        <Link className="text-primary" target={"_blank"} to="https://console.cloudinary.com/settings/c-ccd6ef073e22dd5e5f1b220b3fd801/api-keys">
                                            Cloudinary Dashboard {' '}
                                        </Link>
                                        under setting and get the API Keys from there. {' '}
                                        Also to upload PDF file in cloudinary you need to go in setting, then select security go to the bottom and check the PDF and ZIP files delivery option.
                                        Update your Cloudinary information.


                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2 relative">

                                        <FormField
                                            control={form.control}
                                            name="CLOUDINARY_CLOUD"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cloudinary Cloud</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" className="w-full" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2 relative">
                                        <FormField
                                            control={form.control}
                                            name="CLOUDINARY_API_KEY"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cloudinary API Key</FormLabel>
                                                    <FormControl>
                                                        <Input type={visibleKeys.CLOUDINARY_API_KEY ? "text" : "password"} className="w-full" {...field} />

                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('CLOUDINARY_API_KEY')}
                                        >
                                            {visibleKeys.CLOUDINARY_API_KEY ? <EyeOff width="18" height="18" size="20" /> : <Eye width="18" height="18" size="20" />}
                                        </Button>
                                    </div>
                                    <div className="grid gap-2 relative">
                                        <FormField
                                            control={form.control}
                                            name="CLOUDINARY_API_SECRET"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cloudinary API Secret</FormLabel>
                                                    <FormControl>
                                                        <Input type={visibleKeys.CLOUDINARY_API_SECRET ? "text" : "password"} className="w-full" {...field} />

                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('CLOUDINARY_API_SECRET')}
                                        >
                                            {visibleKeys.CLOUDINARY_API_SECRET ? <EyeOff width="18" height="18" size="20" /> : <Eye width="18" height="18" size="20" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>OpenAI</CardTitle>
                                    <CardDescription>Add your Open AI API Key here. This enable AI auto complete and lots more for you text.


                                        Navigate to the  <Link to="https://platform.openai.com/docs/overview" target={"_blank"} className="text-primary">
                                            OpenAI Platform
                                        </Link> and create a free account.
                                        After creating a account Navigate to
                                        <Link to='https://platform.openai.com/api-keys' className="text-primary"> {' '}open AI dashboard{' '}</Link>
                                        Create a new secret key and Copy your secret key from there and paste it here

                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2 relative">
                                        <FormField
                                            control={form.control}
                                            name="OPENAI_API_KEY"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>OpenAI API Key.
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={visibleKeys.OPENAI_API_KEY ? "text" : "password"}
                                                            className="w-full" {...field}
                                                            placeholder="your openAI api key..."
                                                        />

                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('OPENAI_API_KEY')}
                                        >
                                            {visibleKeys.OPENAI_API_KEY ? <EyeOff width="18" height="18" size="20" /> : <Eye width="18" height="18" size="20" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default Setting;
