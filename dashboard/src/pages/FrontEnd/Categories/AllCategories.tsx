import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Folder, Filter, Search, ArrowLeft, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryData } from "@/Provider/types";

const AllCategories = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("popularity");

    const { data, isLoading, error } = useQuery({
        queryKey: ['global-categories-approved'],
        queryFn: getAllCategories,
        staleTime: 5 * 60 * 1000,
    });

    const categories: CategoryData[] = useMemo(() => {
        if (!data?.data || !Array.isArray(data.data)) return [];

        let list: CategoryData[] = [...data.data];

        if (searchTerm) {
            list = list.filter((cat: CategoryData) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        list.sort((a: CategoryData, b: CategoryData) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "tours":
                    return (b.usageCount || 0) - (a.usageCount || 0);
                default:
                    return (b.usageCount || 0) - (a.usageCount || 0);
            }
        });

        return list;
    }, [data?.data, searchTerm, sortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative container mx-auto px-4 py-24">
                        <div className="text-center">
                            <div className="h-12 bg-white/20 rounded-lg w-96 mx-auto mb-6 animate-pulse" />
                            <div className="h-6 bg-white/20 rounded w-64 mx-auto animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="h-12 bg-gray-200 rounded-xl flex-1 animate-pulse" />
                            <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg h-48 animate-pulse" />
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
                        <Folder className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Could not load categories</h1>
                    <p className="text-gray-600 mb-6">
                        Please check your connection and try again.
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
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative container mx-auto px-4 py-24">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
                                <Folder className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white">
                                Explore <span className="text-yellow-300">Categories</span>
                            </h1>
                        </div>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                            Browse all tour categories and discover how many adventures are available in each.
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
                {/* Search & Sort */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <Button
                                variant={sortBy === 'popularity' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('popularity')}
                            >
                                Popularity
                            </Button>
                            <Button
                                variant={sortBy === 'name' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('name')}
                            >
                                Name A-Z
                            </Button>
                            <Button
                                variant={sortBy === 'tours' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('tours')}
                            >
                                Tours Count
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Folder className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No categories found</h3>
                            <p className="text-gray-600 mb-8">
                                Try adjusting your search or check back later.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {categories.map((category: CategoryData) => (
                            <Card key={category._id} className="group overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                                                {category.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                                                {category.description}
                                            </p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-0">
                                            {category.usageCount || 0} tours
                                        </Badge>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            Approved: {category.isApproved ? 'Yes' : 'Pending'}
                                        </span>
                                        <Link to={`/categories/${category._id}`}>
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <FolderOpen className="h-4 w-4" />
                                                View Details
                                            </Button>
                                        </Link>
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

export default AllCategories;
