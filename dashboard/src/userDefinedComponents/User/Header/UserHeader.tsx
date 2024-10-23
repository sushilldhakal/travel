import { Disclosure } from '@headlessui/react';
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, PhoneCall, Clock } from 'lucide-react';

const UserHeader = () => {
    return (
        <Disclosure as="nav" className="h-10 bg-secondary z-10 relative px-5">
            <div className="mx-auto max-w-7xl w-full h-full">
                <div className="relative flex items-center justify-between h-full">
                    {/* Left Section - Phone Number & Opening Times */}
                    <div className="hidden md:flex items-center text-secondary-foreground text-xs space-x-8">
                        <span className='flex items-center'>
                            <PhoneCall className='mr-2' size="18px" />
                            +61 0433 926 079
                        </span>
                        <span className='flex items-center'>
                            <Clock className='mr-2' size="18px" />
                            Mon – Fri 8.00 – 18.00. Weekend CLOSED
                        </span>
                    </div>

                    {/* Welcome to Etravel for small screens */}
                    <div className="md:hidden flex justify-center w-full">
                        <span className="text-secondary-foreground text-sm">Welcome to Etravel</span>
                    </div>

                    {/* Right Section - Social Icons */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link className="p-1.5 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <Facebook size="18px" />
                        </Link>
                        <Link className="p-1.5 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <Instagram size="18px" />
                        </Link>
                        <Link className="p-1.5 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <Youtube size="18px" />
                        </Link>
                        <Link className="p-1.5 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <Twitter size="18px" />
                        </Link>
                        <Link className="p-1.5 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <Linkedin size="18px" />
                        </Link>
                    </div>
                </div>
            </div>
        </Disclosure>
    );
};

export default UserHeader;
