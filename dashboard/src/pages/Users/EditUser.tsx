import { getUserById } from "@/http/api";
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb } from "@/Provider/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useTokenStore from "@/store";
import { jwtDecode } from "jwt-decode";

const EditUser = () => {
    const { token } = useTokenStore(state => state);
    const navigate = useNavigate();
    const decodedToken = jwtDecode(token);
    const currentUserRole = decodedToken?.roles;
    const currentUserId = decodedToken?.sub;

    const { updateBreadcrumbs } = useBreadcrumbs();
    const { userId } = useParams<{ userId: string }>();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['users', userId],
        queryFn: () => getUserById(userId),
        staleTime: 10000, // in Milli-seconds
    });

    useEffect(() => {
        if (!isLoading && !isError) {
            if (currentUserRole !== "admin" && currentUserId !== userId) {
                navigate('/dashboard/users'); // Redirect to the dashboard if the user is not allowed to access the page
            }
        }
    }, [currentUserRole, currentUserId, userId, isLoading, isError, navigate]);

    const tableData = data?.data;


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
        <div> <div>
            <div className="px-4 space-y-6 md:px-6">
                <header className="space-y-1.5">
                    <div className="flex items-center space-x-4">
                        <img src="/placeholder.svg" alt="Avatar" width="96" height="96" className="border rounded-full" />
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
                                <Input id="email" placeholder="Enter your email" type="email" defaultValue={tableData?.user?.email} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" placeholder="Enter your phone" type="tel" defaultValue={tableData?.user?.phone} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Change Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" placeholder="Enter your current password" type="password" />
                            </div>
                            <div>
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" placeholder="Enter your new password" type="password" />
                            </div>
                            <div>
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" placeholder="Confirm your new password" type="password" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <Button size="lg">Save</Button>
                </div>
            </div>

        </div></div>
    )
}

export default EditUser