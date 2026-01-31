import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Init Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
    preOrderDays: number;
    createdAt?: any;
    embedding?: number[]; // Added for vector search
}

// Vector Search Function
export async function searchProductsByEmbedding(embedding: number[]) {
    const { data, error } = await supabase.rpc('match_products', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
    });
    if (error) throw error;

    // Map result to Product interface
    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl, // specific mapping if rpc returns camelCase or snake_case
        stock: p.stock,
        preOrderDays: 0 // default or fetch
    })) as Product[];
}

export async function getProducts() {
    try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            imageUrl: p.image_url,
            stock: p.stock ?? 0,
            preOrderDays: p.pre_order_days ?? 3,
            createdAt: p.created_at,
        })) as Product[];
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('ไม่สามารถโหลดสินค้าได้');
    }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image_url: product.imageUrl,
                stock: product.stock,
                pre_order_days: product.preOrderDays,
                embedding: product.embedding, // Added embedding
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('ไม่สามารถเพิ่มสินค้าได้');
    }
}

export async function updateProduct(id: string, data: Partial<Product>) {
    try {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;
        if (data.price) updateData.price = data.price;
        if (data.category) updateData.category = data.category;
        if (data.imageUrl) updateData.image_url = data.imageUrl;
        if (data.stock !== undefined) updateData.stock = data.stock;
        if (data.preOrderDays !== undefined) updateData.pre_order_days = data.preOrderDays;
        if (data.embedding) updateData.embedding = data.embedding; // Added embedding

        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('ไม่สามารถอัพเดทสินค้าได้');
    }
}

export async function deleteProduct(id: string) {
    try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error('ไม่สามารถลบสินค้าได้');
    }
}

// Transaction: Deduct Stock
export async function deductStock(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock, pre_order_days')
            .eq('id', item.productId)
            .single();

        if (product) {
            // Allow if stock is sufficient OR if pre-order is enabled
            if (product.stock >= item.quantity || (product.pre_order_days || 0) > 0) {
                const { error } = await supabase.rpc('decrement_stock', { p_id: item.productId, q: item.quantity });

                if (error) {
                    console.error('RPC decrement failed, trying manual update', error);
                    await supabase
                        .from('products')
                        .update({ stock: product.stock - item.quantity })
                        .eq('id', item.productId);
                }
            } else {
                throw new Error(`สินค้า ${item.productId} หมดแล้ว`);
            }
        }
    }
}

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
    createdAt: string;
}

export async function getBookings() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((b: any) => ({
            id: b.id,
            customerName: b.customer_name,
            customerPhone: b.customer_phone,
            customerEmail: b.customer_email,
            service: b.service,
            servicePrice: b.service_price,
            date: b.date,
            time: b.time,
            status: b.status,
            createdAt: b.created_at,
        })) as Booking[];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('ไม่สามารถโหลดข้อมูลการจองได้');
    }
}

export async function getBookingsByDate(date: string) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', date);

        if (error) throw error;

        return data.map((b: any) => ({
            id: b.id,
            customerName: b.customer_name,
            customerPhone: b.customer_phone,
            customerEmail: b.customer_email,
            service: b.service,
            servicePrice: b.service_price,
            date: b.date,
            time: b.time,
            status: b.status,
            createdAt: b.created_at,
        })) as Booking[];
    } catch (error) {
        console.error('Error fetching bookings by date:', error);
        throw new Error('ไม่สามารถโหลดข้อมูลการจองได้');
    }
}

export async function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                customer_name: booking.customerName,
                customer_phone: booking.customerPhone,
                customer_email: booking.customerEmail,
                service: booking.service,
                service_price: booking.servicePrice,
                date: booking.date,
                time: booking.time,
                status: booking.status,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error adding booking:', error);
        throw new Error('ไม่สามารถบันทึกการจองได้');
    }
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะได้');
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
    createdAt: string;
}

