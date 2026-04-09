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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isSearchActive = pathname === '/search';
    const navLinkClass = (active) =>
        `text-white font-medium text-sm transition-colors duration-200 relative group ${active ? 'opacity-100' : 'hover:text-white/80'}`;
    const navUnderlineClass = (active) =>
        `absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-200 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`;
    const mobileLinkClass = (active) =>
        `flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 group ${active ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'}`;

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
                        {[
                            { href: '/search?tab=buy', label: 'Buy' },
                            { href: '/search?tab=rent', label: 'Rent' },
                            { href: '/search?tab=new', label: 'New Projects' },
                            { href: '/agents', label: 'Agents' },
                            { href: '/about', label: 'About' },
                            { href: '/blog', label: 'Blog' },
                            { href: '/calculators', label: 'Calculators' },
                        ].map(({ href, label }) => {
                            const active = href.startsWith('/search') ? isSearchActive : pathname === href;
                            return (
                                <Link key={href} href={href} className={navLinkClass(active)}>
                                    {label}
                                    <span className={navUnderlineClass(active)}></span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                        <span className="sr-only">Open main menu</span>
                        {!isMobileMenuOpen ? (
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        ) : (
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>

                    {/* Right side actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-2">
                                    <Link
                                        href="/list-property"
                                        className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                    >
                                        List Properties
                                    </Link>
                                    {user.role !== 'admin' && user.role !== 'agent' && (
                                        <Link
                                            href="/builder"
                                            className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                        >
                                            My Properties
                                        </Link>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin/properties"
                                            className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                        >
                                            Manage Properties
                                        </Link>
                                    )}
                                </div>
                                {user.role === 'agent' && (
                                    <Link
                                        href="/agent/my-leads"
                                        className="px-4 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                                    >
                                        My CRM
                                    </Link>
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
                            <div className='flex items-center space-x-2'>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-sm"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    href="/register"
                                    className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {/* <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg> */}
                                    List Your free properties
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile menu overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-all duration-300 ease-in-out"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile menu */}
                <div className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-[#D7242A] transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } shadow-2xl`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center">
                                <Image
                                    src={Logo}
                                    alt="A4Realty Logo"
                                    className="h-10 w-20 rounded-sm"
                                />
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-md text-white hover:bg-white/10 transition-colors duration-200"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                            {/* Search All — prominent entry */}
                            <Link
                                href="/search"
                                className={mobileLinkClass(isSearchActive)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search All Properties
                            </Link>

                            <div className="pt-2 pb-1">
                                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Browse by type</p>
                            </div>

                            <Link
                                href="/search?tab=buy"
                                className={mobileLinkClass(false)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Buy
                            </Link>
                            <Link
                                href="/search?tab=sell"
                                className={mobileLinkClass(false)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Sell
                            </Link>
                            <Link
                                href="/search?tab=rent"
                                className={mobileLinkClass(false)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Rent
                            </Link>
                            <Link
                                href="/search?tab=new"
                                className={mobileLinkClass(false)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                New Projects
                            </Link>

                            <div className="pt-2 pb-1">
                                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/40">More</p>
                            </div>

                            <Link
                                href="/agents"
                                className={mobileLinkClass(pathname === '/agents')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Agents
                            </Link>
                            <Link
                                href="/about"
                                className={mobileLinkClass(pathname === '/about')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                About
                            </Link>
                            <Link
                                href="/blog"
                                className={mobileLinkClass(pathname === '/blog')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Blog
                            </Link>
                            <Link
                                href="/calculators"
                                className={mobileLinkClass(pathname === '/calculators')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Calculators
                            </Link>
                        </div>

                        {/* Mobile user actions */}
                        <div className="px-4 py-4 border-t border-white/10 bg-white/5">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center px-4 py-3 bg-white/10 rounded-lg">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                            <span className="text-white text-lg font-bold">
                                                {user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">
                                                {user.email.split('@')[0]}
                                            </div>
                                            <div className="text-white/60 text-sm">
                                                {user.role === 'admin' ? 'Administrator' : 'User'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Link
                                            href="/list-property"
                                            className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            List Properties
                                        </Link>
                                        {user.role !== 'admin' && user.role !== 'agent' && (
                                            <Link
                                                href="/builder"
                                                className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                My Properties
                                            </Link>
                                        )}
                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin/properties"
                                                className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Manage Properties
                                            </Link>
                                        )}
                                    </div>
                                    {user.role === 'agent' && (
                                        <Link
                                            href="/agent/my-leads"
                                            className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            My CRM
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-center w-full px-4 py-3 text-lg font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center px-4 py-3 text-lg font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center px-4 py-3 text-lg font-medium bg-white text-[#D7242A] rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        List Your free properties
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navber