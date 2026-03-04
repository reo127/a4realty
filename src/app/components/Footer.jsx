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
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-100 pb-8">
                            <div className="text-sm text-gray-600 md:col-span-1">
                                <h3 className="font-semibold text-gray-900 mb-3 block">Corporate Office</h3>
                                <p className="leading-relaxed">
                                    No.184, A4 Realty, Hennur Cross, 3rd Cross,<br />
                                    Narayanappa Road, Kalyan Nagar Post,<br />
                                    Bengaluru, 560043
                                </p>
                            </div>
                            <div className="text-sm text-gray-600 md:col-span-2">
                                <h3 className="font-semibold text-gray-900 mb-3 block">Reach Out To Us</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <a href="tel:+919002981353" className="group flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200 text-left">
                                        <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Asif Ekbal <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1 font-semibold">CEO</span></span>
                                        <span className="mt-1 text-gray-500">+91 9002981353</span>
                                    </a>
                                    <a href="tel:+971547865691" className="group flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200 text-left">
                                        <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Moti Lal Mahato <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1 font-semibold">Co-founder</span></span>
                                        <span className="mt-1 text-gray-500">+971 547865691</span>
                                    </a>
                                    <a href="tel:+916289038527" className="group flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200 text-left">
                                        <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Rohan Malo <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1 font-semibold">Co-founder</span></span>
                                        <span className="mt-1 text-gray-500">+91 6289038527</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 text-sm text-gray-600">
                            <div className="text-gray-500">© {new Date().getFullYear()} A4Realty Pvt Ltd. All rights reserved.</div>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">GST:</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">29AAYPE6461F1Z8</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">RERA:</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">PRM/KA/RERA/1251/309/AG/250915/006180</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer