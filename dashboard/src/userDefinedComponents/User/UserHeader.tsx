import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faYoutube, faInstagram, faTwitter, faLinkedin, faAirbnb } from '@fortawesome/free-brands-svg-icons'
import { faClock, faPhone } from '@fortawesome/free-solid-svg-icons'
import { UserMenuItems } from "@/lib/MenuItems";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from "react-router-dom";

const UserHeader = () => {
    return (
        <Disclosure as="nav" className="h-10 bg-foreground">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button*/}
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
                        </DisclosureButton>

                    </div>
                    <div className="flex hidden sm:block flex-shrink-0 items-center text-secondary text-sm">

                        <span className='flex-initial w-64 pr-3'>
                            <FontAwesomeIcon icon={faPhone} className='pr-2 text-xs' />
                            +61 0433 926 079
                        </span>

                        <span className='flex-initial w-64'>
                            <FontAwesomeIcon icon={faClock} className='pr-2 text-xs' />
                            Mon – Fri 8.00 – 18.00. Weekend CLOSED
                        </span>
                    </div>
                    <div className="flex hidden sm:block flex-shrink-0 items-center sm:hidden">
                        Welcome To eTravel

                    </div>

                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-end">

                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">

                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md " to={""}>
                            <FontAwesomeIcon icon={faFacebookF} />
                        </Link>
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <FontAwesomeIcon icon={faInstagram} />
                        </Link>
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <FontAwesomeIcon icon={faYoutube} />
                        </Link>
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <FontAwesomeIcon icon={faTwitter} />
                        </Link>
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <FontAwesomeIcon icon={faLinkedin} />
                        </Link>
                        <Link
                            className="mr-2 pt-1 pb-1 pl-2 pr-2 mt-1 text-primary bg-secondary-foreground rounded-md" to={""}>
                            <FontAwesomeIcon icon={faAirbnb} />
                        </Link>

                    </div>
                </div>
            </div>

            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2">
                    {UserMenuItems.items.map((item) => (
                        <DisclosureButton
                            key={item.id}
                            as="a"
                            href={item.url}
                            className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                            {item.title}
                        </DisclosureButton>
                    ))}
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}
export default UserHeader



