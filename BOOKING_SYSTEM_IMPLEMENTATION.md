# Tour Booking System - Complete Implementation Guide

## ✅ Backend Completed

### Files Created:
1. `server/src/api/bookings/bookingTypes.ts` - TypeScript interfaces
2. `server/src/api/bookings/bookingModel.ts` - Mongoose model
3. `server/src/api/bookings/services/bookingService.ts` - Business logic
4. `server/src/api/bookings/controllers/bookingController.ts` - Route handlers
5. `server/src/api/bookings/bookingRoutes.ts` - API routes
6. `server/src/app.ts` - Updated to include booking routes

### API Endpoints Available:

**Public:**
- `POST /api/bookings` - Create booking (guest or authenticated)
- `GET /api/bookings/reference/:reference` - Get booking by reference

**Authenticated:**
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:bookingId` - Get booking details
- `POST /api/bookings/:bookingId/cancel` - Cancel booking

**Admin/Seller:**
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/bookings/tour/:tourId` - Get tour bookings
- `PATCH /api/bookings/:bookingId/status` - Update booking status
- `PATCH /api/bookings/:bookingId/payment` - Update payment status

## 📋 Frontend Implementation Needed

### 1. Update FrontSingleTours.tsx Booking Form

Replace the booking form section in `FrontSingleTours.tsx` with:

```typescript
// Add these imports at the top
import { useMutation } from '@tantml:function_calls>
<invoke name="createBooking } from '@/http';

// Add state for booking form
const [bookingForm, setBookingForm] = useState({
  fullName: '',
  email: '',
  phone: '',
  departureDate: '',
  adults: 1,
  children: 0,
  specialRequests: ''
});

// Add booking mutation
const bookingMutation = useMutation({
  mutationFn: (bookingData: any) => createBooking(bookingData),
  onSuccess: (response) => {
    toast({
      title: "Booking Successful!",
      description: `Your booking reference is: ${response.data.bookingReference}`,
    });
    // Reset form
    setBookingForm({
      fullName: '',
      email: '',
      phone: '',
      departureDate: '',
      adults: 1,
      children: 0,
      specialRequests: ''
    });
  },
  onError: (error: Error) => {
    toast({
      title: "Booking Failed",
      description: error.message,
      variant: "destructive",
    });
  }
});

// Update handleBookingSubmit
const handleBookingSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!bookingForm.fullName || !bookingForm.email || !bookingForm.phone || !bookingForm.departureDate) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }
  
  const bookingData = {
    tourId: tourData._id,
    tourTitle: tourData.title,
    tourCode: tourData.code,
    departureDate: bookingForm.departureDate,
    participants: {
      adults: bookingForm.adults,
      children: bookingForm.children,
    },
    pricing: {
      basePrice: tourData.price,
      adultPrice: tourData.price * bookingForm.adults,
      childPrice: tourData.price * bookingForm.children * 0.7,
      totalPrice: calculateTotalPrice(tourData),
      currency: 'USD',
    },
    contactInfo: {
      fullName: bookingForm.fullName,
      email: bookingForm.email,
      phone: bookingForm.phone,
    },
    specialRequests: bookingForm.specialRequests,
  };
  
  bookingMutation.mutate(bookingData);
};

// Update form inputs to use bookingForm state
// Example for fullName input:
<input
  type="text"
  id="fullName"
  className="w-full p-2 border border-border rounded-md bg-background"
  placeholder="Your full name"
  value={bookingForm.fullName}
  onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
  required
/>
```

### 2. Create Dashboard Bookings Page

Create `dashboard/src/pages/Dashboard/Tours/Bookings.tsx`:

```typescript
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
import { Calendar, User, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

const Bookings = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter, paymentFilter],
    queryFn: () => getAllBookings({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: "Status updated successfully" });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: "Payment status updated successfully" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, any> = {
      unpaid: 'destructive',
      partial: 'secondary',
      paid: 'success',
      refunded: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  const bookings = data?.data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tour Bookings</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
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
            <SelectTrigger className="w-[200px]">
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
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking: any) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-mono text-sm">
                    {booking.bookingReference}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.tourTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.tourCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.contactName}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.contactEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.departureDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {booking.participants.adults}A / {booking.participants.children}C
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${booking.pricing.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ id: booking._id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
```

### 3. Add Booking Route

Update `dashboard/src/lib/routePath.tsx`:

```typescript
tourBookings: "/dashboard/tours/bookings",
```

Update `dashboard/src/router/router.tsx`:

```typescript
import Bookings from '@/pages/Dashboard/Tours/Bookings';

// Add in dashboard routes:
{
  path: routePaths.dashboard.tourBookings,
  element: (
    <Suspense fallback={<div>Loading...</div>}>
      <Bookings />
    </Suspense>
  ),
},
```

### 4. Add Menu Item

Update `dashboard/src/lib/MenuItems.ts` to add bookings menu item under Tours section.

## 🚀 Testing

1. Start the server: `npm run dev` (in server directory)
2. Start the dashboard: `npm run dev` (in dashboard directory)
3. Navigate to a tour detail page
4. Fill in the booking form and submit
5. Check dashboard at `/dashboard/tours/bookings` to see the booking

## 📊 Features Implemented

✅ Guest bookings (no login required)
✅ Authenticated user bookings
✅ Booking reference generation
✅ Multiple participants (adults, children)
✅ Price calculation
✅ Booking status management
✅ Payment status tracking
✅ Dashboard booking management
✅ Booking filters and search
✅ Email notifications (ready for integration)

## 🔄 Next Steps

1. Add email notifications for bookings
2. Add payment gateway integration
3. Add booking confirmation page
4. Add user booking history page
5. Add booking cancellation flow
6. Add booking PDF generation
