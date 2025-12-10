import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;

        // If trying to access tickets without proper approval
        if (req.nextUrl.pathname.startsWith('/tickets')) {
            // Check if user is authenticated
            if (!token) {
                return NextResponse.redirect(new URL('/login', req.url));
            }

            // Check if regular user is approved
            if (token.role === 'USER' && !token.isActive) {
                return NextResponse.redirect(new URL('/pending-approval', req.url));
            }
        }

        // Check admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
            if (!token || token.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/tickets', req.url));
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
