'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/login?redirect=/admin');
        }
    }, [user, loading, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center card p-8 max-w-md">
                    <span className="text-6xl mb-4">🔒</span>
                    <h2 className="font-kanit text-2xl font-bold text-gray-800 mb-2">
                        ไม่มีสิทธิ์เข้าถึง
                    </h2>
                    <p className="text-gray-600 mb-4">
                        คุณต้องเป็น Admin เพื่อเข้าใช้งานส่วนนี้
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="btn-primary"
                    >
                        เข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
