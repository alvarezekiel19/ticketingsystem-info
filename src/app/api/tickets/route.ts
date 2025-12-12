import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
// ADD THIS PUT METHOD TO YOUR EXISTING src/app/api/tickets/route.ts
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Ticket ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { status, resolution } = body;

        // Validate resolution is required when closing
        if (status === 'closed' && (!resolution || resolution.trim() === '')) {
            return NextResponse.json(
                { error: 'Resolution message is required to close a ticket' },
                { status: 400 }
            );
        }

        const updateData: any = {
            status,
            updatedAt: new Date(),
        };

        // Add resolution to update data
        if (status === 'closed') {
            updateData.resolution = resolution;
        }

        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json(
            { error: 'Error updating ticket' },
            { status: 500 }
        );
    }
}
