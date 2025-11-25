import { sql } from '@vercel/postgres';
import TicketItem from './TicketItem';

async function getTickets(query = '') {
  try {
    let tickets;
    
    if (query) {
      tickets = await sql`
        SELECT * FROM tickets 
        WHERE name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`}
        ORDER BY created_at DESC
      `;
    } else {
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

export default async function TicketList({ query }) {
  const tickets = await getTickets(query);

  return (
    <div>
      {tickets.length === 0 ? (
        <p className="text-center text-gray-600">
          {query ? `No tickets found for "${query}"` : 'No Tickets Yet'}
        </p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
