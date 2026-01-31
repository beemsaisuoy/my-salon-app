import { supabase } from './supabase';
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
    createdAt: string;
}

// Create a notification
export async function createNotification(
    type: NotificationType,
    message: string,
    relatedId: string,
    createdAt?: string // Optional override
): Promise<string | null> {
    try {
        // Check settings before creating
        const settings = await getSettings();

        if (type === 'booking_new' && !settings.notifyBooking) return null;
        if (type === 'product_low_stock' && !settings.notifyLowStock) return null;
        if (type === 'order_pending_long' && !settings.notifyPendingOrder) return null;

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                type,
                message,
                is_read: false,
                related_id: relatedId,
                created_at: createdAt || undefined, // undefined lets DB use default now()
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

// Get all notifications
export async function getNotifications(): Promise<Notification[]> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((n: any) => ({
            id: n.id,
            type: n.type,
            message: n.message,
            isRead: n.is_read,
            relatedId: n.related_id,
            createdAt: n.created_at,
        })) as Notification[];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// Get unread count
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

// Mark single notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all as read
export async function markAllNotificationsAsRead(): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// Check if notification exists for today with specific type
export async function hasNotificationToday(type: NotificationType, relatedId?: string): Promise<boolean> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.toISOString();

        let query = supabase
            .from('notifications')
            .select('id')
            .eq('type', type)
            .gte('created_at', startOfDay);

        if (relatedId) {
            query = query.eq('related_id', relatedId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data && data.length > 0;
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
export async function checkPendingOrderNotification(orderId: string, createdAt: string): Promise<void> {
    const now = new Date();
    const orderTime = new Date(createdAt);
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
