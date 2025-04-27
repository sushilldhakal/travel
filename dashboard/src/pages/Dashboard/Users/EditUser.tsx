import { getUserById, changeUserPassword, updateUser } from "@/http";
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb } from "@/Provider/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useTokenStore from "@/store/store";
import { jwtDecode, JwtPayload } from "jwt-decode";
import AvatarUploader from "@/userDefinedComponents/Avatar/AvatarUploader";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Loader2, Save } from "lucide-react";

// Extend JwtPayload to include roles
interface CustomJwtPayload extends JwtPayload {
    roles?: string;
    sub?: string;
}

// Password change form schema
const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, {
        message: "Current password must be at least 6 characters.",
    }),
    newPassword: z.string().min(8, {
        message: "New password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
        message: "Confirm password must be at least 8 characters.",
    }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// User information form schema
const userFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.number().optional(),
    roles: z.string(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const EditUser = () => {
    const { token } = useTokenStore(state => state);
    const navigate = useNavigate();
    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    const currentUserRole = decodedToken?.roles;
    const currentUserId = decodedToken?.sub;
    const [isSaving, setIsSaving] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { updateBreadcrumbs } = useBreadcrumbs();
    const { userId } = useParams<{ userId: string }>();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', userId],
        queryFn: () => getUserById(userId || ''),
        staleTime: 10000, // in Milli-seconds
        enabled: !!userId, // Only run the query if userId exists
    });

    // User form
    const userForm = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            roles: '',
        },
    });

    // Update form values when data loads
    useEffect(() => {
        if (data?.data?.user) {
            const user = data.data.user;
            userForm.reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                roles: user.roles || '',
            });
        }
    }, [data, userForm]);

    useEffect(() => {
        if (!isLoading && !isError) {
            if (currentUserRole !== "admin" && currentUserId !== userId) {
                navigate('/dashboard/users'); // Redirect to the dashboard if the user is not allowed to access the page
            }
        }
    }, [currentUserRole, currentUserId, userId, isLoading, isError, navigate]);

    const tableData = data?.data;

    // Password change form
    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // User update mutation
    const updateUserMutation = useMutation({
        mutationFn: (data: UserFormValues) => {
            return updateUser(userId || '', {
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                roles: data.roles,
            });
        },
        onSuccess: () => {
            toast.success("User information updated successfully");
            refetch(); // Refetch to get the latest data
        },
        onError: (error) => {
            toast.error(`Failed to update user information: ${error.message}`);
        },
        onSettled: () => {
            setIsSaving(false);
        }
    });

    // Password change mutation
    const passwordMutation = useMutation({
        mutationFn: (data: z.infer<typeof passwordFormSchema>) => {
            return changeUserPassword(userId || '', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            toast.success("Password changed successfully");
            setPasswordDialogOpen(false);
            passwordForm.reset();
        },
        onError: (error) => {
            toast.error(`Failed to change password: ${error.message}`);
        },
    });

    const handlePasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
        passwordMutation.mutate(data);
    };

    const handleUserSubmit = (data: UserFormValues) => {
        setIsSaving(true);
        updateUserMutation.mutate(data);
    };

    const handleAvatarChange = () => {
        // Refetch user data after avatar change
        refetch();
    };

    // All users can have avatars now
    // Check if current user can edit this user's avatar (only if they are the user or an admin)
    const canEditAvatar = currentUserRole === 'admin' || currentUserId === userId;

    // Check if user can change password (only admin and seller roles, or if it's their own account)
    const canChangePassword =
        (currentUserRole === 'admin' || currentUserRole === 'seller' || currentUserId === userId) &&
        (tableData?.user?.roles === 'admin' || tableData?.user?.roles === 'seller' || currentUserId === userId);

    useEffect(() => {
        if (tableData) {
            const breadcrumbLabel = tableData.breadcrumbs?.[0]?.label
                ? tableData.breadcrumbs[0].label.charAt(0).toUpperCase() + tableData.breadcrumbs[0].label.slice(1)
                : `User ${userId}`;
            const breadcrumbs: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Users', href: '/dashboard/users', type: 'link' },
                { label: breadcrumbLabel, href: `/dashboard/users/${userId}`, type: 'page' },
            ];
            updateBreadcrumbs(breadcrumbs);
        } else {
            const breadcrumbs: Breadcrumb[] = [
                { label: 'Dashboard', href: '/dashboard', type: 'link' },
                { label: 'Users', href: '/dashboard/users', type: 'link' },
                { label: 'User', href: '/dashboard/users/add', type: 'page' },
            ];
            updateBreadcrumbs(breadcrumbs);
        }
    }, [tableData, userId, updateBreadcrumbs]);

    return (
        <div>
            <div className="px-4 space-y-6 md:px-6">
                <header className="space-y-1.5">
                    <div className="flex items-center space-x-4">
                        {userId && (
                            <AvatarUploader
                                userId={userId}
                                size="xl"
                                showEditButton={canEditAvatar}
                                onAvatarChange={handleAvatarChange}
                                disabled={!canEditAvatar}
                            />
                        )}
                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-bold">{tableData?.user?.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{tableData?.user?.roles}</p>
                        </div>
                    </div>
                </header>
                <div className="space-y-6">
                    <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={userForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={userForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={userForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={userForm.control}
                                        name="roles"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="User role"
                                                        {...field}
                                                        disabled={currentUserRole !== 'admin'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSaving || updateUserMutation.isPending}
                                    className="gap-2"
                                >
                                    {(isSaving || updateUserMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Security section */}
                    {canChangePassword && (
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">Security</h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password & Authentication</CardTitle>
                                    <CardDescription>
                                        Manage your password and security settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Change Password</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Update your password to keep your account secure
                                            </p>
                                        </div>
                                        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline">Change Password</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Change Password</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your current password and a new password to update your credentials.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Form {...passwordForm}>
                                                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                                                        <FormField
                                                            control={passwordForm.control}
                                                            name="currentPassword"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Current Password</FormLabel>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type={showCurrentPassword ? "text" : "password"}
                                                                                placeholder="Enter your current password"
                                                                                className="pr-10"
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                        >
                                                                            {showCurrentPassword ? (
                                                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                                                            ) : (
                                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={passwordForm.control}
                                                            name="newPassword"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>New Password</FormLabel>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type={showNewPassword ? "text" : "password"}
                                                                                placeholder="Enter your new password"
                                                                                className="pr-10"
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        >
                                                                            {showNewPassword ? (
                                                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                                                            ) : (
                                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={passwordForm.control}
                                                            name="confirmPassword"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Confirm Password</FormLabel>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type={showConfirmPassword ? "text" : "password"}
                                                                                placeholder="Confirm your new password"
                                                                                className="pr-10"
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                        >
                                                                            {showConfirmPassword ? (
                                                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                                                            ) : (
                                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <DialogFooter>
                                                            <Button
                                                                type="submit"
                                                                className="gap-2"
                                                                disabled={passwordMutation.isPending}
                                                            >
                                                                {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                                                <KeyRound className="h-4 w-4" />
                                                                Update Password
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditUser;