'use client';

import { useEffect, useState } from 'react';
import { getOrders, Order, formatTimestamp } from '@/lib/firestore';

interface Customer {
    userId: string;
    userName: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date | null;
    orders: Order[];
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'totalSpent' | 'totalOrders' | 'lastOrder'>('totalSpent');
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const orders = await getOrders();

            // Group by userId
            const customerMap: Record<string, Customer> = {};

            orders.forEach(order => {
                if (!customerMap[order.userId]) {
                    customerMap[order.userId] = {
                        userId: order.userId,
                        userName: order.userName,
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrderDate: null,
                        orders: [],
                    };
                }

                customerMap[order.userId].totalOrders++;
                customerMap[order.userId].totalSpent += order.total;
                customerMap[order.userId].orders.push(order);

                const orderDate = order.createdAt?.toDate();
                if (orderDate && (!customerMap[order.userId].lastOrderDate || orderDate > customerMap[order.userId].lastOrderDate!)) {
                    customerMap[order.userId].lastOrderDate = orderDate;
                }
            });

            setCustomers(Object.values(customerMap));
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortedCustomers = [...customers]
        .filter(c => !searchQuery || c.userName.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
            if (sortBy === 'totalOrders') return b.totalOrders - a.totalOrders;
            if (sortBy === 'lastOrder') {
                const dateA = a.lastOrderDate?.getTime() || 0;
                const dateB = b.lastOrderDate?.getTime() || 0;
                return dateB - dateA;
            }
            return 0;
        });

    const getCustomerBadge = (totalOrders: number) => {
        if (totalOrders >= 5) return { text: 'VIP', class: 'badge-purple' };
        if (totalOrders >= 3) return { text: 'ลูกค้าประจำ', class: 'badge-green' };
        return { text: 'ลูกค้าใหม่', class: 'badge-blue' };
    };

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
                <h1 className="font-kanit text-2xl font-bold text-gray-800">👥 ลูกค้า</h1>
                <p className="text-gray-500">พบ {sortedCustomers.length} ลูกค้า</p>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="🔍 ค้นหาชื่อลูกค้า..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="select-field"
                    >
                        <option value="totalSpent">เรียงตาม: ยอดรวม</option>
                        <option value="totalOrders">เรียงตาม: จำนวนสั่ง</option>
                        <option value="lastOrder">เรียงตาม: วันที่ล่าสุด</option>
                    </select>
                </div>
            </div>

            {/* Customers List */}
            <div className="space-y-4">
                {sortedCustomers.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        ไม่พบลูกค้า
                    </div>
                ) : (
                    sortedCustomers.map((customer) => {
                        const badge = getCustomerBadge(customer.totalOrders);
                        return (
                            <div key={customer.userId} className="card overflow-hidden">
                                {/* Customer Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedCustomer(expandedCustomer === customer.userId ? null : customer.userId)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-pink-light rounded-full flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">{customer.userName}</p>
                                                    <span className={`badge ${badge.class} text-xs`}>
                                                        {badge.text}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {customer.totalOrders} คำสั่งซื้อ
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">ยอดรวม</p>
                                                <p className="font-bold text-pink-dark">฿{customer.totalSpent.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm text-gray-500">สั่งล่าสุด</p>
                                                <p className="text-sm text-gray-700">
                                                    {customer.lastOrderDate?.toLocaleDateString('th-TH', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`transform transition-transform ${expandedCustomer === customer.userId ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded: Order History */}
                                {expandedCustomer === customer.userId && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
                                        <h4 className="font-medium text-gray-700 mb-3">📋 ประวัติการสั่งซื้อ</h4>
                                        <div className="space-y-3">
                                            {customer.orders.map((order) => (
                                                <div key={order.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">#{order.id?.slice(-6)}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatTimestamp(order.createdAt)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {order.items.length} รายการ
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-pink-dark">฿{order.total.toLocaleString()}</p>
                                                        <span className={`badge text-xs ${order.status === 'รับแล้ว' ? 'badge-green' :
                                                                order.status === 'ยกเลิก' ? 'badge-red' : 'badge-yellow'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
