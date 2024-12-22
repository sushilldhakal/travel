import RecentBlog from '@/userDefinedComponents/User/Blog/RecentBlog';
import Search from '@/userDefinedComponents/User/Search/Search'
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider'
import LatestTour from '@/userDefinedComponents/User/Slider/LatestTour';
import TourByPricing from '@/userDefinedComponents/User/Slider/TourByPricing';
import WhyUs from '@/userDefinedComponents/User/WhyUs/WhyUs';
const Home = () => {
    return (
        <>
            <div className="relative w-full">
                {/* HomeSlider with full-width background */}
                <HomeSlider />

                {/* Centering Search bar within 1280px */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative max-w-[1280px] w-full flex justify-end pr-6 pointer-events-auto">
                        {/* Search bar aligned to the right within 1280px boundary */}
                        <div className="w-[420px]">
                            <Search />
                        </div>
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-10 gap-4 px-5  max-w-[1280px] mx-auto' >
                <div className="col-span-7"> <LatestTour /></div>

                <div className="col-span-3">

                    <TourByPricing />
                </div>
            </div>
            <WhyUs />
            <RecentBlog />

        </>
    )
}

export default Home;