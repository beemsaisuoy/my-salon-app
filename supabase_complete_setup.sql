-- ============================================
-- SQL Migration: Complete Database Setup
-- Run this in Supabase SQL Editor BEFORE using the app
-- This creates all required tables for the salon app
-- ============================================

-- ==========================================
-- 1. PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'ขนมหวาน',
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    pre_order_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read products" ON products FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users can manage (for admin)
CREATE POLICY "Allow authenticated manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 2. ORDERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'รอเตรียม',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT TO authenticated 
USING (user_id = auth.uid()::text OR user_email = auth.email());

-- Authenticated users can insert orders
CREATE POLICY "Authenticated can insert orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);

-- Admin can manage all orders (using service role or specific check)
CREATE POLICY "Authenticated can update orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 3. BOOKINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service TEXT NOT NULL,
    service_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'รอยืนยัน',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can insert bookings (for guest booking)
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated users can read all bookings (for admin)
CREATE POLICY "Authenticated can read bookings" ON bookings FOR SELECT TO authenticated USING (true);

-- Authenticated users can update bookings (for admin)
CREATE POLICY "Authenticated can update bookings" ON bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage notifications
CREATE POLICY "Authenticated can manage notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 5. REVIEWS TABLE  
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read reviews
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated can insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);

-- ==========================================
-- 6. SITE SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY CHECK (id = 'shop_settings'),
    promptpay_number TEXT,
    promptpay_name TEXT,
    line_token TEXT,
    line_channel_secret TEXT,
    line_channel_access_token TEXT,
    shop_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users can update settings
CREATE POLICY "Authenticated can update settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Insert default settings row
INSERT INTO site_settings (id, promptpay_number, promptpay_name, line_token)
VALUES ('shop_settings', '0812345678', 'Salon & Sweets Shop', '')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ==========================================
-- 8. SAMPLE DATA (Optional - can delete)
-- ==========================================

-- Insert sample reviews  
INSERT INTO reviews (user_name, rating, text, avatar) VALUES
('คุณแพร', 5, 'บริการดีมาก ทำผมสวยมากค่ะ ขนมก็อร่อย จะกลับมาอีกแน่นอน! 💕', '🌸'),
('คุณเมย์', 5, 'ช่างทำผมมือดีมาก ตัดผมได้ตรงใจ รอได้ไม่นาน บรรยากาศร้านน่ารักค่ะ', '💇‍♀️'),
('คุณนุ่น', 4, 'ขนมอร่อยมากๆ โดยเฉพาะเค้กชีสเบิร์น หอมนุ่มมาก จะสั่งอีกค่ะ!', '🍰')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category, stock, pre_order_days) VALUES
('เค้กช็อกโกแลต', 'เค้กช็อกโกแลตเข้มข้น หอมมัน อร่อยสุดๆ 🍫', 120, 'ขนมหวาน', 10, 3),
('ชีสเค้กสตรอเบอรี่', 'ชีสเค้กเนื้อนุ่มละมุน ท็อปด้วยสตรอเบอรี่สด 🍓', 150, 'ขนมหวาน', 8, 3),
('มัทฉะลาเต้', 'มัทฉะเกรดพรีเมียมจากญี่ปุ่น หอมนุ่มลิ้น 🍵', 80, 'เครื่องดื่ม', 20, 0),
('อเมริกาโน่', 'กาแฟคั่วเข้ม หอมกรุ่น เริ่มต้นวันดีๆ ☕', 60, 'เครื่องดื่ม', 30, 0)
ON CONFLICT DO NOTHING;

-- ==========================================
-- DONE! Your database is ready 🎉
-- ==========================================
