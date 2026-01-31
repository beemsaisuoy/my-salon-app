'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';

interface AdminLoginProps {
    onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const ADMIN_PIN = '1234';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pin === ADMIN_PIN) {
            onSuccess();
        } else {
            setError('Invalid PIN. Please try again.');
            setPin('');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-white">
                            Admin Portal
                        </h1>
                        <p className="text-primary-100 mt-1">
                            Enter your PIN to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-6">
                            {/* PIN Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-brown-700">
                                    Admin PIN
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPin ? 'text' : 'password'}
                                        value={pin}
                                        onChange={(e) => {
                                            setError('');
                                            setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                        }}
                                        placeholder="••••"
                                        maxLength={4}
                                        className="input-field text-center text-2xl tracking-[0.5em] font-mono pr-12"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brown-400 hover:text-brown-600 transition-colors"
                                    >
                                        {showPin ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={pin.length !== 4 || isLoading}
                                className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${pin.length !== 4 || isLoading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-brown-600 to-brown-700 hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Access Dashboard
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hint */}
                        <p className="text-center text-xs text-brown-400 mt-6">
                            Demo PIN: 1234
                        </p>
                    </form>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-brown-300 hover:text-white text-sm transition-colors"
                    >
                        ← Back to Homepage
                    </a>
                </div>
            </div>
        </div>
    );
}
