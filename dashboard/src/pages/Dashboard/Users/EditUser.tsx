import { getUserById, changeUserPassword } from "@/http";
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb } from "@/Provider/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useTokenStore from "@/store/store";
import { jwtDecode, JwtPayload } from "jwt-decode";
import AvatarUploader from "@/userDefinedComponents/Avatar/AvatarUploader";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

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
    const queryClient = useQueryClient();

    const { updateBreadcrumbs } = useBreadcrumbs();
    const { userId } = useParams<{ userId: string }>();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', userId],
        queryFn: () => getUserById(userId || ''),
        staleTime: 10000, // in Milli-seconds
        enabled: !!userId, // Only run the query if userId exists
    });

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

    const handleAvatarChange = () => {
        // Refetch user data after avatar change
        refetch();
    };

    const handleSave = () => {
        // Placeholder for save functionality
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("User information saved successfully");
        }, 1000);
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
                : `Tour ${userId}`;
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
                { label: 'Add Tour', href: '/dashboard/users/add', type: 'page' },
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
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Enter your name" defaultValue={tableData?.user?.name} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="Enter your email" defaultValue={tableData?.user?.email} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" placeholder="Enter your phone number" defaultValue={tableData?.user?.phone} />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" placeholder="User role" defaultValue={tableData?.user?.roles} disabled />
                            </div>
                        </div>
                    </div>

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
                                                                                type={showCurrentPassword ? "text" : "password"}
                                                                                placeholder="Enter your current password"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
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
                                                                                type={showNewPassword ? "text" : "password"}
                                                                                placeholder="Enter your new password"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        >
                                                                            {showNewPassword ? (
                                                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                                                            ) : (
                                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    <FormDescription>
                                                                        Password must be at least 8 characters long
                                                                    </FormDescription>
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
                                                                                type={showConfirmPassword ? "text" : "password"}
                                                                                placeholder="Confirm your new password"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
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
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setPasswordDialogOpen(false)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={passwordMutation.isPending}
                                                            >
                                                                {passwordMutation.isPending ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Changing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <KeyRound className="mr-2 h-4 w-4" />
                                                                        Change Password
                                                                    </>
                                                                )}
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

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUser