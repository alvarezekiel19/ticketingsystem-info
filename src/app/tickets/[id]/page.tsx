import Link from 'next/link';
import { notFound } from 'next/navigation';
import CloseTicketButton from '@/components/CloseTicketButton';
import { prisma } from '@/db/prisma';
import { formatToPHTime } from '@/lib/timezone';
import ReactMarkdown from 'react-markdown';

// Helper function to check if string is UUID
function isUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default async function TicketPage({
    params
}: {
    params: Promise<{ id: string }> // Updated for Next.js 16
}) {
    const { id } = await params; // Await the params Promise

    try {
        let ticket;

        if (isUUID(id)) {
            ticket = await prisma.ticket.findUnique({
                where: { uuid: id },
                select: {
                    id: true,
                    uuid: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    resolution: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                },
            });
        } else {
            // fallback to numeric ID (for backward compatibility during transition)
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                notFound();
            }

            ticket = await prisma.ticket.findUnique({
                where: { id: numericId },
                select: {
                    id: true,
                    uuid: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    resolution: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                }
            });
        }

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

        const createdPH = formatToPHTime(ticket.createdAt);
        const updatedPH = ticket.updatedAt ? formatToPHTime(ticket.updatedAt) : null;

        const displayId = (ticket as any).ticketId || `INFO-${ticket.id}`;
        const isClosed = ticket.status === 'solved';

        // User display logic
        const userName = user?.name || user?.email || 'Unknown User';
        const userEmail = user?.email;
        const userInitial = userName.charAt(0).toUpperCase();

        const markdownComponents = {
            h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
            h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
            p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
            ul: ({ node, ...props }: any) => <ul className="list-disc ml-4 mb-2" {...props} />,
            ol: ({ node, ...props }: any) => <ol className="list-decimal ml-4 mb-2" {...props} />,
            li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
            code: ({ node, inline, ...props }: any) =>
                inline
                    ? <code className="bg-gray-100 px-1 rounded text-sm font-mono" {...props} />
                    : <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto"><code className="text-sm font-mono" {...props} /></pre>,
            blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
            a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
            strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
            em: ({ node, ...props }: any) => <em className="italic" {...props} />,
        };

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
                                ticketId={ticket.id}
                                ticketUuid={ticket.uuid} // Add this line for UUID support
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

                        {/* Resolution Display */}
                        {ticket.status === 'solved' && ticket.resolution && ticket.resolution.trim() !== '' && (
                            <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-green-800 text-lg mb-3 flex items-center">
                                    <span className="mr-2">✅</span> Resolution
                                </h3>
                                <div className="bg-white p-4 rounded border border-green-100">
                                    <div className="text-gray-700">
                                        <ReactMarkdown components={markdownComponents}>
                                            {ticket.resolution}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-sm text-green-600">
                                        Ticket was solved on {updatedPH || formatToPHTime(ticket.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* User Information */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Creator Info */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">Created By:</p>
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
                                            <p className="text-xs text-gray-500">Created:</p>
                                            <p className="text-sm text-gray-700">
                                                {createdPH}
                                            </p>
                                        </div>
                                        {updatedPH && ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
                                            <div>
                                                <p className="text-xs text-gray-500">Last Updated:</p>
                                                <p className="text-sm text-gray-700">
                                                    {updatedPH}
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
