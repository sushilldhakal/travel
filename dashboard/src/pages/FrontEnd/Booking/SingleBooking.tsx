import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Phone, Mail, FileText, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SingleBooking = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    // Placeholder for fetching single booking
    const { data: booking, isLoading } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return null;
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
                <div className="text-center">Loading booking details...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center">
                        <h3 className="text-xl font-semibold mb-2">Booking not found</h3>
                        <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/booking')}>View All Bookings</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate('/booking')} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Booking Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{booking.tourTitle}</CardTitle>
                                    <p className="text-muted-foreground">Booking Reference: {booking.bookingReference}</p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                    {booking.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Departure Date</p>
                                        <p className="font-semibold">{new Date(booking.departureDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Participants</p>
                                        <p className="font-semibold">{booking.participants.adults} Adults, {booking.participants.children} Children</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-semibold">{booking.contactEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-semibold">{booking.contactPhone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Special Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{booking.specialRequests}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pricing Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span>Base Price</span>
                                <span>${booking.pricing.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Adults ({booking.participants.adults})</span>
                                <span>${booking.pricing.adultPrice.toFixed(2)}</span>
                            </div>
                            {booking.participants.children > 0 && (
                                <div className="flex justify-between">
                                    <span>Children ({booking.participants.children})</span>
                                    <span>${booking.pricing.childPrice.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">${booking.pricing.totalPrice.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardContent className="pt-6 space-y-3">
                            <Button className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download Voucher
                            </Button>
                            {booking.status === 'confirmed' && (
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Itinerary
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SingleBooking;
