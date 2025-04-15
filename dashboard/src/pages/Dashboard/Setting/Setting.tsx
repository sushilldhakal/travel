import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getDecryptedApiKey, getUserSetting, userSetting } from "@/http"
import { useEffect, useState } from "react"
import { getUserId } from "@/util/AuthLayout"
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z.object({
    CLOUDINARY_CLOUD: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),
});

const Setting = () => {
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [decryptedKeys, setDecryptedKeys] = useState<Record<string, string>>({});
    const [isLoadingKeys, setIsLoadingKeys] = useState<Record<string, boolean>>({});
    const userId = getUserId();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['userSettings'], // Key used to cache and invalidate the query
        queryFn: () => getUserSetting(`${userId}`), // Replace with actual user ID if needed
    });

    console.log("data", data);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            CLOUDINARY_CLOUD: '',
            CLOUDINARY_API_KEY: '',
            CLOUDINARY_API_SECRET: '',
            OPENAI_API_KEY: '',
            GOOGLE_API_KEY: '',
        },
    });
    // Populate form with fetched data
    useEffect(() => {
        if (data) {
            // The backend response structure might be data.settings or just data
            const settingsData = data.settings || data;

            form.reset({
                CLOUDINARY_CLOUD: settingsData.cloudinaryCloud || '',
                CLOUDINARY_API_KEY: settingsData.cloudinaryApiKey || '', // Don't show the masked value in the input
                CLOUDINARY_API_SECRET: settingsData.cloudinaryApiSecret || '', // Don't show the masked value in the input
                OPENAI_API_KEY: settingsData.openaiApiKey || '', // Don't show the masked value in the input
                GOOGLE_API_KEY: settingsData.googleApiKey || '', // Don't show the masked value in the input
            });
        }
    }, [data, form]);

    const queryClient = useQueryClient();
    const userSettingUpdate = useMutation({
        mutationFn: ({ userId, formData }: { userId: string; formData: FormData }) =>
            userSetting(`${userId}`, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSettings'] });
            toast({
                title: 'Success!',
                description: 'Your keys have been updated.',
                variant: 'success',
            });
            setIsSubmitting(false);
        },
        onError: (error) => {
            console.error('Error updating settings:', error);
            toast({
                title: 'Error!',
                description: 'Failed to update settings. Please try again.',
                variant: 'destructive',
            });
            setIsSubmitting(false);
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
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
        if (values.GOOGLE_API_KEY) {
            formData.append('GOOGLE_API_KEY', values.GOOGLE_API_KEY);
        }
        if (userId) {
            userSettingUpdate.mutate({ userId, formData });
        }
    }

    // Function to fetch and show decrypted API key
    const fetchDecryptedKey = async (keyType: string) => {
        if (!userId) return;

        try {
            setIsLoadingKeys(prev => ({ ...prev, [keyType]: true }));

            // Map our form field names to backend key types
            const keyTypeMap: Record<string, string> = {
                'CLOUDINARY_API_KEY': 'cloudinary_api_key',
                'CLOUDINARY_API_SECRET': 'cloudinary_api_secret',
                'OPENAI_API_KEY': 'openai_api_key',
                'GOOGLE_API_KEY': 'google_api_key'
            };

            const response = await getDecryptedApiKey(userId, keyTypeMap[keyType]);

            if (response && response.key) {
                // If the key is empty, show a message
                if (response.key === '') {
                    toast({
                        title: 'No API Key Found',
                        description: `There is no ${keyType.toLowerCase().replace('_', ' ')} stored or it could not be decrypted.`,
                        variant: 'default',
                    });
                } else {
                    setDecryptedKeys(prev => ({ ...prev, [keyType]: response.key }));

                    // Update the form with the decrypted value
                    form.setValue(keyType as keyof z.infer<typeof formSchema>, response.key);

                    toast({
                        title: 'API Key Retrieved',
                        description: `Your ${keyType.toLowerCase().replace('_', ' ')} has been retrieved and is now visible.`,
                        variant: 'success',
                    });
                }
            }
        } catch (error) {
            console.error(`Error fetching decrypted ${keyType}:`, error);
            toast({
                title: 'Error',
                description: `Could not retrieve the decrypted ${keyType}. Please try again.`,
                variant: 'destructive',
            });
        } finally {
            setIsLoadingKeys(prev => ({ ...prev, [keyType]: false }));
        }
    };

    const toggleVisibility = async (key: string) => {
        // If we're turning visibility on and we don't have the decrypted key yet
        if (!visibleKeys[key] && isKeySet(key) && !decryptedKeys[key]) {
            await fetchDecryptedKey(key);
        }

        setVisibleKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Helper to check if a key has been set previously
    const isKeySet = (key: string): boolean => {
        if (!data) return false;

        // The backend response structure might be data.settings or just data
        const settingsData = data.settings || data;

        switch (key) {
            case 'CLOUDINARY_API_KEY':
                return !!settingsData.cloudinaryApiKey;
            case 'CLOUDINARY_API_SECRET':
                return !!settingsData.cloudinaryApiSecret;
            case 'OPENAI_API_KEY':
                return !!settingsData.openaiApiKey;
            case 'GOOGLE_API_KEY':
                return !!settingsData.googleApiKey;
            default:
                return false;
        }
    };

    // Get placeholder text based on whether a key exists
    const getPlaceholder = (key: string): string => {
        return isKeySet(key) ? '••••••••••••••••' : 'Enter your API key...';
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit(onSubmit)();
                }}>
                    <div className="hidden items-center gap-2 md:ml-auto md:flex absolute top-12 right-5">
                        <Button size="sm" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <span className="ml-2">Save</span>
                            )}
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
                                    OpenAI{''}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full gap-2 rounded-md px-3 py-2 text-left font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                                >
                                    Google Map{''}
                                </Button>

                                <Button size="sm" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <span className="ml-2">Save Changes</span>
                                    )}
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
                                                    <FormLabel className="flex items-center gap-2">
                                                        Cloudinary API Key
                                                        {isKeySet('CLOUDINARY_API_KEY') && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <KeyRound className="h-4 w-4 text-green-500" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>API key is set and securely stored</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={visibleKeys.CLOUDINARY_API_KEY ? "text" : "password"}
                                                            className="w-full"
                                                            placeholder={getPlaceholder('CLOUDINARY_API_KEY')}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {isKeySet('CLOUDINARY_API_KEY') && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to keep the existing API key
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('CLOUDINARY_API_KEY')}
                                            disabled={isLoadingKeys['CLOUDINARY_API_KEY']}
                                        >
                                            {isLoadingKeys['CLOUDINARY_API_KEY'] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : visibleKeys.CLOUDINARY_API_KEY ? (
                                                <EyeOff width="18" height="18" size="20" />
                                            ) : (
                                                <Eye width="18" height="18" size="20" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="grid gap-2 relative">
                                        <FormField
                                            control={form.control}
                                            name="CLOUDINARY_API_SECRET"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Cloudinary API Secret
                                                        {isKeySet('CLOUDINARY_API_SECRET') && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <KeyRound className="h-4 w-4 text-green-500" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>API secret is set and securely stored</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={visibleKeys.CLOUDINARY_API_SECRET ? "text" : "password"}
                                                            className="w-full"
                                                            placeholder={getPlaceholder('CLOUDINARY_API_SECRET')}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {isKeySet('CLOUDINARY_API_SECRET') && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to keep the existing API secret
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('CLOUDINARY_API_SECRET')}
                                            disabled={isLoadingKeys['CLOUDINARY_API_SECRET']}
                                        >
                                            {isLoadingKeys['CLOUDINARY_API_SECRET'] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : visibleKeys.CLOUDINARY_API_SECRET ? (
                                                <EyeOff width="18" height="18" size="20" />
                                            ) : (
                                                <Eye width="18" height="18" size="20" />
                                            )}
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
                                                    <FormLabel className="flex items-center gap-2">
                                                        OpenAI API Key
                                                        {isKeySet('OPENAI_API_KEY') && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <KeyRound className="h-4 w-4 text-green-500" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>API key is set and securely stored</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={visibleKeys.OPENAI_API_KEY ? "text" : "password"}
                                                            className="w-full"
                                                            placeholder={getPlaceholder('OPENAI_API_KEY')}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {isKeySet('OPENAI_API_KEY') && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to keep the existing API key
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('OPENAI_API_KEY')}
                                            disabled={isLoadingKeys['OPENAI_API_KEY']}
                                        >
                                            {isLoadingKeys['OPENAI_API_KEY'] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : visibleKeys.OPENAI_API_KEY ? (
                                                <EyeOff width="18" height="18" size="20" />
                                            ) : (
                                                <Eye width="18" height="18" size="20" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>


                            <Card>
                                <CardHeader>
                                    <CardTitle>Google Map API</CardTitle>
                                    <CardDescription>Add your Google Map API Key here. This enable auto complete locations and also lets you add google maps.


                                        Navigate to the  <Link to="https://developers.google.com/maps/documentation/javascript/get-api-key" target={"_blank"} className="text-primary">
                                            Google console
                                        </Link> and create a free account. It gives 20$ credit every month free to use, which you can use at least 100,000 times in dashboard each month free.
                                        After creating a account follow the steps to get a
                                        <Link to='https://developers.google.com/maps/documentation/javascript/get-api-key' className="text-primary"> {' '}API key{' '}</Link>
                                        copy a new API key and Copy your API key from there and paste it here

                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2 relative">
                                        <FormField
                                            control={form.control}
                                            name="GOOGLE_API_KEY"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Google Maps API Key
                                                        {isKeySet('GOOGLE_API_KEY') && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <KeyRound className="h-4 w-4 text-green-500" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>API key is set and securely stored</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={visibleKeys.GOOGLE_API_KEY ? "text" : "password"}
                                                            className="w-full"
                                                            placeholder={getPlaceholder('GOOGLE_API_KEY')}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {isKeySet('GOOGLE_API_KEY') && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to keep the existing API key
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            className="absolute right-1 top-10 p-2 h-6"
                                            onClick={() => toggleVisibility('GOOGLE_API_KEY')}
                                            disabled={isLoadingKeys['GOOGLE_API_KEY']}
                                        >
                                            {isLoadingKeys['GOOGLE_API_KEY'] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : visibleKeys.GOOGLE_API_KEY ? (
                                                <EyeOff width="18" height="18" size="20" />
                                            ) : (
                                                <Eye width="18" height="18" size="20" />
                                            )}
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
