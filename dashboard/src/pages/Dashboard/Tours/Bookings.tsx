import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, updateBookingStatus, updatePaymentStatus } from '@/http';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, User, DollarSign, CheckCircle, Search, Filter, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

const Bookings = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { data, isLoading, error } = useQuery({
        queryKey: ['bookings', statusFilter, paymentFilter, searchTerm, currentPage],
        queryFn: () => getAllBookings({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
            page: currentPage,
            limit: pageSize,
        }),
        staleTime: 30000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: "Success",
                description: "Booking status updated successfully"
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const updatePaymentMutation = useMutation({
        mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
            updatePaymentStatus(id, paymentStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: "Success",
                description: "Payment status updated successfully"
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
        const className = variants[status] || variants.pending;
        return (
            <Badge className={className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentBadge = (status: string) => {
        const variants: Record<string, string> = {
            unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };
        const className = variants[status] || variants.unpaid;
        return (
            <Badge className={className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-destructive mb-4">
                        <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Error Loading Bookings</h3>
                    <p className="text-muted-foreground mb-4">There was an error loading the bookings data.</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const bookings = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tour Bookings</h1>
                    <p className="text-muted-foreground">
                        Manage and track all tour bookings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        Total: {pagination?.totalItems || 0}
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                <p className="text-2xl font-bold">{pagination?.totalItems || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {bookings.filter((b: any) => b.status === 'confirmed').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {bookings.filter((b: any) => b.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatPrice(
                                        bookings.reduce((sum: number, booking: any) =>
                                            sum + (booking.pricing?.totalPrice || 0), 0
                                        )
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by reference, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Booking Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardContent className="p-0">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
                            <p className="text-muted-foreground">
                                {statusFilter !== 'all' || paymentFilter !== 'all' || searchTerm
                                    ? 'No bookings match your current filters.'
                                    : 'No bookings have been made yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Reference</TableHead>
                                        <TableHead>Tour</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Departure</TableHead>
                                        <TableHead>Participants</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="w-[200px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking: any) => (
                                        <TableRow key={booking._id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono text-sm font-medium">
                                                {booking.bookingReference}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm leading-tight">
                                                        {booking.tourTitle}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Code: {booking.tourCode}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">
                                                        {booking.contactName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {booking.contactEmail}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {booking.contactPhone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(booking.departureDate)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{booking.participants.adults} Adults</div>
                                                    {booking.participants.children > 0 && (
                                                        <div className="text-muted-foreground">
                                                            {booking.participants.children} Children
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatPrice(booking.pricing.totalPrice)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                            <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={booking.status}
                                                        onValueChange={(value) =>
                                                            updateStatusMutation.mutate({ id: booking._id, status: value })
                                                        }
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <SelectTrigger className="w-[100px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                        {pagination.totalItems} bookings
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={pagination.currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={page === pagination.currentPage ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
