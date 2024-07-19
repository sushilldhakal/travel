import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const HomeSlider = () => {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    return (
        <div className="overflow-hidden main-slider">
            <Slider {...settings}>
                <div className="w-full">
                    <img className="w-full" src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/aside-03.jpg" alt="" />
                </div>
                <div className="w-full">
                    <img className="w-full" src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/aside-02.jpeg" alt="" />
                </div>
                <div className="w-full">

                    <img className="w-full" src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/beach1.jpg" alt="" />
                </div>
            </Slider>
        </div>

    )
}

export default HomeSlider