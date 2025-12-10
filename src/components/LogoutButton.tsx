'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

const LogoutButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Clear NextAuth session
            await signOut({
                redirect: false
            });

            window.location.href = `${window.location.origin}/`;

        } catch (error) {
            console.error('Logout error:', error);
            // Fallback to current origin
            window.location.href = `${window.location.origin}/`;
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`text-red-600 hover:text-red-800 hover:underline transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isLoading ? 'Logging out...' : 'Logout'}
        </button>
    );
};

export default LogoutButton;
