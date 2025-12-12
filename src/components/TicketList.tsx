'use client';

import { sql } from '@vercel/postgres';
import TicketItem from './TicketItem';
import { useState, useEffect } from 'react';

interface Ticket {
    id: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
}

async function getTickets(query = '') {
    try {
        let tickets;

        if (query) {
            // Search in ticket name and description
            tickets = await sql`
        SELECT * FROM "Ticket" 
        WHERE subject ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`}
        ORDER BY "createdAt" DESC
      `;
        } else {
            // Get all tickets if no search query
            tickets = await sql`
        SELECT * FROM "Ticket" 
        ORDER BY "createdAt" DESC
      `;
        }

        return tickets.rows as Ticket[];
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
    }
}

interface TicketListProps {
    query: string;
}
export default function TicketList() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('/api/tickets');
                const data = await response.json();
                setTickets(data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [refreshKey]);

    const handleTicketUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) {
        return <div className="text-center py-8">Loading tickets...</div>;
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={handleTicketUpdate}
                />
            ))}
        </div>
    );
}
