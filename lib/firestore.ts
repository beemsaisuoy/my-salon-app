import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ===================== BOOKINGS =====================
export interface Booking {
    id?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    service: string;
    servicePrice: number;
    date: string;
    time: string;
    status: 'รอยืนยัน' | 'ยืนยัน' | 'เสร็จ' | 'ยกเลิก';
    createdAt: Timestamp;
}

export async function getBookings() {
    try {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('ไม่สามารถโหลดข้อมูลการจองได้');
    }
}

export async function getBookingsByDate(date: string) {
    try {
        const q = query(collection(db, 'bookings'), where('date', '==', date));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (error) {
        console.error('Error fetching bookings by date:', error);
        throw new Error('ไม่สามารถโหลดข้อมูลการจองได้');
    }
}

export async function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...booking,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding booking:', error);
        throw new Error('ไม่สามารถบันทึกการจองได้');
    }
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
    try {
        await updateDoc(doc(db, 'bookings', id), { status });
    } catch (error) {
        console.error('Error updating booking:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะได้');
    }
}

// ===================== PRODUCTS =====================
export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    inStock: boolean;
    createdAt: Timestamp;
}

const defaultProducts: Omit<Product, 'id' | 'createdAt'>[] = [
    { name: 'คุกกี้ โช็คโค้ลแท้', description: 'คุกกี้ช็อคโกแลตแท้ กรอบนอกนุ่มใน', price: 65, category: 'คุกกี้', imageUrl: 'https://picsum.photos/400/300?random=1', inStock: true },
    { name: 'เค้กเตยหอม', description: 'เค้กเตยหอมนุ่มละมุน', price: 180, category: 'เค้ก', imageUrl: 'https://picsum.photos/400/300?random=2', inStock: true },
    { name: 'คุกกี้ สตรอว์เบอร์รี', description: 'คุกกี้สตรอว์เบอร์รีหอมหวาน', price: 70, category: 'คุกกี้', imageUrl: 'https://picsum.photos/400/300?random=3', inStock: true },
    { name: 'เค้กน้ำผึ้ง', description: 'เค้กน้ำผึ้งแท้ หวานธรรมชาติ', price: 220, category: 'เค้ก', imageUrl: 'https://picsum.photos/400/300?random=4', inStock: true },
    { name: 'ขนมปังไส้ครีม', description: 'ขนมปังนุ่มไส้ครีมเข้มข้น', price: 55, category: 'ขนมปัง', imageUrl: 'https://picsum.photos/400/300?random=5', inStock: true },
    { name: 'ขนมปังไส้ทอง', description: 'ขนมปังไส้ฝอยทองหวานมัน', price: 60, category: 'ขนมปัง', imageUrl: 'https://picsum.photos/400/300?random=6', inStock: true },
    { name: 'เครื่องดื่มเตย', description: 'น้ำใบเตยเย็นสดชื่น', price: 85, category: 'เครื่องดื่ม', imageUrl: 'https://picsum.photos/400/300?random=7', inStock: true },
    { name: 'Matcha Latte', description: 'มัทฉะลาเต้เข้มข้นหอมชา', price: 90, category: 'เครื่องดื่ม', imageUrl: 'https://picsum.photos/400/300?random=8', inStock: true },
];

export async function getProducts() {
    try {
        const snapshot = await getDocs(collection(db, 'products'));

        // Auto-seed if empty
        if (snapshot.empty) {
            for (const product of defaultProducts) {
                await addDoc(collection(db, 'products'), {
                    ...product,
                    createdAt: Timestamp.now(),
                });
            }
            // Fetch again after seeding
            const newSnapshot = await getDocs(collection(db, 'products'));
            return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('ไม่สามารถโหลดสินค้าได้');
    }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('ไม่สามารถเพิ่มสินค้าได้');
    }
}

export async function updateProduct(id: string, data: Partial<Product>) {
    try {
        await updateDoc(doc(db, 'products', id), data);
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('ไม่สามารถอัพเดทสินค้าได้');
    }
}

export async function deleteProduct(id: string) {
    try {
        await deleteDoc(doc(db, 'products', id));
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error('ไม่สามารถลบสินค้าได้');
    }
}

// ===================== ORDERS =====================
export interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
}

export interface Order {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'รอเตรียม' | 'เตรียมเสร็จ' | 'รอรับ' | 'รับแล้ว' | 'ยกเลิก';
    paymentMethod: string;
    createdAt: Timestamp;
}

export async function getOrders() {
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('ไม่สามารถโหลดคำสั่งซื้อได้');
    }
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding order:', error);
        throw new Error('ไม่สามารถบันทึกคำสั่งซื้อได้');
    }
}

export async function updateOrderStatus(id: string, status: Order['status']) {
    try {
        await updateDoc(doc(db, 'orders', id), { status });
    } catch (error) {
        console.error('Error updating order:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะได้');
    }
}

// ===================== SETTINGS =====================
export interface ShopSettings {
    shopName: string;
    shopAddress: string;
    shopPhone: string;
    shopEmail: string;
    openingHours: string;
    closedDays: string;
    taxRate: number;
    welcomeMessage: string;
    notifyBooking: boolean;
    notifyLowStock: boolean;
    notifyPendingOrder: boolean;
}

const defaultSettings: ShopSettings = {
    shopName: 'Salon & Sweets',
    shopAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    shopPhone: '02-123-4567',
    shopEmail: 'hello@salonsweets.com',
    openingHours: '09:00 - 18:00',
    closedDays: 'วันจันทร์',
    taxRate: 7,
    welcomeMessage: 'สวัสดีค่ะ! ยินดีต้อนรับสู่ร้านของเรา 💕',
    notifyBooking: true,
    notifyLowStock: true,
    notifyPendingOrder: true,
};

export async function getSettings(): Promise<ShopSettings> {
    try {
        const docRef = doc(db, 'settings', 'shop_settings');
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }

        return snapshot.data() as ShopSettings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return defaultSettings;
    }
}

export async function updateSettings(settings: Partial<ShopSettings>) {
    try {
        const docRef = doc(db, 'settings', 'shop_settings');
        await setDoc(docRef, settings, { merge: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
    }
}

// ===================== HELPER FUNCTIONS =====================
export function formatTimestamp(timestamp: Timestamp | undefined): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getTimeAgo(timestamp: Timestamp | undefined): string {
    if (!timestamp) return '';
    const now = new Date();
    const date = timestamp.toDate();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return formatTimestamp(timestamp);
}

export function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

export function isToday(timestamp: Timestamp | undefined): boolean {
    if (!timestamp) return false;
    const date = timestamp.toDate();
    const today = new Date();
    return date.toDateString() === today.toDateString();
}
