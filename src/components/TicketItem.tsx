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





import Link from 'next/link';

export default function TicketItem({ ticket }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {ticket.name}
          </h3>
          <p className="text-gray-600 mt-2">{ticket.description}</p>
          <div className="flex items-center mt-4 space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticket.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : ticket.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {ticket.priority} priority
            </span>
            <span className="text-sm text-gray-500">
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Link
          href={`/tickets/${ticket.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          View
        </Link>
      </div>
    </div>
  );
}
