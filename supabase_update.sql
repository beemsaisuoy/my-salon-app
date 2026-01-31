-- 1. Updates to 'products' table for Stock Management
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pre_order_days INTEGER DEFAULT 3;

-- Optional: Update existing products to have some stock (e.g., 10) so they aren't all "Pre-order" immediately
UPDATE products SET stock = 10 WHERE stock = 0;

-- 2. Create 'site_settings' table
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY CHECK (id = 'shop_settings'), -- Enforce singleton row
    promptpay_number TEXT,
    promptpay_name TEXT,
    line_token TEXT,
    shop_settings JSONB DEFAULT '{}'::jsonb, -- Store flexible settings like pre_order_days override if needed
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. RLS Policies for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings (needed for PromptPay number in Checkout)
CREATE POLICY "Allow public read access" 
ON site_settings FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow only authenticated users (admins) to update settings
CREATE POLICY "Allow authenticated update" 
ON site_settings FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Insert default settings row if not exists
INSERT INTO site_settings (id, promptpay_number, promptpay_name, line_token)
VALUES ('shop_settings', '0812345678', 'Salon & Sweets Shop', '')
ON CONFLICT (id) DO NOTHING;
