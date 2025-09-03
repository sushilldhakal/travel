import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
    Eye,
    CheckCircle2,
    Building2,
    Calendar,
    Clock,
    XCircle,
    AlertCircle,
    MapPin,
    CreditCard,
    FileText,
    Download,
    ExternalLink,
    Image as ImageIcon,
    Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    getSellerApplications,
    approveSellerApplication,
    rejectSellerApplication,
    deleteSellerApplication
} from '@/http/userApi';
import { useBreadcrumbs, Breadcrumb } from '@/Provider/BreadcrumbsProvider';
import { DataTable } from '@/userDefinedComponents/DataTable';

interface SellerApplicationData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    roles: string;
    createdAt: string;
    sellerApplicationStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    sellerInfo?: {
        companyName: string;
        companyRegistrationNumber: string;
        companyType: string;
        registrationDate: string;
        taxId: string;
        website?: string;
        businessAddress: {
            address: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        bankDetails: {
            bankName: string;
            accountNumber: string;
            accountHolderName: string;
            branchCode: string;
        };
        businessDescription: string;
        sellerType: string;
        isApproved: boolean;
        appliedAt: string;
        approvedAt?: string;
        reapplicationCount?: number;
        documents?: any;
        contactPerson?: string;
        phone?: string;
        alternatePhone?: string;
    };
}

