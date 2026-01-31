'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const { register, loading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, name);
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen bg-gradient-to-br from-pink-light via-white to-gold-light/30 flex items-center justify-center p-4">
            <div className="card p-8 w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="text-5xl">✨</span>
                    <h1 className="font-kanit text-2xl font-bold text-gray-800 mt-4 mb-2">
                        สมัครสมาชิก
                    </h1>
                    <p className="text-gray-500">
                        สร้างบัญชีใหม่เพื่อจองบริการและสั่งซื้อขนม
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">ชื่อ-นามสกุล</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="ชื่อของคุณ"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">อีเมล</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="อย่างน้อย 6 ตัวอักษร"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full btn-primary flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                กำลังสมัคร...
                            </>
                        ) : (
                            'สมัครสมาชิก'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">มีบัญชีอยู่แล้ว?</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Login Link */}
                <Link
                    href="/login"
                    className="block w-full text-center py-3 border-2 border-pink-dark text-pink-dark rounded-xl font-medium hover:bg-pink-50 transition-colors"
                >
                    เข้าสู่ระบบ
                </Link>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-pink-dark hover:underline">
                        ← กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    );
}

function RegisterLoading() {
    return (
        <div className="pt-16 min-h-screen bg-gradient-to-br from-pink-light via-white to-gold-light/30 flex items-center justify-center p-4">
            <div className="card p-8 w-full max-w-md text-center">
                <div className="spinner mx-auto" />
                <p className="mt-4 text-gray-500">กำลังโหลด...</p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<RegisterLoading />}>
            <RegisterForm />
        </Suspense>
    );
}
