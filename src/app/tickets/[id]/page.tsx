import Link from 'next/link';
import { notFound } from 'next/navigation';
import CloseTicketButton from '@/components/CloseTicketButton';
import { prisma } from '@/db/prisma';

interface TicketPageProps {
    params: {
        id: string;
    };
}

export default async function TicketPage({ params }: TicketPageProps) {
    const { id } = await params;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
            notFound();
        }

        let user = null;
        if (ticket.userId) {
            user = await prisma.user.findUnique({
                where: { id: ticket.userId },
                select: {
                    name: true,
                    email: true
                }
            });
        }

        console.log('Ticket Data:', {
            ticketId: ticket.id,
            ticketUserId: ticket.userId,
            userFound: !!user,
            userName: user?.name,
            userEmail: user?.email
        });

        const displayId = (ticket as any).ticketId || `INFO-${ticket.id}`;
        const isClosed = ticket.status === 'solved';

        // User display logic
        const userName = user?.name || user?.email || 'Unknown User';
        const userEmail = user?.email;
        const userInitial = userName.charAt(0).toUpperCase();

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
                        {/* Ticket Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">Ticket ID:</span>
                                    <span className="ml-2 font-mono font-bold text-blue-700">
                                        {displayId}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-800">
                                    {ticket.subject}
                                </h1>

                                {/* Status & Priority */}
                                <div className="flex items-center mt-2 space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status === 'solved'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                        {ticket.status === 'solved' ? '✅ Solved' : '🔧 Open'}
                                    </span>

                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.priority === 'High'
                                        ? 'bg-red-100 text-red-800'
                                        : ticket.priority === 'Medium'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                        {ticket.priority} priority
                                    </span>
                                </div>
                            </div>

                            <CloseTicketButton
                                ticketId={ticket.id.toString()}
                                isClosed={isClosed}
                            />
                        </div>

                        {/* Description */}
                        <div className="prose max-w-none mb-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>

                        {/* User Information */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Creator Info */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">Created By</p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-medium text-lg">
                                                {userInitial}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {userName}
                                            </p>
                                            {userEmail && (
                                                <p className="text-xs text-gray-500">
                                                    {userEmail}
                                                </p>
                                            )}
                                            {ticket.userId && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    User ID: {ticket.userId.substring(0, 8)}...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Date Info */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Timeline</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Created</p>
                                            <p className="text-sm text-gray-700">
                                                {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(ticket.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {ticket.updatedAt && ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
                                            <div>
                                                <p className="text-xs text-gray-500">Last Updated</p>
                                                <p className="text-sm text-gray-700">
                                                    {new Date(ticket.updatedAt).toLocaleDateString()} at{' '}
                                                    {new Date(ticket.updatedAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Debug info if user not found */}
                            {!user && ticket.userId && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                        Note: Could not find user details for this ticket.
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Associated User ID: {ticket.userId}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading ticket:', error);
        return (
            <div className="min-h-screen bg-blue-50 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>Error loading ticket. Please try again.</p>
                        <p className="text-xs mt-1">
                            {error instanceof Error ? error.message : 'Unknown error'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
