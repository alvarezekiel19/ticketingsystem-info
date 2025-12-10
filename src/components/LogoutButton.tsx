'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface LogoutButtonProps {
    className?: string;
}

const LogoutButton = ({ className = '' }: LogoutButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOut({
                redirect: false
            });

            window.location.href = `${window.location.origin}/`;

        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = `${window.location.origin}/`;
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`text-red-600 hover:text-red-800 hover:underline transition disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''} ${className}`}
        >
            {isLoading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging out...
                </span>
            ) : (
                'Logout'
            )}
        </button>
    );
};

export default LogoutButton;
