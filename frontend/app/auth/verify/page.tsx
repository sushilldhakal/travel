"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Redirect to login page with token
    if (typeof window !== 'undefined') {
        const token = searchParams.get('token');
        if (token) {
            router.push(`/auth/login?token=${token}`);
        } else {
            router.push('/auth/login');
        }
    }

    return null;
}
