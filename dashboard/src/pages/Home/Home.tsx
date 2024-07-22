import Search from '@/userDefinedComponents/User/Search/Search'
import HomeSlider from '@/userDefinedComponents/User/Slider/HomeSlider'

const Home = () => {
    return (
        <div className="relative">
            <HomeSlider />
            <div className="absolute top-20 right-0 w-full">
                <div className="container mx-auto flex justify-end h-full ">
                    <Search />
                </div>
            </div>
        </div>
    )
}

export default Home