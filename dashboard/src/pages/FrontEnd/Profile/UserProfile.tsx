import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserProfile = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const navigate = useNavigate();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', profileId],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return null;
        },
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center">
                        <h3 className="text-xl font-semibold mb-2">Profile not found</h3>
                        <p className="text-muted-foreground mb-6">The profile you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/')}>Go Home</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile.avatar} alt={profile.name} />
                                <AvatarFallback>
                                    <User className="h-12 w-12" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
                                        <div className="space-y-2 text-muted-foreground">
                                            {profile.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{profile.email}</span>
                                                </div>
                                            )}
                                            {profile.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{profile.phone}</span>
                                                </div>
                                            )}
                                            {profile.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{profile.location}</span>
                                                </div>
                                            )}
                                            {profile.joinedDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Tabs */}
                <Tabs defaultValue="bookings" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bookings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Bookings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">No bookings yet.</p>
                                <Button className="mt-4" onClick={() => navigate('/booking')}>
                                    View All Bookings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="enquiries">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Enquiries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">No enquiries yet.</p>
                                <Button className="mt-4" onClick={() => navigate('/enquiry')}>
                                    View All Enquiries
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">No reviews yet.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default UserProfile;
