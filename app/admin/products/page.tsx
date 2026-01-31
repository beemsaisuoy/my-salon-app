'use client';

import { useEffect, useState } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from '@/lib/firestore';
import { checkLowStockNotification } from '@/lib/notifications';

const categories = ['คุกกี้', 'เค้ก', 'ขนมปัง', 'เครื่องดื่ม'];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        category: 'คุกกี้',
        imageUrl: '',
        inStock: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);

            // Check low stock notifications
            for (const product of data) {
                if (!product.inStock) {
                    await checkLowStockNotification(product.id!, product.name);
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: 'คุกกี้',
            imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
            inStock: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            inStock: product.inStock,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id!, formData);
                setProducts(prev =>
                    prev.map(p => (p.id === editingProduct.id ? { ...p, ...formData } : p))
                );
                showToast('แก้ไขสินค้าเรียบร้อย!');
            } else {
                const id = await addProduct(formData);
                setProducts(prev => [...prev, { id, ...formData, createdAt: {} as any }]);
                showToast('เพิ่มสินค้าเรียบร้อย!');
            }
            setIsModalOpen(false);
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            showToast('ลบสินค้าเรียบร้อย!');
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleToggleStock = async (product: Product) => {
        try {
            const newStock = !product.inStock;
            await updateProduct(product.id!, { inStock: newStock });
            setProducts(prev =>
                prev.map(p => (p.id === product.id ? { ...p, inStock: newStock } : p))
            );

            if (!newStock) {
                await checkLowStockNotification(product.id!, product.name);
            }

            showToast(newStock ? 'มีในสต็อกแล้ว' : 'หมดสต็อกแล้ว');
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = !filterCategory || p.category === filterCategory;
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-kanit text-2xl font-bold text-gray-800">🍰 จัดการสินค้า</h1>
                    <p className="text-gray-500">พบ {filteredProducts.length} รายการ</p>
                </div>
                <button onClick={openAddModal} className="btn-primary">
                    + เพิ่มสินค้า
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="🔍 ค้นหาชื่อสินค้า..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="select-field"
                    >
                        <option value="">ทุกหมวด</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>รูป</th>
                            <th>ชื่อสินค้า</th>
                            <th>หมวด</th>
                            <th>ราคา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-400">
                                    ไม่พบสินค้า
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-16 h-12 object-cover rounded-lg"
                                        />
                                    </td>
                                    <td>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                                    </td>
                                    <td>{product.category}</td>
                                    <td className="font-bold text-pink-dark">฿{product.price}</td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleStock(product)}
                                            className={`toggle ${product.inStock ? 'toggle-checked' : 'toggle-unchecked'}`}
                                        >
                                            <span className={`toggle-dot ${product.inStock ? 'toggle-dot-checked' : 'toggle-dot-unchecked'}`} />
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(product.id!)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-kanit text-xl font-bold text-gray-800">
                                {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้า'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">ชื่อสินค้า *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">คำอธิบาย</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">ราคา (บาท) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="input-field"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">หมวดหมู่ *</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={categories.includes(formData.category) ? formData.category : 'custom'}
                                            onChange={(e) => {
                                                if (e.target.value !== 'custom') {
                                                    setFormData({ ...formData, category: e.target.value })
                                                } else {
                                                    setFormData({ ...formData, category: '' })
                                                }
                                            }}
                                            className="select-field w-1/2"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="custom">+ เพิ่มเอง</option>
                                        </select>
                                        {!categories.includes(formData.category) && (
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="input-field w-1/2"
                                                placeholder="ระบุหมวดหมู่"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL รูปภาพ</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-gray-500 mt-1">ใส่ลิงก์รูปภาพจาก Google Drive หรือเว็บอื่นได้เลย</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                    className="w-5 h-5 text-pink-primary rounded"
                                />
                                <label htmlFor="inStock" className="text-gray-700">มีสินค้าในสต็อก</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 btn-outline"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 btn-primary"
                                >
                                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content p-6 max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <span className="text-5xl">⚠️</span>
                            <h2 className="font-kanit text-xl font-bold text-gray-800 mt-4 mb-2">
                                ยืนยันการลบ?
                            </h2>
                            <p className="text-gray-500 mb-6">
                                การลบสินค้านี้ไม่สามารถกู้คืนได้
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 btn-outline"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 bg-red-500 text-white font-medium py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    ลบเลย
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{toast.type === 'success' ? '✅' : '❌'}</span>
                        <p className="font-medium text-gray-800">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
