const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // OR SRV KEY if needed
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

async function backfill() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    if (products.length === 0) {
        console.log('No products found. Seeding sample data...');
        const samples = [
            { name: 'Thai Tea Cake', description: 'เค้กชาไทยหน้านิ่ม หวานน้อย หอมชาไทยแท้', category: 'เค้ก', price: 85, stock: 10, pre_order_days: 0 },
            { name: 'Almond Croissant', description: 'ครัวซองต์เนยฝรั่งเศส สอดไส้ครีมอัลมอนด์', category: 'ขนมปัง', price: 120, stock: 5, pre_order_days: 0 },
            { name: 'Matcha Latte', description: 'มัทฉะลาเต้เย็น ใช้ผงมัทฉะพรีเมียมจากญี่ปุ่น', category: 'เครื่องดื่ม', price: 90, stock: 15, pre_order_days: 0 }
        ];

        for (const s of samples) {
            const text = `${s.name} ${s.description} ${s.category}`;
            const result = await model.embedContent(text);
            const embedding = result.embedding.values;

            const { error } = await supabase.from('products').insert({
                ...s,
                embedding,
                image_url: `https://picsum.photos/seed/${s.name.replace(' ', '')}/400/300`
            });

            if (error) console.error('Error adding sample:', error);
            else console.log(`Added sample: ${s.name}`);
        }
        return;
    }

    console.log(`Found ${products.length} products. Processing...`);

    for (const p of products) {
        if (p.embedding) {
            console.log(`Skipping ${p.name} (already has embedding)`);
            continue;
        }
        // ... rest of the loop


        console.log(`Generating embedding for: ${p.name}`);
        const text = `${p.name} ${p.description || ''} ${p.category || ''}`;

        try {
            const result = await model.embedContent(text);
            const embedding = result.embedding.values;

            const { error: updateError } = await supabase
                .from('products')
                .update({ embedding })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Failed to update ${p.name}:`, updateError);
            } else {
                console.log(`Updated ${p.name}`);
            }
        } catch (err) {
            console.error(`Failed generation for ${p.name}:`, err);
        }

        // Rate limit helper
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('Done!');
}

backfill();
