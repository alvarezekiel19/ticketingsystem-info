'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function SearchTickets({ initialQuery = '' }) {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (term: string) => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (term) {
                params.set('query', term);
            } else {
                params.delete('query');
            }
            router.replace(`/tickets?${params.toString()}`);
        }, 300);
    };

    return (
        <input
            type="text"
            placeholder="Search tickets by name or description..."
            defaultValue={initialQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    );
}
