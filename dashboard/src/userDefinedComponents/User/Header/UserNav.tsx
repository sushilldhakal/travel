import { UserMenuItems } from "@/lib/MenuItems";
// import MenuItem from "../MenuItem";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ModeToggle } from "../../ModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { isValidToken } from "@/util/AuthLayout";
import { useEffect, useState } from "react";
import useTokenStore from "@/store/store";
import { jwtDecode } from "jwt-decode";
import { Bell, Search, Menu as Bars3Icon, X } from "lucide-react";

const UserNav = ({ handleSearch }: { handleSearch: () => void }) => {
    const { setToken } = useTokenStore((state) => state);
    const navigate = useNavigate();
    const [valid, setValid] = useState(false);
    const [dashRight, setDashRight] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem("token-store");
        window.addEventListener('scroll', isSticky);

        if (accessToken && isValidToken(accessToken)) {
            setValid(true);
            const decoded = jwtDecode(accessToken) as { roles?: string };

            if (decoded.roles === 'admin' || decoded.roles === 'seller') {
                setDashRight(true);
            }
        } else {
            setValid(false);
        }

        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    const isSticky = () => {
        const header = document.getElementById('main-header');
        const scrollTop = window.scrollY;
        if (header) {
            if (scrollTop >= 40) {
                header.classList.add('fixed');
                header.classList.remove('relative');
            } else {
                header.classList.remove('fixed');
                header.classList.add('relative');
            }
        }
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem("token-store");
        setValid(false);
        navigate('/');
    };

    return (
        <Disclosure id="main-header" as="nav" className={`relative z-2 bg-secondary w-full text-secondary-foreground main-header z-10 top-0 border-t-2 border-primary px-5`}>
            <div className="mx-auto max-w-7xl">
                <div className="relative flex h-16 items-center justify-between">
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
                                        className="hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
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
                                                <img
                                                    alt=""
                                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                    className="h-8 w-8 rounded-full"
                                                />
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
                                                <a href="#" className="block px-4 py-2 text-sm data-[focus]:text-primary/60">
                                                    Settings
                                                </a>
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
    )
}
export default UserNav



