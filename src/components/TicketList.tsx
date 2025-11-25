import { sql } from '@vercel/postgres';
import TicketItem from './TicketItem';

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

export default async function TicketList({ query }: TicketListProps) {
  const tickets = await getTickets(query);

  return (
    <div>
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {query ? `No tickets found for "${query}"` : 'No tickets found'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
