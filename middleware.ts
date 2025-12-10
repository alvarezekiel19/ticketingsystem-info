import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const url = req.nextUrl;

        // Protect ticket routes
        if (url.pathname.startsWith('/tickets')) {
            if (!token) {
                // Use relative path for Vercel
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            // Check if regular user is approved
            if (token.role === 'USER' && !token.isActive) {
                url.pathname = '/pending-approval';
                return NextResponse.redirect(url);
            }
        }

        // Protect admin routes
        if (url.pathname.startsWith('/admin')) {
            if (!token || token.role !== 'ADMIN') {
                url.pathname = '/tickets';
                return NextResponse.redirect(url);
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ['/tickets/:path*', '/admin/:path*'],
};
