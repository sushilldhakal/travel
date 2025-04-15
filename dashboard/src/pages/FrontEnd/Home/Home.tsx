import RecentBlog from '@/userDefinedComponents/User/Blog/RecentBlog';
import Search from '@/userDefinedComponents/User/Search/Search';
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider';
import LatestTour from '@/userDefinedComponents/User/Slider/LatestTour';
import TourByPricing from '@/userDefinedComponents/User/Slider/TourByPricing';
import WhyUs from '@/userDefinedComponents/User/WhyUs/WhyUs';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Home = () => {
    return (
        <>
            {/* Hero Section with Slider and Search */}
            <div className="relative">
                {/* Slider Component */}
                <HomeSlider />

                {/* Search Box Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="container mx-auto max-w-7xl px-4 h-full relative">
                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[400px] z-10 hidden md:block pointer-events-auto">
                            <div className="bg-secondary/70 rounded-lg p-5">
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
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold">Featured Tours</h2>
                        <Link to="/tours" className="flex items-center text-red-600 hover:text-red-700">
                            View All Tours <ChevronRight size={16} />
                        </Link>
                    </div>
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

            {/* Recent Blog Posts */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold">Latest Travel Stories</h2>
                        <Link to="/blogs" className="flex items-center text-red-600 hover:text-red-700">
                            View All Stories <ChevronRight size={16} />
                        </Link>
                    </div>
                    <RecentBlog />
                </div>
            </div>
        </>
    );
};

export default Home;