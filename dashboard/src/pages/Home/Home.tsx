import Search from '@/userDefinedComponents/User/Search/Search'
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider'

const Home = () => {
    return (
        <div className="relative">
            <HomeSlider />
            <div className="absolute inset-y-0 right-20 flex items-center pr-6 w-full max-w-[420px]">
                <div className="mx-auto w-[420px]">
                    <Search />
                </div>
            </div>
        </div>
    )
}

export default Home;