'use client';

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';

const Navber = () => {
    const pathname = usePathname();
    
    // Hide navbar on login and register pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }
    
    return (
        <header className="sticky top-0 z-40 bg-white text-black backdrop-blur border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-600 rounded-md" />
                        <span className="text-lg font-semibold tracking-tight">
                            A4Realty
                        </span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link href="/search?tab=buy" className="hover:text-indigo-600">Buy</Link>
                    <Link href="/search?tab=rent" className="hover:text-indigo-600">Rent</Link>
                    <Link href="/search?tab=new" className="hover:text-indigo-600">New Projects</Link>
                    <Link href="/agents" className="hover:text-indigo-600">Agents</Link>
                    <Link href="/about" className="hover:text-indigo-600">About</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link
                        href="/list-property"
                        className="hidden sm:inline-flex px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 text-sm"
                    >
                        List Property
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Navber