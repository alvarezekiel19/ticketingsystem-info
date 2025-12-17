'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/db/prisma';
import { logEvent } from '@/utils/sentry';
import { revalidatePath } from 'next/cache';

// Helper function to check if string is UUID
function isUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function createTicket(
    prevState: { success: boolean; message: string },
    formData: FormData
) {
    console.log('=== DEBUG: createTicket called ===');

    try {
        const user = await getCurrentUser();
        console.log('User:', user?.email);

        if (!user) {
            console.log('ERROR: No user found');
            return { success: false, message: 'You must be logged in' };
        }

        const subject = formData.get('subject') as string;
        const description = formData.get('description') as string;
        const priority = formData.get('priority') as string;

        console.log('Form data received:', {
            subject: subject?.substring(0, 50) + '...',
            description: description?.substring(0, 50) + '...',
            priority
        });

        // Validation
        if (!subject?.trim()) {
            console.log('ERROR: Subject is required');
            return { success: false, message: 'Subject is required' };
        }
        if (!description?.trim()) {
            console.log('ERROR: Description is required');
            return { success: false, message: 'Description is required' };
        }
        if (!priority) {
            console.log('ERROR: Priority is required');
            return { success: false, message: 'Priority is required' };
        }

        console.log('Attempting to create ticket...');
        const ticket = await prisma.ticket.create({
            data: {
                subject: subject.trim(),
                description: description.trim(),
                priority,
                userId: user.id,
            },
        });

        console.log('Ticket created successfully:', {
            id: ticket.id,
            uuid: ticket.uuid,
            subject: ticket.subject
        });

        return {
            success: true,
            message: 'Ticket created successfully!',
            ticketUuid: ticket.uuid
        };

    } catch (error: any) {
        console.error('ERROR in createTicket:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });

        // Check for specific errors
        let errorMessage = 'Failed to create ticket';

        if (error.code === 'P2002') {
            errorMessage = 'A ticket with similar data already exists';
        } else if (error.message?.includes('uuid')) {
            errorMessage = 'Database UUID generation failed';
        } else if (error.message?.includes('connect')) {
            errorMessage = 'Database connection failed';
        }

        return {
            success: false,
            message: errorMessage
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
        let ticket;

        if (isUUID(id)) {
            // lookup by uuid
            ticket = await prisma.ticket.findUnique({
                where: { uuid: id },
            });
        } else {
            // fallback to numeric ID
            const numericId = Number(id);
            if (isNaN(numericId)) {
                logEvent('Invalid ticket ID', 'ticket', { ticketId: id }, 'warning');
                return null;
            }

            ticket = await prisma.ticket.findUnique({
                where: { id: numericId },
            });
        }

        // ticket = await prisma.ticket.findUnique({
        //     where: { id: Number(id) },
        // });

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
        const ticketUuid = formData.get('ticketUuid') as string | null;
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

        let ticket;
        let whereCondition;

        // Determine which identifier to use
        if (ticketUuid) {
            whereCondition = { uuid: ticketUuid };
            console.log('Looking up ticket by UUID:', ticketUuid);
        } else {
            const numericId = parseInt(ticketId);
            if (isNaN(numericId)) {
                console.log('Validation Failed: Invalid numeric ticket ID');
                return {
                    success: false,
                    message: 'Invalid ticket ID',
                };
            }
            whereCondition = { id: numericId };
            console.log('Looking up ticket by numeric ID:', numericId);
        }

        // find the ticket to get its UUID
        const existingTicket = await prisma.ticket.findUnique({
            where: whereCondition,
        });

        if (!existingTicket) {
            console.log('Ticket not found');
            return {
                success: true,
                message: 'Ticket not found',
            };
        }

        console.log('Updating database...');
        ticket = await prisma.ticket.update({
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
        console.log('- Ticket UUID:', ticket.uuid);

        // Revalidate paths
        revalidatePath('/tickets');
        // revalidatePath(`/tickets/${ticketId}`);

        if (ticketUuid) {
            revalidatePath('/tickets');
            if (ticketUuid) {
                revalidatePath(`/tickets/${ticketUuid}`);
            } else if (ticket.uuid) {
                // if we have the UUID form the database, use it
                revalidatePath(`/tickets/${ticket.uuid}`);
            }
        }
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
