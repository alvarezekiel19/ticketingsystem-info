import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + '&timezone=Asia/Manila'
        }
    },
    // Or set in log format
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to convert to PH time
export function toPHTime(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

// Helper function to get current PH time
export function nowPHTime(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}
