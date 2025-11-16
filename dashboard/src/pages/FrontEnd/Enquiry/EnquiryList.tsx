import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EnquiryList = () => {
    const navigate = useNavigate();

    const { data: enquiries, isLoading } = useQuery({
        queryKey: ['userEnquiries'],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return [];
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
                <div className="text-center">Loading your enquiries...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">My Enquiries</h1>
                <p className="text-muted-foreground">View and track all your tour enquiries</p>
            </div>

            {enquiries && enquiries.length > 0 ? (
                <div className="grid gap-4">
                    {enquiries.map((enquiry: any) => (
                        <Card key={enquiry._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/enquiry/${enquiry._id}`)}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                            <h3 className="text-xl font-semibold">{enquiry.tourTitle}</h3>
                                            <Badge className={getStatusColor(enquiry.status)}>
                                                {enquiry.status}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-3 line-clamp-2">{enquiry.message}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No enquiries found</h3>
                        <p className="text-muted-foreground mb-6">Have questions about a tour? Send us an enquiry!</p>
                        <Button onClick={() => navigate('/tours')}>Browse Tours</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EnquiryList;
