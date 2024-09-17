import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import { getLatestTours } from "@/http/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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


const HomeSlider = () => {
    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
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

    useEffect(() => {
        const handleScroll = () => {
            const parallaxContainers = document.querySelectorAll('.parallax-container');
            parallaxContainers.forEach((container) => {
                // Cast 'container' to 'HTMLElement' so TypeScript knows it has a 'style' property
                const htmlElement = container as HTMLElement;
                const scrollPosition = window.pageYOffset;
                htmlElement.style.backgroundPositionY = `${scrollPosition * 0.5}px`; // Adjust this value for stronger/weaker effect
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    console.log(data)
    const sortedTours = data?.data.tours.sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    return (
        <div className="overflow-hidden main-slider pattern-2">
            <Slider className="banner-slider" {...settings}>
                {sortedTours?.map((tour: any) => {
                    const descriptionHtml = tour.description ? jsonToHtml(JSON.parse(tour.description)) : "No description available.";

                    return (<div key={tour._id} className="w-full">
                        <div
                            className="banner-content parallax-container h-screen relative bg-fixed bg-center bg-cover bg-no-repeat"
                            style={{
                                backgroundImage: `url(${tour.coverImage})`,
                                height: 'calc(100vh - 104px)',
                                backgroundAttachment: 'fixed',
                            }}
                        >
                            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative flex items-center h-full">
                                <div className="overlay relative z-10 p-5 text-white w-1/2">
                                    <h2 className="text-3xl capitalize [text-shadow:_3px_3px_3px_rgb(0_0_0_/_100%)]">{tour.title}</h2>

                                    <p
                                        className="text-lg capitalize mt-4 mb-4 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_100%)] tracking-wide"
                                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                    />

                                    <div className="mt-5 relative z-10">
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
                    );
                })}
            </Slider>
        </div>
    )
}

export default HomeSlider