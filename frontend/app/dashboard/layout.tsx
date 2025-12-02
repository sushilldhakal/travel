import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardLayoutClient } from '@/components/dashboard/layout/DashboardLayoutClient';

/**
 * Dashboard Layout (Server Component)
 * Handles server-side authentication check
 * Wraps client-side layout components
 */

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    // Redirect to login if no token
    if (!token) {
        redirect('/auth/login?redirect=/dashboard');
    }

    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
