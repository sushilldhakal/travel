import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectContentClick, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import './MenuBarSearch.css';

const MenuBarSearch = ({ handleSearch, headerSearch }: { handleSearch: () => void, headerSearch: boolean }) => {

    const searchRef = useRef<HTMLDivElement | null>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const selectRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeSearch = (e: MouseEvent) => {
        e.preventDefault();
        console.log("cross clicked")
        handleSearch();
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Detect click outside search box
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Check if the click is outside the search box and Radix popper content
            if (
                searchRef.current &&
                !searchRef.current.contains(target) &&
                !document.querySelector('[data-radix-popper-content-wrapper]')?.contains(target)
            ) {
                handleSearch(); // Close search when clicking outside
            }
        };

        if (headerSearch) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [headerSearch, handleSearch]);




    return (
        <>
            <div ref={searchRef} id="search" className={`cd-main-search fixed h-[76px] left-0 right-0  h-full w-full bg-secondary transition-all duration-500 ease-in-out ${headerSearch ? 'visibilty-visible opacity-100 h-full z-10 top-0' : 'visibilty-hidden opacity-0 h-0 z-0 top-[-400px]'} `}>
                <form className="bg-dark h-full mx-auto max-w-7xl relative">
                    <Input className="pr-60 text-primary h-full text-xl bg-transparent leading-10 focus-visible:ring--offset-0 focus-visible:ring-0 focus-visible:outline-none box-shadow-none" type="search" placeholder="Search..." />
                    <div ref={selectRef} className="cd-select flex absolute right-10 top-[50%] bottom-auto translate-y-[-50%]">
                        <span className="mt-2 mr-3">in</span>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Categoires" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">Banana</SelectItem>
                                    <SelectItem value="blueberry">Blueberry</SelectItem>
                                    <SelectItem value="grapes">Grapes</SelectItem>
                                    <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <button
                            className="cd-search-trigger cd-text-replace ml-3"
                            onClick={(e) => closeSearch}
                        >
                            <X />
                        </button>
                    </div>
                </form>

                <div className={`cd-search-suggestions grid grid-flow-col  transition-all duration-500 ease-in-out grid-cols-12 px-5 py-2 relative mx-auto max-w-7xl bg-secondary`}>
                    <div className={`news col-span-10 `}>
                        <h3 className="mb-5 letter-spacing">Tours</h3>
                        <ul>
                            <li className="flex relative flex-col pl-[60px] mb-5 items-start">
                                <a className="image-wrapper pr-5 absolute left-0 top-0" href="#0">
                                    <img className="w-12 h-15" src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png" alt="News image" />
                                </a>
                                <h4>
                                    <a className="cd-nowrap" href="#0">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    </a>
                                </h4>

                                <time dateTime="2016-01-12" className="text-xs mt-1">Feb 03, 2016</time>
                            </li>
                            <li className="flex relative flex-col pl-[60px] mb-5 items-start">
                                <a className="image-wrapper pr-5 absolute left-0 top-0" href="#0">
                                    <img className="w-12 h-15" src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png" alt="News image" />
                                </a>
                                <h4>
                                    <a className="cd-nowrap" href="#0">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    </a>
                                </h4>

                                <time dateTime="2016-01-12" className="text-xs mt-1">Feb 03, 2016</time>
                            </li>
                            <li className="flex relative flex-col pl-[60px] mb-5 items-start">
                                <a className="image-wrapper pr-5 absolute left-0 top-0" href="#0">
                                    <img className="w-12 h-15" src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png" alt="News image" />
                                </a>
                                <h4>
                                    <a className="cd-nowrap" href="#0">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    </a>
                                </h4>

                                <time dateTime="2016-01-12" className="text-xs mt-1">Feb 03, 2016</time>
                            </li>
                        </ul>
                    </div>

                    <div className="quick-links col-span-2 col-end-13 text-right">
                        <h3 className="mb-3">Quick Links</h3>
                        <ul>
                            <li className="mb-2"><a href="#0">Find a Destination</a></li>
                            <li className="mb-2"><a href="#0">FAQ's</a></li>
                            <li className="mb-2"><a href="#0">Support</a></li>
                            <li className="mb-2"><a href="#0">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </>
    )
}

export default MenuBarSearch;

