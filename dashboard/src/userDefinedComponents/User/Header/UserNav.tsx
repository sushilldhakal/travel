import { UserMenuItems } from "@/lib/MenuItems";
// import MenuItem from "../MenuItem";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ModeToggle } from "../../ModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { isValidToken } from "@/util/authUtils";
import { useEffect, useState, useRef } from "react";
import useTokenStore from "@/store/store";
import { jwtDecode } from "jwt-decode";
import { Bell, Search, Menu as Bars3Icon, X, User, Loader2 } from "lucide-react";
import { getUserAvatar } from "@/http";

const UserNav = ({ handleSearch }: { handleSearch: () => void }) => {
    const { setToken } = useTokenStore((state) => state);
    const navigate = useNavigate();
    const [valid, setValid] = useState(false);
    const [dashRight, setDashRight] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const headerHeight = useRef<number>(0);

    useEffect(() => {
        const accessToken = localStorage.getItem("token-store");

        // Get initial header height for proper spacing when fixed
        if (headerRef.current) {
            headerHeight.current = headerRef.current.offsetHeight;
        }

        window.addEventListener('scroll', isSticky);

        if (accessToken && isValidToken(accessToken)) {
            setValid(true);
            const decoded = jwtDecode(accessToken) as { roles?: string; sub?: string };

            if (decoded.roles === 'admin' || decoded.roles === 'seller') {
                setDashRight(true);
            }
            if (decoded.sub) {
                fetchUserAvatar(decoded.sub);
            }
        } else {
            setValid(false);
        }

        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    const fetchUserAvatar = async (uid: string) => {
        if (!uid) return;

        try {
            setIsLoadingAvatar(true);
            const response = await getUserAvatar(uid);
            if (response && response.avatar) {
                setAvatarUrl(response.avatar);
            }
        } catch (error) {
            console.error("Error fetching user avatar:", error);
        } finally {
            setIsLoadingAvatar(false);
        }
    };

    const isSticky = () => {
        const scrollTop = window.scrollY;
        // Using state instead of direct DOM manipulation for better React integration
        if (scrollTop >= 40) {
            setIsHeaderFixed(true);
        } else {
            setIsHeaderFixed(false);
        }
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem("token-store");
        setValid(false);
        navigate('/');
    };

    return (
        <>
            {/* Placeholder div that takes up space when header is fixed - using original height */}
            {isHeaderFixed && (
                <div style={{ height: `76px` }} className="w-full"></div>
            )}
            <Disclosure
                ref={headerRef}
                id="main-header"
                as="nav"
                className={`${isHeaderFixed ? 'fixed top-0 h-[60px]' : 'relative h-[76px]'} z-50 bg-secondary w-full text-secondary-foreground main-header border-t-2 border-primary px-5 transition-all duration-200`}
            >
                <div className="mx-auto max-w-8xl h-full">
                    <div className={`relative flex items-center justify-between h-full`}>
                        <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                            {/* Mobile menu button*/}
                            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                                <X aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
                            </DisclosureButton>
                        </div>
                        <div className="flex hidden md:block flex-shrink-0 items-center text-primary">
                            <Link to={'/'} className="text-3xl font-bold">eTravel</Link>
                        </div>
                        <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-end">

                            <div className="hidden md:ml-6 md:block">
                                <div className="flex space-x-4 text-secondary-foreground ">
                                    {UserMenuItems.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={item.url}
                                            className={`hover:bg-gray-700 hover:text-white rounded-md px-3 ${isHeaderFixed ? 'py-1' : 'py-2'} text-sm font-medium transition-all duration-200`}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                            <ModeToggle />

                            {
                                valid
                                    ?
                                    <>
                                        <button
                                            type="button"
                                            className="ml-3 relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                        >
                                            <span className="absolute -inset-1.5" />
                                            <span className="sr-only">View notifications</span>
                                            <Bell className="h-6 w-6" />
                                        </button>
                                        <Menu as="div" className="relative ml-3">
                                            <div>
                                                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                    <span className="absolute -inset-1.5" />
                                                    <span className="sr-only">Open user menu</span>
                                                    {isLoadingAvatar ? (
                                                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                            <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
                                                        </div>
                                                    ) : avatarUrl ? (
                                                        <img
                                                            alt="User avatar"
                                                            src={avatarUrl}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </MenuButton>
                                            </div>

                                            <MenuItems
                                                transition
                                                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-secondary py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none 
                                                data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                            >{dashRight
                                                ?
                                                <MenuItem>
                                                    <Link to={'/dashboard/home'} className="block px-4 py-2 text-sm data-[focus]:text-primary/60">
                                                        Dashboard
                                                    </Link>
                                                </MenuItem> : ''
                                                }
                                                <MenuItem>
                                                    <a href="#" className="block px-4 py-2 text-sm data-[focus]:text-primary/60">
                                                        Your Profile
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <Link to="/dashboard/settings" className="block px-4 py-2 text-sm data-[focus]:text-primary/60">
                                                        Settings
                                                    </Link>
                                                </MenuItem>
                                                <MenuItem>
                                                    <Link to="/" onClick={handleLogout} className="block px-4 py-2 text-sm data-[focus]:text-primary/60">
                                                        Sign out
                                                    </Link>
                                                </MenuItem>
                                            </MenuItems>
                                        </Menu>
                                    </>
                                    :
                                    <Link to={'/auth/login'} className="text-white ml-3">Login</Link>
                            }

                            <div className="ml-3 cursor-pointer" onClick={handleSearch}>
                                <Search />
                            </div>

                        </div>
                    </div>
                </div>

                <DisclosurePanel className="md:hidden">
                    <div className="space-y-1 px-2 pb-3 pt-2">
                        {UserMenuItems.items.map((item) => (
                            <DisclosureButton
                                key={item.id}
                                as="a"
                                href={item.url}
                                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                            >
                                {item.title}
                            </DisclosureButton>
                        ))}
                    </div>
                </DisclosurePanel>
            </Disclosure>
        </>
    )
}
export default UserNav
