'use client';

import React, { useEffect, useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import Logo from '../../../public/finalLogo.jpeg'


const Navber = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    // Hide navbar on login, register, and admin pages
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 bg-white text-black backdrop-blur border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        {/* <div className="h-8 w-8 bg-indigo-600 rounded-md" /> */}
                        <Image src={Logo} alt="logo" className="h-[3.5rem] w-[9rem] rounded-sm" />
                        {/* <span className="text-lg font-semibold tracking-tight">
                            A4Realty
                        </span> */}
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
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <div>
                                    <Link
                                        href="/list-property"
                                        className="hidden sm:inline-flex px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 text-sm"
                                    >
                                        List Property
                                    </Link>
                                    <Link
                                        href="/admin/properties"
                                        className="hidden ml-3 sm:inline-flex px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 text-sm"
                                    >
                                        Manage Properties
                                    </Link>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                            >
                                Sign in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navber