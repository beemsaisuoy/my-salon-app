'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@salon.com';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw new Error(translateAuthError(error.message));
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw new Error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    };

    const register = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name, // Supabase stores profile data in user_metadata
                },
            },
        });
        if (error) throw new Error(translateAuthError(error.message));
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error('ออกจากระบบไม่สำเร็จ');
    };

    const isAdmin = user?.email === ADMIN_EMAIL;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin,
                signInWithEmail,
                signInWithGoogle,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

function translateAuthError(message: string): string {
    if (message.includes('Invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (message.includes('User already registered')) return 'อีเมลนี้ถูกใช้งานแล้ว';
    if (message.includes('Password should be')) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (message.includes('invalid email')) return 'รูปแบบอีเมลไม่ถูกต้อง';
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่';
}
