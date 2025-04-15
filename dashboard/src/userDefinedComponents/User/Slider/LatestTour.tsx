import { useQuery } from "@tanstack/react-query";
import { getLatestTours } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react";

interface Tour {
    _id: string;
    title: string;
    coverImage: string;
    duration: string;
    outline: string;
    price: number;
    originalPrice?: number;
    createdAt: string;
}

const LatestTour = () => {
    const [api, setApi] = useState<any>()
    // Removed unused 'current' state variable

    useEffect(() => {
        if (!api) {
            return
        }

        // Update carousel when API changes
        api.on("select", () => {
            // We can access the current slide index with api.selectedScrollSnap() when needed
        })
    }, [api])

    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
    });

    const sortedTours = data?.data?.tours?.sort((a: Tour, b: Tour) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <ThumbsUp className="text-primary" />
                    <h2 className="text-3xl font-bold ml-2">TOP VACATION TOURS</h2>
                </div>
                <div className="flex items-center">
                    <Link to="/tours" className="text-primary font-medium mr-4">
                        VIEW ALL
                    </Link>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-gray-300 hover:bg-gray-100"
                            onClick={() => api?.scrollPrev()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-gray-300 hover:bg-gray-100"
                            onClick={() => api?.scrollNext()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                }}
                className="w-full">
                <CarouselContent className="-ml-4">
                    {sortedTours?.map((tour: Tour, index: number) => (
                        <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/2">
                            <div className="bg-secondary rounded-md overflow-hidden shadow-sm border border-gray-200">
                                {/* Tour Image */}
                                <div className="relative h-[420px] overflow-hidden">
                                    <img
                                        src={tour.coverImage}
                                        alt={tour.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>

                                {/* Tour Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {tour.title || "Switzerland - 7 days in zurich, zermatt"}
                                    </h3>

                                    <div className="flex items-center text-gray-500 mb-3">
                                        <Calendar size={16} className="mr-1" />
                                        <span>{tour.duration || "7 Days"}</span>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {tour.outline || "Some quick example text to build on the card title and make up the bulk of the card's content."}
                                    </p>

                                    {/* Rating */}
                                    <div className="flex items-center mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className="w-4 h-4 text-primary fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                                            </svg>
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">
                                            (2 REVIEW)
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <div>
                                            <span className="text-gray-500 text-sm">From</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 line-through text-sm mr-2">${tour.originalPrice || "4,300"}</span>
                                            <span className="text-primary font-bold text-xl">${tour.price || "3500"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export default LatestTour;