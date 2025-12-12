'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/db/prisma';
import { logEvent } from '@/utils/sentry';
import { revalidatePath } from 'next/cache';

// Create new ticket
export async function createTicket(
    prevState: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'You must be logged in' };
    }

    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    if (!subject || !description || !priority) {
        return { success: false, message: 'All fields are required' };
    }

    try {
        await prisma.ticket.create({
            data: {
                subject,
                description,
                priority,
                user: { connect: { id: user.id } },
            },
        });

        revalidatePath('/tickets');
        return { success: true, message: 'Ticket created successfully' };

    } catch (error) {
        console.error('Error creating ticket:', error);
        return {
            success: false,
            message: 'Failed to create ticket',
        };
    }
}
// Get all user tickets
export async function getTickets() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            logEvent('Unauthorized access to ticket list', 'ticket', {}, 'warning');
            return [];
        }

        const tickets = await prisma.ticket.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        logEvent(
            'Fetched ticket list',
            'ticket',
            { count: tickets.length },
            'info'
        );

        return tickets;
    } catch (error) {
        logEvent('Error fetching tickets', 'ticket', {}, 'error', error);

        return [];
    }
}

// Get single ticket details
export async function getTicketById(id: string) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(id) },
        });

        if (!ticket) {
            logEvent('Ticket not found', 'ticket', { ticketId: id }, 'warning');
        }

        return ticket;
    } catch (error) {
        logEvent(
            'Error fetching ticket details',
            'ticket',
            { ticketId: id },
            'error',
            error
        );
        return null;
    }
}

export async function closeTicket(
    prevState: any,
    formData: FormData
) {
    try {
        const ticketId = formData.get('ticketId') as string;
        const resolution = formData.get('resolution') as string;

        console.log('=== DEBUG closeTicket action ===');
        console.log('Ticket ID:', ticketId);
        console.log('Resolution from form:', resolution);
        console.log('Resolution length:', resolution?.length);
        console.log('Resolution trimmed:', resolution?.trim());
        console.log('Is resolution empty?', !resolution || resolution.trim() === '');

        // Validate resolution
        if (!resolution || resolution.trim() === '') {
            console.log('VALIDATION FAILED: Resolution is empty');
            return {
                success: false,
                message: 'Resolution message is required to close a ticket',
            };
        }

        console.log('Updating database...');
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(ticketId) },
            data: {
                status: 'solved',
                resolution: resolution.trim(),
                updatedAt: new Date(),
            },
        });

        console.log('Database update result:');
        console.log('- Status:', ticket.status);
        console.log('- Resolution saved:', ticket.resolution);
        console.log('- Resolution length in DB:', ticket.resolution?.length);

        // Revalidate paths
        revalidatePath('/tickets');
        revalidatePath(`/tickets/${ticketId}`);

        return {
            success: true,
            message: 'Ticket closed successfully',
        };
    } catch (error) {
        console.error('Error closing ticket:', error);
        return {
            success: false,
            message: 'Failed to close ticket',
        };
    }
}



// export async function closeTicket(prevState: any, formData: FormData) {
//   try {
//     const ticketId = formData.get('ticketId');
//
//     if (!ticketId) {
//       return {
//         success: false,
//         message: 'Ticket ID is required',
//       };
//     }
//
//     await sql`UPDATE "Ticket" SET status = 'solved' WHERE id = ${ticketId.toString()}`;
//
//     // Revalidate the tickets page and individual ticket page
//     revalidatePath('/tickets');
//     revalidatePath(`/tickets/${ticketId}`);
//
//     return {
//       success: true,
//       message: 'Ticket closed successfully',
//     };
//   } catch (error) {
//     console.error('Error closing ticket:', error);
//     return {
//       success: false,
//       message: 'Failed to close ticket',
//     };
//   }
// }
