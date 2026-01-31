'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@salon.com';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found') {
                throw new Error('ไม่พบบัญชีผู้ใช้นี้');
            } else if (error.code === 'auth/wrong-password') {
                throw new Error('รหัสผ่านไม่ถูกต้อง');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('อีเมลไม่ถูกต้อง');
            } else {
                throw new Error('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error('Google login error:', error);
            throw new Error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('ออกจากระบบไม่สำเร็จ');
        }
    };

    const isAdmin = user?.email === ADMIN_EMAIL;

    return (
        <AuthContext.Provider
            value= {{
        user,
            loading,
            isAdmin,
            signInWithEmail,
            signInWithGoogle,
            logout,
            }
}
        >
    { children }
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
