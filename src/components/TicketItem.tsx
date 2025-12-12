// import Link from 'next/link';
// import { getPriorityClass } from '@/utils/ui';
// import type { Ticket } from '@/generated/prisma';
//
// type TicketItemProps = {
//   ticket: Ticket;
// };
//
// const TicketItem = ({ ticket }: TicketItemProps) => {
//   const isClosed = ticket.status === 'Closed';
//
//   return (
//     <div
//       key={ticket.id}
//       className={`flex justify-between items-center bg-white rounded-lg shadow border border-gray-200 p-6 ${
//         isClosed ? 'opacity-50' : ''
//       }`}
//     >
//       {/* Left Side */}
//       <div>
//         <h2 className='text-xl font-semibold text-blue-600'>
//           {ticket.subject}
//         </h2>
//       </div>
//       {/* Right Side */}
//       <div className='text-right space-y-2'>
//         <div className='text-sm text-gray-500'>
//           Priority:{' '}
//           <span className={getPriorityClass(ticket.priority)}>
//             {ticket.priority}
//           </span>
//         </div>
//         <Link
//           href={`/tickets/${ticket.id}`}
//           className={`inline-block mt-2 text-sm px-3 py-1 rounded transition text-center ${
//             isClosed
//               ? 'bg-gray-400 text-gray-700 cursor-not-allowed pointer-events-none'
//               : 'bg-blue-600 text-white hover:bg-blue-700 '
//           }`}
//         >
//           View Ticket
//         </Link>
//       </div>
//     </div>
//   );
// };
//
// export default TicketItem;


'use client';

import { useState } from 'react';

interface TicketItemProps {
    ticket: {
        id: number;
        title: string;
        description: string;
        status: string;
        priority: string;
        createdAt: Date;
        resolution?: string | null;
    };
    onUpdate?: () => void;
}

export default function TicketItem({ ticket, onUpdate }: TicketItemProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [resolutionText, setResolutionText] = useState('');
    const [resolutionError, setResolutionError] = useState('');

    const handleCloseTicket = async () => {
        if (!resolutionText.trim()) {
            setResolutionError('Please describe how you resolved the issue');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'closed',
                    resolution: resolutionText
                }),
            });

            if (!response.ok) throw new Error('Failed to close ticket');

            if (onUpdate) onUpdate();

            setShowResolutionModal(false);
            setResolutionText('');
        } catch (error) {
            console.error('Error closing ticket:', error);
            setResolutionError('Failed to close ticket');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{ticket.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {ticket.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${ticket.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : ticket.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {ticket.priority}
                            </span>
                        </div>

                        <p className="text-gray-600 mt-2">{ticket.description}</p>

                        {/* RESOLUTION DISPLAY FOR CLOSED TICKETS */}
                        {ticket.status === 'closed' && ticket.resolution && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                <h4 className="font-medium text-green-800 text-sm mb-1">Resolution:</h4>
                                <p className="text-green-700 text-xs whitespace-pre-wrap line-clamp-2">
                                    {ticket.resolution}
                                </p>
                            </div>
                        )}

                        <p className="text-sm text-gray-500 mt-2">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        {ticket.status === 'open' && (
                            <button
                                onClick={() => setShowResolutionModal(true)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Resolution Input Modal */}
            {showResolutionModal && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3">Close Ticket #{ticket.id}</h2>
                        <p className="mb-4 text-gray-600 text-sm">
                            Please provide resolution details before closing.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resolution Details *
                            </label>
                            <textarea
                                value={resolutionText}
                                onChange={(e) => {
                                    setResolutionText(e.target.value);
                                    setResolutionError('');
                                }}
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Describe how you solved the problem..."
                            />
                            {resolutionError && (
                                <p className="text-red-500 text-xs mt-1">{resolutionError}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloseTicket}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {isUpdating ? 'Closing...' : 'Close Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
