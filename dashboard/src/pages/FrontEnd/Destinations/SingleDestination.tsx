import { useQuery } from "@tanstack/react-query";
import { getDestination } from "@/http";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Globe,
    Building,
    ArrowLeft,
    Star,
    Users,
    Camera,
    Heart,
    Share2,
    Calendar,
    TrendingUp,
    Award,
    Map as MapIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RichTextRenderer from "@/components/RichTextRenderer";
import { Destination } from "@/Provider/types";

const SingleDestination = () => {
    const { destinationId } = useParams<{ destinationId: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ['destination', destinationId],
        queryFn: () => getDestination(destinationId!),
        enabled: !!destinationId,
        staleTime: 5 * 60 * 1000,
    });

    const destination: Destination | undefined = data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Skeleton */}
                <div className="relative h-[60vh] bg-gray-300 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Content Skeleton */}
                <div className="container mx-auto px-4 -mt-32 relative z-10">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                        <div className="h-12 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !destination) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't find the destination you're looking for.
                    </p>
                    <Link to="/destinations">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Destinations
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section with Cover Image */}
            <div className="relative h-[60vh] overflow-hidden">
                <img
                    src={destination.coverImage}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Floating Action Buttons */}
                <div className="absolute top-8 right-8 flex gap-3">
                    <Button
                        size="icon"
                        className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-full h-12 w-12"
                    >
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button
                        size="icon"
                        className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-full h-12 w-12"
                    >
                        <Heart className="h-5 w-5" />
                    </Button>
                </div>

                {/* Back Button */}
                <div className="absolute top-8 left-8">
                    <Link to="/destinations">
                        <Button
                            variant="outline"
                            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Destinations
                        </Button>
                    </Link>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-yellow-500 text-white border-0 text-lg px-4 py-2">
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                4.8
                            </Badge>
                            {destination.featuredTours && destination.featuredTours.length > 0 && (
                                <Badge className="bg-blue-500 text-white border-0 text-lg px-4 py-2">
                                    <Users className="h-4 w-4 mr-1" />
                                    {destination.featuredTours.length} Tours Available
                                </Badge>
                            )}
                            <Badge className="bg-green-500 text-white border-0 text-lg px-4 py-2">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Popular
                            </Badge>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                            {destination.name}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90 text-lg">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                <span>{destination.country}</span>
                            </div>
                            {destination.region && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    <span>{destination.region}</span>
                                </div>
                            )}
                            {destination.city && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    <span>{destination.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
                {/* Main Info Card */}
                <Card className="bg-white rounded-3xl shadow-2xl mb-8 border-0">
                    <CardContent className="p-8 md:p-12">
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {/* Stats Cards */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">2.5k+</h3>
                                <p className="text-gray-600">Photos Shared</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">15k+</h3>
                                <p className="text-gray-600">Visitors Annually</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Top 10</h3>
                                <p className="text-gray-600">Rated Destination</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                About This Destination
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700">
                                <RichTextRenderer
                                    content={destination.description}
                                    className="[&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
                                />
                            </div>
                        </div>

                        {/* Best Time to Visit */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 mb-12 border border-orange-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Time to Visit</h3>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        The ideal time to visit {destination.name} is during the spring and autumn months
                                        when the weather is pleasant and perfect for exploration. The region offers stunning
                                        views and comfortable temperatures during these seasons.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                                Location Details
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapPin className="h-6 w-6 text-blue-500" />
                                        <h3 className="text-xl font-semibold text-gray-900">Country</h3>
                                    </div>
                                    <p className="text-gray-700 text-lg">{destination.country}</p>
                                </div>

                                {destination.region && (
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Globe className="h-6 w-6 text-green-500" />
                                            <h3 className="text-xl font-semibold text-gray-900">Region</h3>
                                        </div>
                                        <p className="text-gray-700 text-lg">{destination.region}</p>
                                    </div>
                                )}

                                {destination.city && (
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Building className="h-6 w-6 text-purple-500" />
                                            <h3 className="text-xl font-semibold text-gray-900">City</h3>
                                        </div>
                                        <p className="text-gray-700 text-lg">{destination.city}</p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapIcon className="h-6 w-6 text-red-500" />
                                        <h3 className="text-xl font-semibold text-gray-900">Coordinates</h3>
                                    </div>
                                    <p className="text-gray-700 text-lg">View on Map</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Ready to Explore {destination.name}?
                            </h2>
                            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                                Discover amazing tours and experiences in this beautiful destination.
                                Book your adventure today and create unforgettable memories.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/tours">
                                    <Button
                                        size="lg"
                                        className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
                                    >
                                        <Camera className="h-5 w-5 mr-2" />
                                        Browse Tours
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl"
                                >
                                    <Heart className="h-5 w-5 mr-2" />
                                    Add to Wishlist
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SingleDestination;
