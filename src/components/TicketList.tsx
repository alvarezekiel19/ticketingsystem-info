import { sql } from '@vercel/postgres';
import TicketItem from './TicketItem';

async function getTickets(query = '') {
  try {
    let tickets;
    
    if (query) {
      // Search in ticket name and description
      tickets = await sql`
        SELECT * FROM tickets 
        WHERE name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`}
        ORDER BY created_at DESC
      `;
    } else {
      // Get all tickets if no search query
      tickets = await sql`
        SELECT * FROM tickets 
        ORDER BY created_at DESC
      `;
    }

    return tickets.rows;
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
