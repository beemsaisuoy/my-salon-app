import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { getSettings, getTodayString } from './firestore';

export type NotificationType =
    | 'booking_new'
    | 'order_new'
    | 'product_low_stock'
    | 'booking_today'
    | 'order_pending_long';

export interface Notification {
    id?: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    relatedId: string;
    createdAt: Timestamp;
}

// Create a notification
export async function createNotification(
    type: NotificationType,
    message: string,
    relatedId: string
): Promise<string | null> {
    try {
        // Check settings before creating
        const settings = await getSettings();

        if (type === 'booking_new' && !settings.notifyBooking) return null;
        if (type === 'product_low_stock' && !settings.notifyLowStock) return null;
        if (type === 'order_pending_long' && !settings.notifyPendingOrder) return null;

        const docRef = await addDoc(collection(db, 'notifications'), {
            type,
            message,
            isRead: false,
            relatedId,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

// Get all notifications
export async function getNotifications(): Promise<Notification[]> {
    try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// Get unread count
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const q = query(collection(db, 'notifications'), where('isRead', '==', false));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

// Mark single notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all as read
export async function markAllNotificationsAsRead(): Promise<void> {
    try {
        const q = query(collection(db, 'notifications'), where('isRead', '==', false));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// Check if notification exists for today with specific type
export async function hasNotificationToday(type: NotificationType, relatedId?: string): Promise<boolean> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = Timestamp.fromDate(today);

        let q;
        if (relatedId) {
            q = query(
                collection(db, 'notifications'),
                where('type', '==', type),
                where('relatedId', '==', relatedId),
                where('createdAt', '>=', startOfDay)
            );
        } else {
            q = query(
                collection(db, 'notifications'),
                where('type', '==', type),
                where('createdAt', '>=', startOfDay)
            );
        }

        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking notification:', error);
        return false;
    }
}

// Check booking today reminder
export async function checkBookingTodayNotification(bookingCount: number): Promise<void> {
    if (bookingCount === 0) return;

    const exists = await hasNotificationToday('booking_today');
    if (!exists) {
        await createNotification(
            'booking_today',
            `📌 วันนี้มีจอง ${bookingCount} คน — อย่าลืมเตรียมตัว!`,
            getTodayString()
        );
    }
}

// Check low stock products
export async function checkLowStockNotification(productId: string, productName: string): Promise<void> {
    const exists = await hasNotificationToday('product_low_stock', productId);
    if (!exists) {
        await createNotification(
            'product_low_stock',
            `⚠️ สินค้า ${productName} หมดสต็อก! โปรดเติม`,
            productId
        );
    }
}

// Check pending order too long
export async function checkPendingOrderNotification(orderId: string, createdAt: Timestamp): Promise<void> {
    const now = new Date();
    const orderTime = createdAt.toDate();
    const diffHours = (now.getTime() - orderTime.getTime()) / 3600000;

    if (diffHours > 1) {
        const exists = await hasNotificationToday('order_pending_long', orderId);
        if (!exists) {
            await createNotification(
                'order_pending_long',
                `⏰ คำสั่งซื้อ #${orderId.slice(-6)} รอมากกว่า 1 ชั่วโมง! โปรดตรวจสอบ`,
                orderId
            );
        }
    }
}
