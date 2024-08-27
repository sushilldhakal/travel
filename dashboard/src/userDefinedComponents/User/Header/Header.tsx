import { useState } from "react";
import UserHeader from "./UserHeader"
import UserNav from "./UserNav"
import MenuBarSearch from "../Search/MenuBarSearch";

const Header = () => {

    const [headerSearch, setHeaderSearch] = useState(false);


    const handleSearch = () => {
        setHeaderSearch(!headerSearch);
        console.log('search clicked');
    }
    return (
        <div className="relative">
            <UserHeader />
            <UserNav handleSearch={handleSearch} />
            <MenuBarSearch headerSearch={headerSearch} handleSearch={handleSearch} />
        </div>
    )
}

export default Header