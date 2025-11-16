import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BookingList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

    // Placeholder for fetching bookings
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['userBookings', filter],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return [];
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading your bookings...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
                <p className="text-muted-foreground">View and manage all your tour bookings</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                    <Button
                        key={tab}
                        variant={filter === tab ? 'default' : 'ghost'}
                        onClick={() => setFilter(tab as typeof filter)}
                        className="capitalize"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Bookings List */}
            {bookings && bookings.length > 0 ? (
                <div className="grid gap-4">
                    {bookings.map((booking: any) => (
                        <Card key={booking._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/booking/${booking._id}`)}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold">{booking.tourTitle}</h3>
                                            <Badge className={getStatusColor(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(booking.departureDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{booking.participants.adults} Adults, {booking.participants.children} Children</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>Booking Reference: {booking.bookingReference}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary mb-2">
                                            ${booking.pricing.totalPrice.toFixed(2)}
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-muted-foreground ml-auto" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
                        <Button onClick={() => navigate('/tours')}>Browse Tours</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BookingList;
