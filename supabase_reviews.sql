-- ============================================
-- SQL Migration: Reviews Table + Auth Callback Support
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create reviews table for customer reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access to reviews (everyone can see reviews)
CREATE POLICY "Allow public read reviews" 
ON reviews FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Allow authenticated users to insert reviews
CREATE POLICY "Allow authenticated insert reviews" 
ON reviews FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. Insert some sample reviews (optional - remove if you want blank slate)
INSERT INTO reviews (user_name, rating, text, avatar) VALUES
('คุณแพร', 5, 'บริการดีมาก ทำผมสวยมากค่ะ ขนมก็อร่อย จะกลับมาอีกแน่นอน! 💕', '🌸'),
('คุณเมย์', 5, 'ช่างทำผมมือดีมาก ตัดผมได้ตรงใจ รอได้ไม่นาน บรรยากาศร้านน่ารักค่ะ', '💇‍♀️'),
('คุณนุ่น', 4, 'ขนมอร่อยมากๆ โดยเฉพาะเค้กชีสเบิร์น หอมนุ่มมาก จะสั่งอีกค่ะ!', '🍰')
ON CONFLICT DO NOTHING;

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
