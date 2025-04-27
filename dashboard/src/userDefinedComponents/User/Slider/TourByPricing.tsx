import { useQuery } from "@tanstack/react-query";
import { getLatestTours } from "@/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import AutoScroll from 'embla-carousel-auto-scroll';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { BellPlus, CornerDownRight, Plane, ThumbsUp } from "lucide-react";

const TourByPricing = () => {
    const [progress, setProgress] = useState(0)
    const [api, setApi] = useState<any>()

    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
    });

    useEffect(() => {
        if (!api) {
            return
        }

        const handleSelect = () => {
            setProgress((api.selectedScrollSnap() / (api.scrollSnapList().length - 1)) * 100)
        }

        api.on("select", handleSelect)

        // Call handleSelect once to set initial progress
        handleSelect()

        return () => {
            api.off("select", handleSelect)
        }
    }, [api])


    const sortedTours = data?.data.tours
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    //console.log("sortedTours", sortedTours)

    return (
        <div className="pattern-1 pb-16 relative">
            {/* <Progress className="
            absolute top-[50%] right-[-50%] rotate-90 h-1 transition-all duration-300 ease-in-out" value={progress} max={100} /> */}
            <div className="mb-4">
                <div className="flex items-center space-x-1">
                    <ThumbsUp size="28px" />
                    <h2 className="ml-5 pl-3 text-2xl font-bold">Offered Tours</h2>
                </div>
            </div>
            <div className="flex flex-row relative">
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            playOnInit: true,
                            delay: 2000,
                        }),
                        AutoScroll({
                            playOnInit: true, stopOnInteraction: false, stopOnMouseEnter: false,
                            speed: 0.5
                        }),
                    ]}
                    orientation="vertical"
                    className="w-full"
                >

                    <CarouselContent className="-mt-1 h-[600px]">
                        {sortedTours?.map((tour, index) => (
                            <CarouselItem key={index} className="pt-1 sm:basis-1/5 md:basis-1/5 lg:basis-1/6">
                                <div className="flex flex-col overflow-auto z-10" key={tour._id}>
                                    <Card className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition">

                                        {/* Image Section */}
                                        <div className="relative">
                                            <div className="showPattern">
                                                <img
                                                    src={tour.coverImage}
                                                    alt={tour.coverImage}
                                                    className="object-cover w-[80px]"
                                                    style={{ aspectRatio: "64/64", objectFit: "cover" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between w-full mb-2">
                                                <Link to={`/tours/${tour._id}`} className="text-md capitalize font-semibold">
                                                    {tour.title}
                                                </Link>
                                                <span className="text-sm text-muted-foreground">
                                                    {tour.author[0]?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center w-full">
                                                <div className="bg-primary px-1 py-2 text-primary-foreground text-sm/[6px] rounded">
                                                    20% Off
                                                </div>
                                                <p className="text-sm text-muted-foreground font-bold">
                                                    $ {tour.price}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="w-1 ml-2 bg-gray-200">
                    <div
                        className="w-full bg-primary transition-all duration-1000 ease-in-out"
                        style={{ height: `${progress}%` }}
                    ></div>
                </div>
            </div>


        </div>
    );
}

export default TourByPricing;
