import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CategoryData } from "@/Provider/types";

const ExploreCategories = () => {
    const [api, setApi] = useState<CarouselApi | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['global-categories-approved'],
        queryFn: getAllCategories,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (data) {
            console.log('🔍 ExploreCategories - Categories data:', data);
        }
        if (error) {
            console.error('❌ ExploreCategories - Categories error:', error);
        }
    }, [data, error]);

    const categories: CategoryData[] = useMemo(() => {
        if (!data?.data || !Array.isArray(data.data)) return [];

        return [...data.data]
            .sort((a: CategoryData, b: CategoryData) => (b.usageCount || 0) - (a.usageCount || 0))
            .slice(0, 12);
    }, [data?.data]);

    useEffect(() => {
        if (!api) return;
        const handleSelect = () => {
            // placeholder for future use
        };
        api.on("select", handleSelect);
        return () => {
            api.off("select", handleSelect);
        };
    }, [api]);

    if (isLoading) {
        return (
            <div className="py-16 bg-secondary/10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Folder className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-bold">Explore Categories</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-40" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!categories.length) return null;

    return (
        <div className="py-16 bg-secondary/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Folder className="text-primary h-6 w-6" />
                        <h2 className="text-2xl font-bold">Explore Categories</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/categories">
                            <Button variant="default" size="sm">
                                View All Categories
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => api?.scrollPrev()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous slide</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => api?.scrollNext()}
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next slide</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <Carousel
                    setApi={setApi}
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {categories.map((category) => (
                            <CarouselItem
                                key={category._id}
                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4"
                            >
                                <Card className="overflow-hidden h-full border shadow-xs hover:shadow-md transition-all duration-300">
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg line-clamp-1">
                                                {category.name}
                                            </h3>
                                            <Badge variant="secondary">
                                                {category.usageCount || 0} tours
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                            {category.description}
                                        </p>
                                        <div className="mt-auto">
                                            <Link to={`/categories/${category._id}`} className="w-full block">
                                                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                                    <FolderOpen className="h-4 w-4" />
                                                    View Category
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="hidden" />
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
};

export default ExploreCategories;
