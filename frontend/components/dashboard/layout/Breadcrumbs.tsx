'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs } from '@/providers/BreadcrumbsProvider';

/**
 * Breadcrumbs Component
 * Migrated from dashboard/src/userDefinedComponents/Breadcrumb.tsx
 * Displays navigation breadcrumb trail
 */

export function Breadcrumbs() {
    const pathname = usePathname();
    const { breadcrumbs } = useBreadcrumbs();

    // Generate breadcrumbs from pathname if not set manually
    const pathSegments = pathname.split('/').filter(Boolean);

    const defaultBreadcrumbs = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return { label, href };
    });

    const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {displayBreadcrumbs.map((crumb, index) => (
                <div key={crumb.href || index} className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4" />
                    {index === displayBreadcrumbs.length - 1 ? (
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href || '#'}
                            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
