import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/db/prisma';

export async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        return user;
    } catch (error) {
        console.log('Error getting the current user', error);
        return null;
    }
}
