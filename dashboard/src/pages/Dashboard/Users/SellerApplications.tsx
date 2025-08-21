import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerApplications, approveSellerApplication, rejectSellerApplication } from '@/http/userApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useBreadcrumbs } from "@/Provider/BreadcrumbsProvider";
import { Breadcrumb } from "@/Provider/types";
import {
    Building2,
    Mail,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    AlertCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SellerApplicationData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    roles: string;
    avatarUrl?: string;
    createdAt: string;
    sellerApplicationStatus: 'pending' | 'approved' | 'rejected';
    sellerApplication?: {
        companyName: string;
        companyRegistrationNumber: string;
        companyType: string;
        registrationDate: string;
        taxId: string;
        website?: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
        branchCode: string;
        businessDescription: string;
        sellerType: string;
        applicationDate: string;
    };
}

const SellerApplications = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedApplication, setSelectedApplication] = useState<SellerApplicationData | null>(null);
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
            toast({
                title: "Success",
                description: "Seller application approved successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to approve seller application",
                variant: "destructive",
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
            rejectSellerApplication(userId, reason),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Seller application rejected",
            });
            queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
            setRejectionReason('');
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to reject seller application",
                variant: "destructive",
            });
        },
    });

    const handleApprove = (userId: string) => {
        approveMutation.mutate(userId);
    };

    const handleReject = (userId: string) => {
        if (!rejectionReason.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for rejection",
                variant: "destructive",
            });
            return;
        }
        rejectMutation.mutate({ userId, reason: rejectionReason });
    };



    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Seller Applications</h1>
                        <p className="text-muted-foreground">Manage seller applications and approvals</p>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
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

    const applications = data?.data?.data || [];
    const pendingApplications = applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'pending');
    const approvedApplications = applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'approved');
    const rejectedApplications = applications.filter((app: SellerApplicationData) => app.sellerApplicationStatus === 'rejected');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Seller Applications</h1>
                    <p className="text-muted-foreground">Manage seller applications and approvals</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {pendingApplications.length} Pending
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {approvedApplications.length} Approved
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            {rejectedApplications.length} Rejected
                        </Badge>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-6">
                    {pendingApplications.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                                    <p className="text-gray-500">All seller applications have been processed</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pendingApplications.map((application: SellerApplicationData) => (
                                <ApplicationCard 
                                    key={application._id} 
                                    application={application} 
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onViewDetails={setSelectedApplication}
                                    approveMutation={approveMutation}
                                    rejectMutation={rejectMutation}
                                    rejectionReason={rejectionReason}
                                    setRejectionReason={setRejectionReason}
                                    showActions={true}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-6">
                    {approvedApplications.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved applications</h3>
                                    <p className="text-gray-500">No seller applications have been approved yet</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {approvedApplications.map((application: SellerApplicationData) => (
                                <ApplicationCard 
                                    key={application._id} 
                                    application={application} 
                                    onViewDetails={setSelectedApplication}
                                    showActions={false}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-6">
                    {rejectedApplications.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected applications</h3>
                                    <p className="text-gray-500">No seller applications have been rejected</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {rejectedApplications.map((application: SellerApplicationData) => (
                                <ApplicationCard 
                                    key={application._id} 
                                    application={application} 
                                    onViewDetails={setSelectedApplication}
                                    showActions={false}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Application Details Dialog */}
            <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Seller Application Details</DialogTitle>
                        <DialogDescription>
                            Review the complete seller application information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApplication && (
                        <ApplicationDetails application={selectedApplication} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Application Card Component
interface ApplicationCardProps {
    application: SellerApplicationData;
    onApprove?: (userId: string) => void;
    onReject?: (userId: string) => void;
    onViewDetails: (application: SellerApplicationData) => void;
    approveMutation?: {
        mutate: (userId: string) => void;
        isPending: boolean;
    };
    rejectMutation?: {
        mutate: (params: { userId: string; reason: string }) => void;
        isPending: boolean;
    };
    rejectionReason?: string;
    setRejectionReason?: (reason: string) => void;
    showActions?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
    onApprove,
    onReject,
    onViewDetails,
    approveMutation,
    rejectMutation,
    rejectionReason,
    setRejectionReason,
    showActions = true
}) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={application.avatarUrl} alt={application.name} />
                            <AvatarFallback className="bg-primary/10">
                                {application.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg font-semibold">{application.name}</CardTitle>
                            <CardDescription className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {application.email}
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge(application.sellerApplicationStatus)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {application.sellerApplication && (
                    <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span className="font-medium">{application.sellerApplication.companyName}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{application.sellerApplication.city}, {application.sellerApplication.state}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Applied: {formatDate(application.createdAt)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                            {application.sellerApplication.businessDescription}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails(application)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Button>

                    {showActions && application.sellerApplicationStatus === 'pending' && (
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                onClick={() => onApprove?.(application._id)}
                                disabled={approveMutation?.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={rejectMutation?.isPending}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Please provide a reason for rejecting this seller application.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="rejection-reason">Reason for rejection</Label>
                                        <Textarea
                                            id="rejection-reason"
                                            placeholder="Enter the reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason?.(e.target.value)}
                                        />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onReject?.(application._id)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Reject Application
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Application Details Component
const ApplicationDetails: React.FC<{ application: SellerApplicationData }> = ({ application }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!application.sellerApplication) {
        return <div className="text-center py-8 text-muted-foreground">No application details available</div>;
    }

    const { sellerApplication } = application;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                            <p className="text-sm">{sellerApplication.companyName}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Company Type</Label>
                            <p className="text-sm">{sellerApplication.companyType}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                            <p className="text-sm">{sellerApplication.companyRegistrationNumber}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                            <p className="text-sm">{formatDate(sellerApplication.registrationDate)}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Tax ID</Label>
                            <p className="text-sm">{sellerApplication.taxId}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                            <p className="text-sm">{sellerApplication.website || 'Not provided'}</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm">{application.email}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                            <p className="text-sm">{application.phone || 'Not provided'}</p>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                            <p className="text-sm">{sellerApplication.address}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">City</Label>
                            <p className="text-sm">{sellerApplication.city}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">State</Label>
                            <p className="text-sm">{sellerApplication.state}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                            <p className="text-sm">{sellerApplication.postalCode}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                            <p className="text-sm">{sellerApplication.country}</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Bank Name</Label>
                            <p className="text-sm">{sellerApplication.bankName}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Account Holder Name</Label>
                            <p className="text-sm">{sellerApplication.accountHolderName}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                            <p className="text-sm">****{sellerApplication.accountNumber.slice(-4)}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Branch Code</Label>
                            <p className="text-sm">{sellerApplication.branchCode}</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Seller Type</Label>
                            <p className="text-sm">{sellerApplication.sellerType}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Business Description</Label>
                            <p className="text-sm leading-relaxed">{sellerApplication.businessDescription}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Application Date</Label>
                            <p className="text-sm">{formatDate(application.createdAt)}</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SellerApplications;
