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
        <header className="sticky top-0 z-40 bg-[#D7242A] text-white shadow-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main navbar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <div className="flex items-center">
                            <Image 
                                src={Logo} 
                                alt="A4Realty Logo" 
                                className="h-[2.5rem] w-[7rem] rounded-sm" 
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link 
                            href="/search?tab=buy" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            Buy
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link 
                            href="/search?tab=rent" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            Rent
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link 
                            href="/search?tab=new" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            New Projects
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link 
                            href="/agents" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            Agents
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link 
                            href="/about" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            About
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link 
                            href="/blog" 
                            className="text-white hover:text-white/80 font-medium text-sm transition-colors duration-200 relative group"
                        >
                            Blog
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <div className="hidden md:flex items-center space-x-2">
                                        <Link
                                            href="/list-property"
                                            className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                        >
                                            List Property
                                        </Link>
                                        <Link
                                            href="/admin/properties"
                                            className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                        >
                                            Manage Properties
                                        </Link>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <div className="hidden sm:flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-white/90 text-sm font-medium hidden lg:inline">
                                            {user.email.split('@')[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-sm"
                            >
                                Sign In
                            </Link>
                        )}
                        
                        {/* Mobile menu button */}
                        <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navber