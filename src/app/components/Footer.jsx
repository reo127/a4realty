import React from 'react'
import Link from "next/link";
import Image from "next/image";
import Logo from '../../../public/finalLogo.jpeg'

const Footer = () => {
    return (
        <>
            <footer className="border-t bg-white border-gray-100 text-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                {/* <div className="h-7 w-7 bg-indigo-600 rounded-md" /> */}
                                <Image src={Logo} alt="logo" className="h-[3.5rem] w-[9rem] rounded-sm" />
                                {/* <span className="font-semibold">RealtyHub</span> */}
                            </div>
                            <p className="mt-3 text-gray-600">
                                New projects, verified listings, and trusted agents across India.
                            </p>
                        </div> 
                        <div>
                            <div className="font-semibold mb-2">Company</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/about" className="hover:text-indigo-600">About</Link></li>
                                <li><Link href="/careers" className="hover:text-indigo-600">Careers</Link></li>
                                <li><Link href="/contact" className="hover:text-indigo-600">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Explore</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/search?tab=new" className="hover:text-indigo-600">New Projects</Link></li>
                                <li><Link href="/search?tab=buy" className="hover:text-indigo-600">Buy</Link></li>
                                <li><Link href="/search?tab=rent" className="hover:text-indigo-600">Rent</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Legal</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/terms" className="hover:text-indigo-600">Terms & Conditions</Link></li>
                                <li><Link href="/privacy" className="hover:text-indigo-600">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 text-gray-500">© {new Date().getFullYear()} A4Realty Pvt Ltd</div>
                </div>
            </footer>
        </>
    )
}

export default Footer