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


// function SampleNextArrow(props) {
//     const { className, style, onClick } = props;
//     return (
//         <div
//             className={` ${className} border-rounded-5 !bg-primary !flex items-center justify-center`}
//             style={{ ...style, display: "block" }}
//             onClick={onClick}
//         >
//             <ChevronRight size="24px" className="text-secondary" />
//         </div>
//     );
// }

// function SamplePrevArrow(props) {
//     const { className, style, onClick } = props;
//     return (
//         <div
//             className={` ${className} border-rounded-5 !bg-primary !flex items-center justify-center !left-[calc(100%-100px)]`}
//             style={{ ...style, display: "block" }}
//             onClick={onClick}
//         >
//             <ChevronLeft size="24px" className="text-secondary" />
//         </div>
//     );
// }

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

    // const settings = {
    //     dots: false,
    //     infinite: true,
    //     slidesToShow: 3,
    //     slidesToScroll: 1,
    //     autoplay: true,
    //     speed: 2000,
    //     autoplaySpeed: 8000,
    //     cssEase: "linear",
    //     centerPadding: '60px',
    //     nextArrow: <SampleNextArrow />,
    //     prevArrow: <SamplePrevArrow />,
    //     responsive: [
    //         {
    //             breakpoint: 1024,
    //             settings: {
    //                 slidesToShow: 2,
    //                 slidesToScroll: 2,
    //                 infinite: true,
    //                 dots: true
    //             }
    //         },
    //         {
    //             breakpoint: 768,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1,
    //                 initialSlide: 2
    //             }
    //         },
    //         {
    //             breakpoint: 480,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1
    //             }
    //         }
    //     ]
    // };

    const sortedTours = data?.data.tours.sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    return (
        <div className="pattern-2 pt-10 relative">
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
                                        className="mr-5 banner-content parallax-container relative bg-fixed bg-center bg-cover bg-no-repeat"

                                    >
                                        <div className="relative">
                                            <div className="showPattern">

                                                <img src={tour.coverImage} alt={tour.coverImage} className="w-full h-full object-cover" />
                                            </div>

                                        </div>

                                        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative flex items-center h-full">
                                            <div className="overlay relative z-10 p-5 w-full">
                                                <h2 className="text-3xl capitalize">{tour.title}</h2>

                                                <p
                                                    className="text-lg capitalize mt-4 mb-4 tracking-wide"
                                                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                                />
                                                <p>$ {tour.price}</p>

                                                <div className="mt-5 relative z-10 grid grid-cols-2 gap-4">
                                                    <Link to={`/tours/${tour._id}`} className="btn btn-primary mr-5 ">
                                                        <Button>View Tour</Button>
                                                    </Link>
                                                    <Link to={`/tours/${tour._id}`} className="btn btn-primary ml-5">
                                                        <Button>Book Tour</Button>
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
            {/* <Slider className="gap-5 latest-tours-slider overflow-hidden" {...settings}>
                {sortedTours?.map((tour: any) => {
                    const descriptionHtml = tour.description ? jsonToHtml(JSON.parse(tour.description)) : "No description available.";

                    return (
                        <div className="mt-20" key={tour._id}>
                            <Card key={tour._id}
                                className="m-2 banner-content parallax-container relative bg-fixed bg-center bg-cover bg-no-repeat"

                            >
                                <div className="relative">
                                    <div className="showPattern">

                                        <img src={tour.coverImage} alt={tour.coverImage} className="w-full h-full object-cover" />
                                    </div>

                                </div>

                                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative flex items-center h-full">
                                    <div className="overlay relative z-10 p-5 w-full">
                                        <h2 className="text-3xl capitalize">{tour.title}</h2>

                                        <p
                                            className="text-lg capitalize mt-4 mb-4 tracking-wide"
                                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                        />
                                        <p>$ {tour.price}</p>

                                        <div className="mt-5 relative z-10 grid grid-cols-2 gap-4">
                                            <Link to={`/tours/${tour._id}`} className="btn btn-primary mr-5 ">
                                                <Button>View Tour</Button>
                                            </Link>
                                            <Link to={`/tours/${tour._id}`} className="btn btn-primary ml-5">
                                                <Button>Book Tour</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </Card>
                        </div>
                    );
                })}
            </Slider> */}
        </div>
    )
}

export default LatestTour