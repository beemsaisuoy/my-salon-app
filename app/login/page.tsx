'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const { signInWithEmail, signInWithGoogle, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signInWithEmail(email, password);
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            await signInWithGoogle();
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
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
                    <span className="text-5xl">💕</span>
                    <h1 className="font-kanit text-2xl font-bold text-gray-800 mt-4 mb-2">
                        เข้าสู่ระบบ
                    </h1>
                    <p className="text-gray-500">
                        ยินดีต้อนรับกลับมา!
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    เข้าสู่ระบบด้วย Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">หรือ</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
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
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full btn-primary flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-pink-dark hover:underline">
                        ← กลับหน้าแรก
                    </Link>
                </div>

                {/* Demo Note */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500">
                        🔐 Admin: admin@salon.com
                    </p>
                </div>
            </div>
        </div>
    );
}

function LoginLoading() {
    return (
        <div className="pt-16 min-h-screen bg-gradient-to-br from-pink-light via-white to-gold-light/30 flex items-center justify-center p-4">
            <div className="card p-8 w-full max-w-md text-center">
                <div className="spinner mx-auto" />
                <p className="mt-4 text-gray-500">กำลังโหลด...</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}
