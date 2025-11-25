import { sql } from '@vercel/postgres';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CloseTicketButton from '@/components/CloseTicketButton';

// Add type for params
interface TicketPageProps {
  params: {
    id: string;
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;

  try {
    const result = await sql`SELECT * FROM "Ticket" WHERE id = ${id}`;
    const ticket = result.rows[0];

    if (!ticket) {
      notFound();
    }

    const ticketId = parseInt(ticket.id) || ticket.id;
    const isClosed = ticket.status === 'solved';

    return (
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/tickets" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Tickets
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {ticket.subject}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'solved' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {ticket.status === 'solved' ? '✅ Solved' : '🔧 Open'}
                  </span>

                  {/* Priority Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.priority === 'High' 
                      ? 'bg-red-100 text-red-800'
                      : ticket.priority === 'Medium' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority} priority
                  </span>
                </div>
              </div>

              {/* Close Ticket Button - Using your existing component */}
              <CloseTicketButton 
                ticketId={ticketId} 
                isClosed={isClosed} 
              />
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Created: {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                {new Date(ticket.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading ticket:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return (
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading ticket: {errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }
}

