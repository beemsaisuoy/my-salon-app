'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order, formatTimestamp } from '@/lib/firestore';
import { checkPendingOrderNotification } from '@/lib/notifications';

const statusFlow = ['รอเตรียม', 'เตรียมเสร็จ', 'รอรับ', 'รับแล้ว'];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);

            // Check for pending orders > 1 hour
            for (const order of data) {
                if (order.status === 'รอเตรียม' && order.createdAt) {
                    await checkPendingOrderNotification(order.id!, order.createdAt);
                }
            }
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

    const handleStatusChange = async (id: string, status: Order['status']) => {
        try {
            await updateOrderStatus(id, status);
            setOrders(prev =>
                prev.map(o => (o.id === id ? { ...o, status } : o))
            );
            showToast('อัพเดทสถานะเรียบร้อย!');
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        }
    };

    const getNextStatus = (currentStatus: string): Order['status'] | null => {
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
        return statusFlow[currentIndex + 1] as Order['status'];
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'รอเตรียม': return 'badge-yellow';
            case 'เตรียมเสร็จ': return 'badge-orange';
            case 'รอรับ': return 'badge-blue';
            case 'รับแล้ว': return 'badge-green';
            case 'ยกเลิก': return 'badge-red';
            default: return 'badge-yellow';
        }
    };

    const filteredOrders = orders.filter(o => {
        return !filterStatus || o.status === filterStatus;
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
            <div>
                <h1 className="font-kanit text-2xl font-bold text-gray-800">📦 จัดการคำสั่งซื้อ</h1>
                <p className="text-gray-500">พบ {filteredOrders.length} รายการ</p>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select-field max-w-xs"
                >
                    <option value="">ทุกสถานะ</option>
                    {statusFlow.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                    <option value="ยกเลิก">ยกเลิก</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        ไม่พบคำสั่งซื้อ
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="card overflow-hidden">
                            {/* Order Header */}
                            <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id!)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-medium text-gray-800">#{order.id?.slice(-6)}</p>
                                            <p className="text-sm text-gray-500">{order.userName}</p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-pink-dark">฿{order.total.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{order.items.length} รายการ</p>
                                        </div>
                                        <span className={`transform transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {formatTimestamp(order.createdAt)}
                                </p>
                            </div>

                            {/* Expanded Content */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
                                    {/* Items */}
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">รายการสินค้า:</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {item.quantity}x {item.productName}
                                                    </span>
                                                    <span className="text-gray-800">
                                                        ฿{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>รวมก่อนภาษี</span>
                                            <span>฿{order.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>ภาษี 7%</span>
                                            <span>฿{order.tax.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mt-2">
                                            <span>รวมทั้งหมด</span>
                                            <span className="text-pink-dark">฿{order.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-white rounded-lg p-3 mb-4">
                                        <p className="text-sm text-gray-500">ลูกค้า</p>
                                        <p className="font-medium">{order.userName}</p>
                                        <p className="text-sm text-gray-500">{order.userEmail}</p>
                                        <p className="text-sm text-gray-500 mt-2">💵 {order.paymentMethod}</p>
                                    </div>

                                    {/* Actions */}
                                    {order.status !== 'รับแล้ว' && order.status !== 'ยกเลิก' && (
                                        <div className="flex gap-2">
                                            {getNextStatus(order.status) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(order.id!, getNextStatus(order.status)!);
                                                    }}
                                                    className="flex-1 btn-primary py-2"
                                                >
                                                    → {getNextStatus(order.status)}
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange(order.id!, 'ยกเลิก');
                                                }}
                                                className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-medium hover:bg-red-200 transition-colors"
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

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
