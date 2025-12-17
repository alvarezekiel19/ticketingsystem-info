import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // check if param is UUID or numeric ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);

        let ticket;

        if (isUUID) {
            // lookup UUID
            ticket = await prisma.ticket.findUnique({
                where: { uuid: params.id },
                include: {
                    comments: {
                        include: {
                            user: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });
        } else {
            // fallback to numeric ID (for backward compatibility)
            const numericId = parseInt(params.id);
            if (isNaN(numericId)) {
                return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
            }

            ticket = await prisma.ticket.findUnique({
                where: { id: numericId },
                include: {
                    comments: {
                        include: {
                            user: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
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
    { params }: { params: { id: string } }
) {
    try {
        // Check if ID is UUID or numeric
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);

        const body = await request.json();

        // Determine where clause based on ID type
        const whereClause = isUUID
            ? { uuid: params.id }
            : { id: parseInt(params.id) };

        const updatedTicket = await prisma.ticket.update({
            where: whereClause,
            data: body,
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        // ... error handling
    }
}
