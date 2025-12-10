'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LogoutButton from './LogoutButton';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status !== 'loading') {
            setIsLoading(false);
        }
    }, [status]);

    // Close mobile menu when clicking outside (optional)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobileMenuOpen && !(event.target as Element).closest('.navbar-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Show loading skeleton while session is loading
    if (isLoading) {
        return (
            <nav className='sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-4'>
                <div className='max-w-7xl mx-auto flex justify-between items-center'>
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className='flex items-center space-x-4'>
                        <div className="hidden md:flex space-x-4">
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="md:hidden">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 navbar-container'>
                <div className='flex justify-between items-center h-16'>
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link href='/' className='text-xl font-bold text-blue-600 hover:text-blue-700 transition'>
                            Informatics | Ticket System
                        </Link>
                    </div>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {session ? (
                            <>
                                <Link
                                    href='/tickets/new'
                                    className='text-gray-700 hover:text-blue-600 hover:transition px-3 py-2 rounded-md text-sm font-medium'
                                >
                                    New Ticket
                                </Link>
                                <Link
                                    href='/tickets'
                                    className='text-gray-700 hover:text-blue-600 hover:transition px-3 py-2 rounded-md text-sm font-medium'
                                >
                                    My Tickets
                                </Link>

                                {/* Admin Dashboard Link */}
                                {(session.user as any)?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="text-amber-600 hover:text-blue-600 hover:transition px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                {/* User dropdown for desktop */}
                                <div className="relative group ml-2">
                                    <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                        <span className="truncate max-w-[120px]">
                                            {session.user?.name || 'User'}
                                        </span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="px-4 py-2 text-xs text-gray">
                                            Signed in as<br />
                                            <span className="font-medium">{session.user?.email}</span>
                                        </div>
                                        <div className="px-4 py-2 text-sm !no-underline">
                                            <LogoutButton />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/login'
                                    className='text-blue-600 hover:text-blue-800 transition px-3 py-2 rounded-md text-sm font-medium'
                                >
                                    Login
                                </Link>
                                <Link
                                    href='/register'
                                    className='bg-blue-600 text-white hover:bg-blue-700 transition px-4 py-2 rounded-md text-sm font-medium shadow-sm'
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu - Show/hide based on menu state */}
                <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 mt-2">
                        {session ? (
                            <>
                                {/* User info in mobile menu */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">Signed in as</p>
                                    <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                                </div>

                                <Link
                                    href='/tickets/new'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition rounded-md'
                                >
                                    New Ticket
                                </Link>
                                <Link
                                    href='/tickets'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition rounded-md'
                                >
                                    My Tickets
                                </Link>

                                {/* Admin Dashboard Link - Mobile */}
                                {(session.user as any)?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition rounded-md"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                <div className="px-4 py-3 border-t border-gray-100">
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/login'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='block px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-gray-50 transition rounded-md font-medium'
                                >
                                    Login
                                </Link>
                                <Link
                                    href='/register'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition rounded-md font-medium mx-4 text-center'
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
