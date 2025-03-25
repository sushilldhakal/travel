import { useQuery } from "@tanstack/react-query";
import { getLatestTours } from "@/http/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BellPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react";


const jsonToHtml = (json: any) => {
    const createHtml = (node: any) => {
        if (!node) return "";

        switch (node.type) {
            case "doc":
                return (node.content || []).map(createHtml).join("") || "";

            case "paragraph":
                return `<p>${(node.content || []).map(createHtml).join("") || ""}</p>`;

            case "text":
                let text = node.text || "";
                if (text.length > 400) {
                    text = text.substring(0, 400) + "...Read More";
                }
                node.marks?.forEach((mark: any) => {
                    if (mark.type === "link") {
                        text = `<a href="${mark.attrs?.href || '#'}" target="${mark.attrs?.target || '_self'}">${text}</a>`;
                    }
                    if (mark.type === "code") {
                        text = `<code>${text}</code>`;
                    }
                });
                return text;

            default:
                console.warn(`Unhandled node type: ${node.type}`);
                return "";
        }
    };

    return createHtml(json);
};


const LatestTour = () => {
    const [api, setApi] = useState<any>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])
    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
    });


    const sortedTours = data?.data.tours.sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    return (
        <div className="pattern-2 pt-10 mb-20 relative">
            <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-1">
                    <div className="flex items-center mb-4">
                        <BellPlus size="28px" />
                        <h2 className="ml-5 text-2xl font-bold ">
                            Latest Tours</h2>
                        <Link className="ml-5" to={''} > / <span className="ml-5"> VIEW ALL</span></Link>
                    </div>
                </div>
                <div className="flex space-x-2 mb-3 mr-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-default"
                        onClick={() => api?.scrollPrev()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-default"
                        onClick={() => api?.scrollNext()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                }}
                className="w-full mx-auto">
                <CarouselContent className="-ml-1">
                    {sortedTours?.map((tour, index) => {
                        const descriptionHtml = tour.description ? jsonToHtml(JSON.parse(tour.description)) : "No description available.";
                        return (
                            <CarouselItem key={index} className="pl-0 md:basis-1/2 lg:basis-1/2">
                                <div className="p-0">
                                    <Card key={tour._id}
                                        className="mr-5 h-full relative overflow-hidden"
                                    >
                                        <div className="relative h-[400px]">
                                            <img src={tour.coverImage} alt={tour.coverImage} className="w-full h-full object-cover" />
                                            <div className="showPattern absolute inset-0" />
                                        </div>

                                        <div className="px-6 py-8">
                                            <div className="max-w-7xl mx-auto">
                                                <h2 className="text-3xl capitalize mb-4">{tour.title}</h2>
                                                <p
                                                    className="text-lg capitalize mb-4 tracking-wide"
                                                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                                />
                                                <p className="text-xl font-bold mb-6">${tour.price}</p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Link to={`/tours/${tour._id}`} className="btn btn-primary">
                                                        <Button>View More</Button>
                                                    </Link>
                                                    <Link to={`/tours/${tour._id}`} className="btn btn-primary">
                                                        <Button>Book Now</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>

        </div>
    )
}

export default LatestTour