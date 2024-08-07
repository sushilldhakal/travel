import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import { getTours } from "@/http/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


const HomeSlider = () => {
    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: getTours,
    });

    const settings = {
        dots: true,
        autoplay: false,
        arrows: false,
        infinite: true,
        autoplaySpeed: 14000,
        speed: 1000,
        slidesToShow: 1,
        adaptiveHeight: true,
        fade: true,
        draggable: true,
        slidesToScroll: 1,
        touchThreshold: 1000,
        cssEase: "ease"
    };

    const sortedTours = data?.data.tours.sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5); console.log(data?.data.tours)
    return (
        <div className="overflow-hidden main-slider pattern-2">
            <Slider className="banner-slider" {...settings}>
                {sortedTours?.map((tour: { _id: string; coverImage: string; title: string; description: string }) => (
                    <div key={tour._id} className="w-full">
                        <div
                            className="banner-content"
                            style={{
                                backgroundImage: `url(${tour.coverImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: 'calc(100vh - 104px)',
                            }}
                        >
                            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative flex items-center h-full">
                                <div className="overlay absolute z-10 p-5 text-white w-1/2">
                                    <h2 className="text-3xl capitalize [text-shadow:_3px_3px_3px_rgb(0_0_0_/_100%)]">{tour.title}</h2>
                                    <p className="text-lg capitalize mt-4 mb-4 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_100%)] tracking-wide">
                                        {tour.description ? `${tour.description.substring(0, 400)}...` : "No description available."}
                                        <span><Link to={`/tours/${tour._id}`}>Read More</Link></span>
                                    </p>
                                    <div className="mt-5">
                                        <Link to={`/tours/${tour._id}`} className="btn btn-primary mr-5">
                                            <Button>View Tour</Button>
                                        </Link>
                                        <Link to={`/tours/${tour._id}`} className="btn btn-primary">
                                            <Button>Book Tour</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="showPattern"></div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default HomeSlider