// Application Details Component for Modal
const ApplicationDetails: React.FC<{ application: SellerApplicationData }> = ({ application }) => {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="company">Company Info</TabsTrigger>
                    <TabsTrigger value="banking">Banking Details</TabsTrigger>
                    <TabsTrigger value="business">Business Info</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>Personal Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="mt-1 font-medium">{application.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <p className="mt-1 font-medium">{application.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                <p className="mt-1 font-medium">{application.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <p className="mt-1 font-medium capitalize">{application.roles}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="company" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>Company Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.companyName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.companyRegistrationNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Company Type</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.companyType || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.taxId || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Website</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.website || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5" />
                                <span>Business Address</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="font-medium">{application.sellerInfo?.businessAddress?.address || 'N/A'}</p>
                                <p className="text-muted-foreground">
                                    {application.sellerInfo?.businessAddress?.city || 'N/A'}, {application.sellerInfo?.businessAddress?.state || 'N/A'} {application.sellerInfo?.businessAddress?.postalCode || 'N/A'}
                                </p>
                                <p className="text-muted-foreground">{application.sellerInfo?.businessAddress?.country || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="banking" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5" />
                                <span>Banking Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.bankDetails?.bankName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Holder Name</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.bankDetails?.accountHolderName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.bankDetails?.accountNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Branch Code</label>
                                <p className="mt-1 font-medium">{application.sellerInfo?.bankDetails?.branchCode || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="business" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Business Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Seller Type</label>
                                    <p className="mt-1 font-medium capitalize">{application.sellerInfo?.sellerType?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Business Description</label>
                                    <p className="mt-1 text-sm leading-relaxed">{application.sellerInfo?.businessDescription || 'No description provided'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                                        <p className="mt-1 font-medium">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            <Badge
                                                variant={
                                                    application.sellerApplicationStatus === 'approved'
                                                        ? 'default'
                                                        : application.sellerApplicationStatus === 'rejected'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                }
                                                className="capitalize"
                                            >
                                                {application.sellerApplicationStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Uploaded Documents</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {application.sellerInfo?.documents ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(application.sellerInfo.documents).map(([docType, docs]) => (
                                        <div key={docType} className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground capitalize">
                                                {docType.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                            <div className="space-y-2">
                                                {Array.isArray(docs) && docs.map((doc: { secure_url: string; original_filename: string; format: string; bytes: number }, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                                        <div className="flex items-center space-x-3">
                                                            {doc.format === 'pdf' ? (
                                                                <FileText className="h-5 w-5 text-red-500" />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-blue-500" />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium">{doc.original_filename}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {doc.format?.toUpperCase()} • {Math.round(doc.bytes / 1024)} KB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.open(doc.secure_url, '_blank')}
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = doc.secure_url;
                                                                    link.download = doc.original_filename;
                                                                    link.target = '_blank';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No documents uploaded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default function SellerApplications() {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState('');

    // Set up breadcrumbs
    const { updateBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        const breadcrumbs: Breadcrumb[] = [
            { label: 'Dashboard', href: '/dashboard', type: 'link' },
            { label: 'Users', href: '/dashboard/users', type: 'link' },
            { label: 'Seller Applications', href: '/dashboard/users/seller-applications', type: 'page' },
        ];
        updateBreadcrumbs(breadcrumbs);
    }, [updateBreadcrumbs]);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['seller-applications'],
        queryFn: getSellerApplications,
        staleTime: 10000,
    });


    const approveMutation = useMutation({
        mutationFn: approveSellerApplication,
        onSuccess: () => {
            toast.success("Seller application approved successfully");
            queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to approve seller application");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            rejectSellerApplication(userId, reason),
        onSuccess: () => {
            toast.success("Seller application rejected");
            queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to reject seller application");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSellerApplication,
        onSuccess: () => {
            toast.success("Seller application deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete seller application");
        },
    });

    const handleApprove = (applicationId: string) => {
        approveMutation.mutate(applicationId);
    };

    const handleReject = (userId: string, reason: string) => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        rejectMutation.mutate({ userId, reason });
    };

    const handleDelete = (userId: string) => {
        deleteMutation.mutate(userId);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
            case 'approved':
                return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: ColumnDef<SellerApplicationData>[] = [
        {
            accessorKey: "name",
            header: "Applicant",
            cell: ({ row }) => {
                const application = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium">{application.name}</div>
                            <div className="text-sm text-muted-foreground">{application.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "sellerInfo.companyName",
            header: "Company",
            cell: ({ row }) => {
                const application = row.original;
                return (
                    <div>
                        <div className="font-medium">{application.sellerInfo?.companyName}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                            {application.sellerInfo?.sellerType?.replace('_', ' ')}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "sellerApplicationStatus",
            header: "Status",
            cell: ({ row }) => {
                const application = row.original;
                const reapplicationCount = application.sellerInfo?.reapplicationCount || 1;
                return (
                    <div className="flex items-center gap-2">
                        {getStatusBadge(row.getValue("sellerApplicationStatus"))}
                        {reapplicationCount > 1 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                {reapplicationCount}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Applied Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{date.toLocaleDateString()}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const application = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Seller Application Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        Review the complete seller application for {application.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <ApplicationDetails application={application} />
                            </DialogContent>
                        </Dialog>

                        {application.sellerApplicationStatus === 'pending' && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(application._id)}
                                    disabled={approveMutation.isPending}
                                    className="gap-1"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to reject this seller application? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4">
                                            <Textarea
                                                placeholder="Please provide a reason for rejection..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    handleReject(application._id, rejectionReason);
                                                    setRejectionReason('');
                                                }}
                                                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Reject Application
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}

                        {/* Delete button - available for all statuses */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Seller Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this seller application? This will remove all seller information but keep the user as a normal user. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(application._id)}
                                        disabled={deleteMutation.isPending}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete Application
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Seller Applications</h1>
                        <p className="text-muted-foreground">Loading applications...</p>
                    </div>
                </div>
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading applications</h3>
                    <p className="text-gray-500">{error?.message || 'Something went wrong'}</p>
                </div>
            </div>
        );
    }

    const applications = data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Seller Applications</h1>
                    <p className="text-muted-foreground">Manage seller applications and approvals</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'pending').length} Pending
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'approved').length} Approved
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        {applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'rejected').length} Rejected
                    </Badge>
                </div>
            </div>

            <DataTable
                data={applications}
                columns={columns}
                place="Search applications..."
                colum="name"
                initialColumnVisibility={{}}
            />
        </div>
    );
}