export async function getOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            userName: o.user_name,
            userEmail: o.user_email,
            items: o.items,
            subtotal: o.subtotal,
            tax: o.tax,
            total: o.total,
            status: o.status,
            paymentMethod: o.payment_method,
            createdAt: o.created_at,
        })) as Order[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('ไม่สามารถโหลดคำสั่งซื้อได้');
    }
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: order.userId,
                user_name: order.userName,
                user_email: order.userEmail,
                items: order.items,
                subtotal: order.subtotal,
                tax: order.tax,
                total: order.total,
                status: order.status,
                payment_method: order.paymentMethod,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error adding order:', error);
        throw new Error('ไม่สามารถบันทึกคำสั่งซื้อได้');
    }
}

export async function updateOrderStatus(id: string, status: Order['status']) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating order:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะได้');
    }
}

// ===================== SITE SETTINGS =====================
export interface SiteSettings {
    promptpayNumber: string;
    promptpayName: string;
    lineToken: string;
    welcomeMessage?: string; // Mapped from shop_settings
    notifyBooking?: boolean; // Mapped
    notifyLowStock?: boolean; // Mapped
    notifyPendingOrder?: boolean; // Mapped
    shopSettings: {
        preOrderDays?: number;
        welcomeMessage?: string;
        notifyBooking?: boolean;
        notifyLowStock?: boolean;
        notifyPendingOrder?: boolean;
    };
}

// Alias for backward compatibility
export type ShopSettings = SiteSettings;

const defaultSiteSettings: SiteSettings = {
    promptpayNumber: '0812345678',
    promptpayName: 'Salon & Sweets',
    lineToken: '',
    shopSettings: { preOrderDays: 3 }
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 'shop_settings')
            .single();

        if (error || !data) {
            return defaultSiteSettings;
        }

        const shopSettings = data.shop_settings || {};

        return {
            promptpayNumber: data.promptpay_number,
            promptpayName: data.promptpay_name,
            lineToken: data.line_token,
            shopSettings: shopSettings,
            // Map nested settings to top level for backward compatibility
            welcomeMessage: shopSettings.welcomeMessage,
            notifyBooking: shopSettings.notifyBooking ?? true,
            notifyLowStock: shopSettings.notifyLowStock ?? true,
            notifyPendingOrder: shopSettings.notifyPendingOrder ?? true,
        };
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return defaultSiteSettings;
    }
}

// Alias
export const getSettings = getSiteSettings;

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
    try {
        const updatePayload: any = { id: 'shop_settings' };
        if (settings.promptpayNumber !== undefined) updatePayload.promptpay_number = settings.promptpayNumber;
        if (settings.promptpayName !== undefined) updatePayload.promptpay_name = settings.promptpayName;
        if (settings.lineToken !== undefined) updatePayload.line_token = settings.lineToken;

        // Handle shopSettings update (merge with existing or provided)
        if (settings.shopSettings) {
            updatePayload.shop_settings = settings.shopSettings;
        } else if (settings.welcomeMessage !== undefined || settings.notifyBooking !== undefined) {
            // If top-level fields are updated, specific merge logic might be needed, 
            // but for now let's assume the caller passes the full shopSettings object 
            // or we fetch and update if critical.
            // Simplified: only update if shopSettings is directly passed for complex objects.
        }

        const { error } = await supabase
            .from('site_settings')
            .upsert(updatePayload);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating site settings:', error);
        throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
    }
}

// ===================== HELPER FUNCTIONS =====================
export function formatTimestamp(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getTimeAgo(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
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

export function isToday(timestamp: string | undefined): boolean {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// ===================== REVIEWS =====================
export interface Review {
    id?: string;
    userName: string;
    userId?: string;
    rating: number;
    text: string;
    avatar?: string;
    createdAt: string;
}

export async function getReviews() {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        if (error) throw error;
        return data.map((r: any) => ({
            id: r.id,
            userName: r.user_name,
            userId: r.user_id,
            rating: r.rating,
            text: r.text,
            avatar: r.avatar,
            createdAt: r.created_at,
        })) as Review[];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>) {
    try {
        const { error } = await supabase.from('reviews').insert({
            user_name: review.userName,
            user_id: review.userId,
            rating: review.rating,
            text: review.text,
            avatar: review.avatar,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error adding review:', error);
        throw new Error('ไม่สามารถบันทึกรีวิวได้');
    }
}
