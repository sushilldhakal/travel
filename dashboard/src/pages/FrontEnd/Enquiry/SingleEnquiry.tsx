import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SingleEnquiry = () => {
    const { enquiryId } = useParams<{ enquiryId: string }>();
    const navigate = useNavigate();

    const { data: enquiry, isLoading } = useQuery({
        queryKey: ['enquiry', enquiryId],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return null;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'responded':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading enquiry details...</div>
            </div>
        );
    }

    if (!enquiry) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center">
                        <h3 className="text-xl font-semibold mb-2">Enquiry not found</h3>
                        <p className="text-muted-foreground mb-6">The enquiry you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/enquiry')}>View All Enquiries</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate('/enquiry')} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Enquiries
            </Button>

            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl mb-2">{enquiry.tourTitle}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Badge className={getStatusColor(enquiry.status)}>
                                {enquiry.status}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{enquiry.message}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold">{enquiry.email}</p>
                            </div>
                        </div>
                        {enquiry.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-semibold">{enquiry.phone}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {enquiry.response && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Response from Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{enquiry.response}</p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Responded on: {new Date(enquiry.respondedAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SingleEnquiry;
