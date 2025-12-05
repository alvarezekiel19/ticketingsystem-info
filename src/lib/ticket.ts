import { prisma } from '@/db/prisma';

export async function generateTicketId(): Promise<string> {
    // get latest ticket to increment the number
    const latestTicket = await prisma.ticket.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { ticketId: true }
    });

    let nextNumber = 1;
    if (latestTicket?.ticketId) {
        const match = latestTicket.ticketId.match(/INFO-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1]) + 1;
        }
    }
    return `INFO-${nextNumber.toString().padStart(4, '0')}`;
}

export async function createSearchText(title: string, body: string): Promise<string> {
    // combine and normalize text for searching
    return `${title.toLowerCase()} ${body.toLowerCase()}`.replace(/[^\w\s]/g, ' ');
}


