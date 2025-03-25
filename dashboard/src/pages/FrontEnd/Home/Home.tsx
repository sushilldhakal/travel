import RecentBlog from '@/userDefinedComponents/User/Blog/RecentBlog';
import Search from '@/userDefinedComponents/User/Search/Search';
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider';
import LatestTour from '@/userDefinedComponents/User/Slider/LatestTour';
import TourByPricing from '@/userDefinedComponents/User/Slider/TourByPricing';
import WhyUs from '@/userDefinedComponents/User/WhyUs/WhyUs';

const Home = () => {
    return (
        <>
            {/* Banner with search on desktop */}
            <div className="relative w-full">
                <HomeSlider />
                
                {/* Desktop search - positioned inside banner on right */}
                <div className="hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2 z-10 px-4 max-w-[1280px] w-full mx-auto pointer-events-none">
                    <div className="flex justify-end pointer-events-none">
                        <div className="w-[420px] pointer-events-auto">
                            <Search />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile search - positioned below banner */}
            <div className="md:hidden w-full bg-gray-100 py-4 px-4">
                <div className="max-w-[1280px] mx-auto">
                    <Search />
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 px-4 md:px-5 max-w-[1280px] mx-auto w-full'>
                <div className="md:col-span-1 lg:col-span-7">
                    <LatestTour />
                </div>

                <div className="md:col-span-1 lg:col-span-3 mt-8 lg:mt-0">
                    <TourByPricing />
                </div>
            </div>

            <WhyUs />
            <RecentBlog />
        </>
    );
};

export default Home;