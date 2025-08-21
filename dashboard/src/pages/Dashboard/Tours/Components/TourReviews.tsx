import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ReviewsManager from '@/userDefinedComponents/reviews/ReviewsManager';
import { MessageSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';



const TourReviews = () => {
    const tourId = useParams();
    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-secondary border-b pb-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Tour Reviews</CardTitle>
                </div>
                <CardDescription>
                    Manage customer reviews and feedback
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {tourId.tourId ? (
                    <ReviewsManager tourId={tourId.tourId} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed border-border text-center bg-secondary">
                        <div className="bg-primary/10 p-3 rounded-full mb-3">
                            <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">Save Tour First</h3>
                        <p className="text-muted-foreground max-w-md">
                            Reviews will be available after you save the tour.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TourReviews;
