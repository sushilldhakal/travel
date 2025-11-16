import { useQuery } from "@tanstack/react-query";
import { getCategory } from "@/http/categoryApi";
import { searchTours } from "@/http";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Folder, ArrowLeft, MapPin, Users, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryData, Tour } from "@/Provider/types";

const SingleCategory = () => {
    const { categoryId } = useParams<{ categoryId: string }>();

    const { data: categoryResponse, isLoading, error } = useQuery({
        queryKey: ['category', categoryId],
        queryFn: () => getCategory(categoryId!),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });

    const { data: toursResponse, isLoading: toursLoading } = useQuery({
        queryKey: ['category-tours', categoryId],
        queryFn: () => searchTours(`category=${categoryId}`),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });

    const category: CategoryData | undefined = categoryResponse?.data || categoryResponse;
    const tours: Tour[] = toursResponse?.data?.tours || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="relative h-[40vh] bg-gray-300 animate-pulse" />
                <div className="container mx-auto px-4 -mt-24 relative z-10">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                        <div className="h-10 bg-gray-200 rounded w-2/3 mb-4 animate-pulse" />
                        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Folder className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't find the category you're looking for.
                    </p>
                    <Link to="/categories">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative h-[40vh] overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute top-8 left-8">
                    <Link to="/categories">
                        <Button
                            variant="outline"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <Badge className="bg-yellow-500 text-white border-0 text-lg px-4 py-2 mb-4">
                            Category
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                            {category.name}
                        </h1>
                        <p className="text-white/90 max-w-2xl mx-auto text-lg">
                            {category.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Category Info */}
                    <Card className="md:col-span-1 bg-white rounded-3xl shadow-2xl border-0">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Folder className="h-5 w-5 text-primary" />
                                Category Details
                            </h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <Badge variant={category.isApproved ? 'default' : 'secondary'}>
                                        {category.isApproved ? 'Approved' : category.approvalStatus}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tours Associated</span>
                                    <span className="font-semibold">
                                        {typeof category.usageCount === 'number' ? category.usageCount : tours.length}
                                    </span>
                                </div>
                                <div className="pt-2 border-t text-xs text-gray-500">
                                    This category is used to organize tours into themes such as adventure, culture, family, and more.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tours List */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Tours in this Category
                            </h2>
                            <Link to="/tours">
                                <Button variant="outline" size="sm">
                                    Browse All Tours
                                </Button>
                            </Link>
                        </div>

                        {toursLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl shadow-lg h-40 animate-pulse" />
                                ))}
                            </div>
                        ) : tours.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-6 w-6 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No tours found in this category</h3>
                                <p className="text-gray-600 mb-4">
                                    Check back later as new tours are added.
                                </p>
                                <Link to="/tours">
                                    <Button>Browse All Tours</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tours.map((tour: Tour) => (
                                    <Card key={tour._id} className="overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-1">
                                        <CardContent className="p-4 flex gap-4">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                {tour.coverImage && (
                                                    <img
                                                        src={tour.coverImage}
                                                        alt={tour.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                                                    {tour.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {tour.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span>{tour.destination}</span>
                                                    </div>
                                                    <Link to={`/tours/${tour._id}`}>
                                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                            <Camera className="h-3.5 w-3.5" />
                                                            View Tour
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleCategory;
