import { useQuery } from "@tanstack/react-query";
import { getAllDestinations } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight, Globe, Building } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Destination {
    _id: string;
    name: string;
    description: string;
    coverImage: string;
    country: string;
    region?: string;
    city?: string;
    featuredTours?: string[];
    popularity?: number;
    createdAt: string;
}

const DestinationTour = () => {
    const [api, setApi] = useState<CarouselApi | null>(null);

    // Fetch destinations with proper caching
    const { data, isLoading } = useQuery({
        queryKey: ['destinations'],
        queryFn: getAllDestinations,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Memoize the sorted destinations to prevent recalculation on every render
    const sortedDestinations = useMemo(() => {
        if (!data?.destinations) return [];
        
        return [...data.destinations]
            .sort((a: Destination, b: Destination) => {
                // First sort by popularity if available
                if (a.popularity && b.popularity) {
                    return b.popularity - a.popularity;
                }
                // Fall back to sorting by creation date
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 8); // Show up to 8 destinations
    }, [data?.destinations]);

    // Set up carousel API
    useEffect(() => {
        if (!api) return;
        
        // Optional: Add any carousel event handling here
        const handleSelect = () => {
            // We can access the current slide index with api.selectedScrollSnap() when needed
        };
        
        api.on("select", handleSelect);
        
        return () => {
            api.off("select", handleSelect);
        };
    }, [api]);

    // Early return for loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Popular Destinations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 bg-secondary/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Globe className="text-primary h-6 w-6" />
                        <h2 className="text-2xl font-bold">Explore Destinations</h2>
                    </div>
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

                <Carousel
                    setApi={setApi}
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {sortedDestinations.map((destination: Destination) => (
                            <CarouselItem key={destination._id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                                <Card className="overflow-hidden h-full border shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={destination.coverImage}
                                            alt={destination.name}
                                            className="h-full w-full object-cover transition-all hover:scale-105 duration-300"
                                        />
                                        {destination.featuredTours && destination.featuredTours.length > 0 && (
                                            <Badge className="absolute top-2 right-2 bg-primary/80 hover:bg-primary">
                                                {destination.featuredTours.length} Tours
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{destination.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                            {destination.description}
                                        </p>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>{destination.country}</span>
                                            </div>
                                            {destination.region && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Globe className="h-3.5 w-3.5" />
                                                    <span>{destination.region}</span>
                                                </div>
                                            )}
                                            {destination.city && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Building className="h-3.5 w-3.5" />
                                                    <span>{destination.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Link to={`/destinations/${destination._id}`} className="w-full">
                                            <Button variant="outline" className="w-full">
                                                Explore Destination
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
};

export default DestinationTour;