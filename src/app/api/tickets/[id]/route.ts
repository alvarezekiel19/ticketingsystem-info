import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/db/prisma';

// Helper function to check if string is UUID
function isUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await the params Promise
        const { id } = await context.params;

        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let ticket;

        // Check if param is UUID or numeric ID
        if (isUUID(id)) {
            // Lookup by UUID
            ticket = await prisma.ticket.findUnique({
                where: { uuid: id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    // Remove the incorrect 'description' include
                    // Just select the description field directly (it's already included)
                },
            });
        } else {
            // Fallback to numeric ID (for backward compatibility)
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
            }

            ticket = await prisma.ticket.findUnique({
                where: { id: numericId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                },
            });
        }

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json(
            { error: 'Error fetching ticket' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await the params Promise
        const { id } = await context.params;

        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, resolution } = body;

        let whereCondition;

        // Check if ID is UUID or numeric
        if (isUUID(id)) {
            whereCondition = { uuid: id };
        } else {
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
            }
            whereCondition = { id: numericId };
        }

        // Check if user owns the ticket
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const existingTicket = await prisma.ticket.findUnique({
            where: whereCondition,
        });

        if (!existingTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (existingTicket.userId !== user?.id) {
            return NextResponse.json({ error: 'Unauthorized to update this ticket' }, { status: 403 });
        }

        const updatedTicket = await prisma.ticket.update({
            where: whereCondition,
            data: {
                ...(status && { status }),
                ...(resolution && { resolution }),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json(
            { error: 'Error updating ticket' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await the params Promise
        const { id } = await context.params;

        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let whereCondition;

        // Check if ID is UUID or numeric
        if (isUUID(id)) {
            whereCondition = { uuid: id };
        } else {
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
            }
            whereCondition = { id: numericId };
        }

        // Check if user owns the ticket
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const existingTicket = await prisma.ticket.findUnique({
            where: whereCondition,
        });

        if (!existingTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (existingTicket.userId !== user?.id) {
            return NextResponse.json({ error: 'Unauthorized to delete this ticket' }, { status: 403 });
        }

        await prisma.ticket.delete({
            where: whereCondition,
        });

        return NextResponse.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return NextResponse.json(
            { error: 'Error deleting ticket' },
            { status: 500 }
        );
    }
}
