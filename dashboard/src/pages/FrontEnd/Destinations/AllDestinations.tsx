import { useQuery } from "@tanstack/react-query";
import { getAllDestinations } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Building, Search, Filter, ArrowLeft, Star, Users, Camera, Heart, Eye, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Destination } from "@/Provider/types";
import RichTextRenderer from "@/components/RichTextRenderer";

const AllDestinations = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("popularity");
    const [filterByCountry, setFilterByCountry] = useState("all");

    // Fetch destinations with proper caching
    const { data, isLoading, error } = useQuery({
        queryKey: ['global-destinations-approved'],
        queryFn: getAllDestinations,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Get unique countries for filter
    const countries = useMemo((): string[] => {
        if (!data?.data || !Array.isArray(data.data)) return [];
        const uniqueCountries = [...new Set(data.data.map((dest: Destination) => dest.country))];
        return uniqueCountries.filter(Boolean).sort() as string[];
    }, [data?.data]);

    // Filter and sort destinations
    const filteredDestinations = useMemo(() => {
        if (!data?.data || !Array.isArray(data.data)) return [];

        let filtered = [...data.data];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((dest: Destination) =>
                dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dest.region?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply country filter
        if (filterByCountry !== "all") {
            filtered = filtered.filter((dest: Destination) => dest.country === filterByCountry);
        }

        // Apply sorting
        filtered.sort((a: Destination, b: Destination) => {
            switch (sortBy) {
                case "popularity":
                    if (a.popularity && b.popularity) {
                        return b.popularity - a.popularity;
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "name":
                    return a.name.localeCompare(b.name);
                case "country":
                    return a.country.localeCompare(b.country);
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [data?.data, searchTerm, sortBy, filterByCountry]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section Skeleton */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative container mx-auto px-4 py-24">
                        <div className="text-center">
                            <div className="h-12 bg-white/20 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
                            <div className="h-6 bg-white/20 rounded w-64 mx-auto animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="container mx-auto px-4 py-12">
                    {/* Filters Skeleton */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="h-12 bg-gray-200 rounded-xl flex-1 animate-pulse"></div>
                            <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
                            <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg h-96 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't load the destinations. Please check your connection and try again.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                <div className="relative container mx-auto px-4 py-24">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white">
                                Explore <span className="text-yellow-300">Destinations</span>
                            </h1>
                        </div>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                            Discover breathtaking destinations around the world. From hidden gems to iconic landmarks,
                            find your perfect adventure and create memories that last a lifetime.
                        </p>

                        <Link to="/">
                            <Button
                                variant="outline"
                                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Advanced Search & Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Search destinations, countries, cities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full lg:w-56 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popularity">🔥 Most Popular</SelectItem>
                                <SelectItem value="name">📝 Name A-Z</SelectItem>
                                <SelectItem value="country">🌍 Country A-Z</SelectItem>
                                <SelectItem value="newest">✨ Newest First</SelectItem>
                                <SelectItem value="oldest">📅 Oldest First</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterByCountry} onValueChange={setFilterByCountry}>
                            <SelectTrigger className="w-full lg:w-56 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">🌎 All Countries</SelectItem>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-gray-700 font-medium">
                            <span className="text-blue-600 font-bold">{filteredDestinations.length}</span> amazing destination{filteredDestinations.length !== 1 ? 's' : ''} found
                            {searchTerm && <span className="text-purple-600"> for "{searchTerm}"</span>}
                            {filterByCountry !== "all" && <span className="text-green-600"> in {filterByCountry}</span>}
                        </p>
                    </div>
                </div>

                {/* Destinations Grid */}
                {filteredDestinations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Globe className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No destinations found</h3>
                            <p className="text-gray-600 mb-8">
                                We couldn't find any destinations matching your criteria. Try adjusting your search or filters.
                            </p>
                            <Button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterByCountry("all");
                                    setSortBy("popularity");
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Clear All Filters
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredDestinations.map((destination: Destination) => (
                            <Card key={destination._id} className="group overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={destination.coverImage}
                                        alt={destination.name}
                                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Floating Elements */}
                                    <div className="absolute top-4 left-4">
                                        {destination.featuredTours && destination.featuredTours.length > 0 && (
                                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
                                                <Users className="h-3 w-3 mr-1" />
                                                {destination.featuredTours.length} Tours
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <Heart className="h-4 w-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Overlay Content */}
                                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <Link to={`/destinations/${destination._id}`}>
                                            <Button className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                                                <Camera className="h-4 w-4 mr-2" />
                                                Explore Now
                                            </Button>
                                        </Link>
                                    </div>fix
                                </div>

                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                                            {destination.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-sm font-semibold text-gray-700">4.8</span>
                                        </div>
                                    </div>

                                    <div className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        <RichTextRenderer
                                            content={destination.description}
                                            className="text-sm [&>p]:mb-0 [&>p]:leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium">{destination.country}</span>
                                        </div>
                                        {destination.region && (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Globe className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{destination.region}</span>
                                            </div>
                                        )}
                                        {destination.city && (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Building className="h-4 w-4 text-purple-500" />
                                                <span className="text-sm">{destination.city}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span>2.1k views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                <span>156 likes</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            Popular
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllDestinations;
