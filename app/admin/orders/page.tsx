'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order, formatTimestamp, deductOrderStock, getTodayString, isToday } from '@/lib/firestore';
import { checkPendingOrderNotification } from '@/lib/notifications';

const statusFlow = ['รอเตรียม', 'เตรียมเสร็จ', 'รอรับ', 'รับแล้ว'];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY'
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'PREORDER'
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น "${newStatus}"?`)) return;

        try {
            await updateOrderStatus(id, newStatus as Order['status']);

            // Auto-deduct stock if Paid
            if (newStatus === 'Paid') {
                try {
                    await deductOrderStock(id);
                    showToast('ตัดสต็อกเรียบร้อย ✅');
                } catch (e) {
                    console.error('Stock deduction failed:', e);
                    showToast('เปลี่ยนสถานะแล้ว แต่ตัดสต็อกไม่สำเร็จ (อาจหมดหรือตัดไปแล้ว)', 'error');
                }
            }

            setOrders(prev =>
                prev.map(o => (o.id === id ? { ...o, status: newStatus as any } : o))
            );
            showToast('อัพเดทสถานะเรียบร้อย!');
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการอัพเดท', 'error');
        }
    };

    const exportToExcel = () => {
        import('xlsx').then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(filteredOrders.map(o => ({
                ID: o.id,
                Date: new Date(o.createdAt).toLocaleString('th-TH'),
                Customer: o.userName,
                Items: o.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
                Total: o.total,
                Status: o.status,
                Payment: o.paymentMethod
            })));
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Orders");
            xlsx.writeFile(workbook, `orders_export_${getTodayString()}.xlsx`);
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': case 'รอชำระ': return 'bg-yellow-100 text-yellow-800';
            case 'Paid': case 'ชำระแล้ว': return 'bg-green-100 text-green-800';
            case 'Shipping': case 'กำลังส่ง': return 'bg-blue-100 text-blue-800';
            case 'Completed': case 'สำเร็จ': return 'bg-purple-100 text-purple-800';
            case 'Cancelled': case 'ยกเลิก': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
        const matchDate = dateFilter === 'ALL' || (dateFilter === 'TODAY' && isToday(o.createdAt));
        const matchType = typeFilter === 'ALL' || (typeFilter === 'PREORDER' && o.items.some(i => false)); // TODO: Add pre-order flag to items if needed, currently approximating
        return matchStatus && matchDate && matchType;
    });

    const dailyTotal = filteredOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' && o.status !== 'ยกเลิก' ? o.total : 0), 0);

    if (loading) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="space-y-6 container mx-auto px-4 py-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📦 จัดการคำสั่งซื้อ (Orders)</h1>
                    <p className="text-gray-500">จัดการสถานะและตรวจสอบยอดขาย</p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <p className="text-sm text-gray-500">ยอดขาย (ตามตัวกรอง)</p>
                    <p className="text-3xl font-bold text-pink-600">฿{dailyTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{filteredOrders.length} รายการ</p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border items-center">
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-300"
                >
                    <option value="ALL">ทุกสถานะ</option>
                    <option value="Pending">รอชำระ (Pending)</option>
                    <option value="Paid">ชำระแล้ว (Paid)</option>
                    <option value="Shipping">กำลังส่ง (Shipping)</option>
                    <option value="Completed">สำเร็จ (Completed)</option>
                    <option value="Cancelled">ยกเลิก (Cancelled)</option>
                </select>

                <button
                    onClick={() => setDateFilter(dateFilter === 'ALL' ? 'TODAY' : 'ALL')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${dateFilter === 'TODAY' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'hover:bg-gray-50'}`}
                >
                    {dateFilter === 'TODAY' ? '📅 วันนี้' : '📅 ทั้งหมด'}
                </button>

                <div className="flex-grow" />

                <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    📑 Export Excel
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
                        ไม่พบข้อมูลคำสั่งซื้อ
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                                {/* Order Info */}
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono font-bold text-gray-700">#{order.id?.slice(-6)}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatTimestamp(order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>👤 {order.userName}</span>
                                        <span>•</span>
                                        <span>Items: {order.items.length}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end mr-4">
                                        <span className="font-bold text-lg">฿{order.total.toLocaleString()}</span>
                                        <span className="text-xs text-gray-500">{order.paymentMethod}</span>
                                    </div>

                                    {/* Status Control */}
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id!, e.target.value)}
                                        className="text-sm border rounded-lg px-2 py-1 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Shipping">Shipping</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>

                                    {/* Print */}
                                    <button
                                        onClick={() => import('@/lib/pdf').then(mod => mod.generateReceiptPDF(order))}
                                        className="p-2 text-gray-500 hover:text-pink-600 border rounded-lg hover:bg-pink-50"
                                        title="พิมพ์ใบเสร็จ"
                                    >
                                        🖨️
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Details (Simple version for now, always showing summary in row) */}
                        </div>
                    ))
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-fade-in`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
