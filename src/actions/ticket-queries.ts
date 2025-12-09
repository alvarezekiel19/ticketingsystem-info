'use server';

import { prisma } from '@/db/prisma';

export async function getTicketWithUser(id: string) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!ticket) {
            return null;
        }

        return {
            id: ticket.id,
            subject: ticket.subject,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            userName: ticket.user.name,
            userEmail: ticket.user.email,
        };
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return null;
    }
}
