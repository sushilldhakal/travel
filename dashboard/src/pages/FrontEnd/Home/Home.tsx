import RecentBlog from '@/userDefinedComponents/User/Blog/RecentBlog';
import Search from '@/userDefinedComponents/User/Search/Search';
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider';
import LatestTour from '@/userDefinedComponents/User/Slider/LatestTour';
import TourByPricing from '@/userDefinedComponents/User/Slider/TourByPricing';
import DestinationTour from '@/userDefinedComponents/User/Slider/DestinationTour';
import ReviewSlider from '@/userDefinedComponents/User/Slider/ReviewSlider';
import WhyUs from '@/userDefinedComponents/User/WhyUs/WhyUs';

import { useEffect, useState } from 'react';

const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Set isLoaded to true after component mounts to ensure proper rendering
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            {/* Hero Section with Slider and Search */}
            <div className="relative">
                {/* Slider Component */}
                <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <HomeSlider />
                </div>

                {/* Search Box Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="container mx-auto max-w-8xl px-4 h-full relative">
                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[400px] z-10 hidden md:block pointer-events-auto">
                            <div className="bg-secondary/70 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-secondary/20">
                                <h2 className="text-primary text-xl font-bold mb-4 uppercase">SEARCH TOURS</h2>
                                <Search />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search (shown below slider on mobile) */}
                <div className="md:hidden py-6 px-4 bg-gray-900">
                    <div className="container mx-auto">
                        <h2 className="text-primary text-xl font-bold mb-4 uppercase">SEARCH TOURS</h2>
                        <Search />
                    </div>
                </div>
            </div>

            {/* Featured Tours Section */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-2">
                            <LatestTour />
                        </div>
                        <div className="col-span-1">
                            <TourByPricing />
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <WhyUs />

            {/* Popular Destinations Section */}
            <DestinationTour />

            {/* Customer Reviews Section */}
            <ReviewSlider />

            {/* Recent Blog Posts */}
            <div className="py-16">
                <div className="container mx-auto px-4">

                    <RecentBlog />
                </div>
            </div>
        </>
    );
};

export default Home;