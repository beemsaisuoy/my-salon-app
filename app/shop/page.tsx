'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts, Product } from '@/lib/firestore';
import { useCart } from '@/components/CartProvider';

const categories = ['ทั้งหมด', 'คุกกี้', 'เค้ก', 'ขนมปัง', 'เครื่องดื่ม'];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
    const [searchQuery, setSearchQuery] = useState('');
    const { itemCount, total } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Hybrid Search Logic
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            let localMatches: Product[] = [];

            if (!searchQuery) {
                localMatches = products;
            } else {
                localMatches = products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Filter by category
            if (activeCategory !== 'ทั้งหมด') {
                localMatches = localMatches.filter(p => p.category === activeCategory);
            }

            if (searchQuery && localMatches.length === 0 && activeCategory === 'ทั้งหมด') {
                // Try Semantic Search if local search fails and no specific category is selected
                try {
                    const res = await fetch('/api/ai/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: searchQuery }),
                    });
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        setFilteredProducts(data.products);
                    } else {
                        setFilteredProducts([]);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    setFilteredProducts([]);
                }
            } else {
                setFilteredProducts(localMatches);
            }

        }, 500); // Debounce

        return () => clearTimeout(delaySearch);
    }, [searchQuery, activeCategory, products]);

    return (
        <div className="pt-16 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-light to-gold-light/50 py-12">
                <div className="container-custom">
                    <div className="text-center">
                        <span className="text-4xl">🍰</span>
                        <h1 className="font-kanit text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-2">
                            ขนมหวาน
                        </h1>
                        <p className="text-gray-600">
                            ขนมอร่อยๆ ทำสดใหม่ทุกวัน
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-md mx-auto mt-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาขนม... (เช่น 'ขนมปังนุ่มๆ')"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-4 pr-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg p-4 lg:sticky lg:top-20">
                            <h3 className="font-kanit font-semibold text-gray-800 mb-4">หมวดหมู่</h3>
                            <div className="flex flex-wrap lg:flex-col gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${activeCategory === cat
                                            ? 'bg-pink-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat === 'ทั้งหมด' && '🏷️ '}
                                        {cat === 'คุกกี้' && '🍪 '}
                                        {cat === 'เค้ก' && '🎂 '}
                                        {cat === 'ขนมปัง' && '🍞 '}
                                        {cat === 'เครื่องดื่ม' && '🥤 '}
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart Summary (Mobile) */}
                        {itemCount > 0 && (
                            <Link
                                href="/shop/cart"
                                className="lg:hidden mt-4 block bg-gradient-to-r from-pink-primary to-pink-dark text-white rounded-2xl p-4 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            🛒
                                        </div>
                                        <div>
                                            <p className="font-medium">{itemCount} รายการ</p>
                                            <p className="text-sm text-white/80">฿{total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-kanit font-semibold">ดูตะกร้า →</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="spinner" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-6xl">🔍</span>
                                <p className="text-gray-500 mt-4">ไม่พบสินค้า</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-500 mb-4">
                                    พบ {filteredProducts.length} รายการ
                                </p>
                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            id={product.id!}
                                            name={product.name}
                                            description={product.description}
                                            price={product.price}
                                            category={product.category}
                                            imageUrl={product.imageUrl}
                                            stock={product.stock}
                                            preOrderDays={product.preOrderDays}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Cart Summary (Desktop) */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-20">
                            <h3 className="font-kanit font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                🛒 ตะกร้าของคุณ
                            </h3>
                            {itemCount === 0 ? (
                                <p className="text-gray-400 text-center py-8">
                                    ยังไม่มีสินค้าในตะกร้า
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-gray-600">
                                            <span>จำนวน</span>
                                            <span>{itemCount} รายการ</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>รวม</span>
                                            <span className="text-pink-dark">฿{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Link
                                        href="/shop/cart"
                                        className="block w-full btn-primary text-center"
                                    >
                                        ไปชำระเงิน →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
