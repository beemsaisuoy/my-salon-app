import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import AIChatWidget from '@/components/AIChatWidget';

export const metadata: Metadata = {
    title: 'Salon & Sweets | ร้านทำผม & ขนมหวาน',
    description: 'ร้านทำผมและขนมหวานของเรา ยินดีต้อนรับค่ะ! จองคิวทำผม และซื้อขนมหวานได้เลย',
    keywords: 'ร้านทำผม, ขนมหวาน, เค้ก, คุกกี้, ทำผม, จองคิว',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body className="antialiased min-h-screen flex flex-col">
                <AuthProvider>
                    <CartProvider>
                        <Navbar />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                        <Toast />
                        <AIChatWidget />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
