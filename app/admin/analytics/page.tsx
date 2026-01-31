'use client';

import { useEffect, useState } from 'react';
import { getOrders, getBookings, Order, Booking } from '@/lib/firestore';
import RevenueChart from '@/components/charts/RevenueChart';
import BookingChart from '@/components/charts/BookingChart';
import ProductSalesChart from '@/components/charts/ProductSalesChart';
import CustomerGrowthChart from '@/components/charts/CustomerGrowthChart';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<7 | 30>(7);

    // Stats
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [revenueChange, setRevenueChange] = useState(0);
    const [topProduct, setTopProduct] = useState('');
    const [topCustomer, setTopCustomer] = useState({ name: '', amount: 0 });

    // Chart data
    const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
    const [bookingData, setBookingData] = useState<{ label: string; value: number }[]>([]);
    const [productSalesData, setProductSalesData] = useState<{ label: string; value: number; color: string }[]>([]);
    const [customerGrowthData, setCustomerGrowthData] = useState<{ label: string; newCustomers: number; returningCustomers: number }[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [orders, bookings] = await Promise.all([
                getOrders(),
                getBookings(),
            ]);

            // Calculate monthly revenue
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
            const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

            const thisMonthRevenue = orders.filter(o => {
                const d = o.createdAt?.toDate();
                return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            }).reduce((sum, o) => sum + o.total, 0);

            const lastMonthRevenue = orders.filter(o => {
                const d = o.createdAt?.toDate();
                return d && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            }).reduce((sum, o) => sum + o.total, 0);

            setMonthlyRevenue(thisMonthRevenue);
            const change = lastMonthRevenue > 0
                ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 0;
            setRevenueChange(Math.round(change));

            // Revenue data
            const revenuePoints = [];
            for (let i = timeRange - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate().toISOString().split('T')[0];
                    return orderDate === dateStr;
                });
                const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
                revenuePoints.push({
                    label: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                    value: revenue,
                });
            }
            setRevenueData(revenuePoints);

            // Booking data (last 7 days)
            const bookingPoints = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayBookings = bookings.filter(b => b.date === dateStr).length;
                bookingPoints.push({
                    label: date.toLocaleDateString('th-TH', { weekday: 'short' }),
                    value: dayBookings,
                });
            }
            setBookingData(bookingPoints);

            // Product sales (from orders)
            const productCounts: Record<string, number> = {};
            orders.forEach(order => {
                order.items.forEach(item => {
                    productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
                });
            });

            const sortedProducts = Object.entries(productCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

            const colors = ['#F9A8D4', '#F59E0B', '#60A5FA', '#34D399', '#A78BFA', '#FB923C'];
            setProductSalesData(sortedProducts.map(([name, count], i) => ({
                label: name,
                value: count,
                color: colors[i % colors.length],
            })));

            // Top product
            if (sortedProducts.length > 0) {
                setTopProduct(sortedProducts[0][0]);
            }

            // Top customer
            const customerTotals: Record<string, { name: string; amount: number }> = {};
            orders.forEach(order => {
                if (!customerTotals[order.userId]) {
                    customerTotals[order.userId] = { name: order.userName, amount: 0 };
                }
                customerTotals[order.userId].amount += order.total;
            });

            const sortedCustomers = Object.values(customerTotals).sort((a, b) => b.amount - a.amount);
            if (sortedCustomers.length > 0) {
                setTopCustomer(sortedCustomers[0]);
            }

            // Customer growth (new vs returning)
            const customerFirstOrder: Record<string, Date> = {};
            orders.forEach(order => {
                const orderDate = order.createdAt?.toDate();
                if (orderDate) {
                    if (!customerFirstOrder[order.userId] || orderDate < customerFirstOrder[order.userId]) {
                        customerFirstOrder[order.userId] = orderDate;
                    }
                }
            });

            const growthPoints = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const dayOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate().toISOString().split('T')[0];
                    return orderDate === dateStr;
                });

                let newCustomers = 0;
                let returningCustomers = 0;

                dayOrders.forEach(order => {
                    const firstOrderDate = customerFirstOrder[order.userId]?.toISOString().split('T')[0];
                    if (firstOrderDate === dateStr) {
                        newCustomers++;
                    } else {
                        returningCustomers++;
                    }
                });

                growthPoints.push({
                    label: date.toLocaleDateString('th-TH', { day: 'numeric' }),
                    newCustomers,
                    returningCustomers,
                });
            }
            setCustomerGrowthData(growthPoints);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
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
                <h1 className="font-kanit text-2xl font-bold text-gray-800">📈 วิเคราะห์ข้อมูล</h1>
                <p className="text-gray-500">สถิติและกราฟข้อมูลของร้าน</p>
            </div>

            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">💰 รายได้เดือนนี้</p>
                    <p className="text-2xl font-bold text-gray-800">฿{monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">📈 เทียบเดือนที่แล้ว</p>
                    <p className={`text-2xl font-bold ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                    </p>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">🏆 สินค้าขายดีสุด</p>
                    <p className="text-lg font-bold text-gray-800 truncate">{topProduct || '-'}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">👑 ลูกค้าจ่ายมากสุด</p>
                    <p className="text-lg font-bold text-gray-800 truncate">{topCustomer.name || '-'}</p>
                    {topCustomer.amount > 0 && (
                        <p className="text-sm text-gold-primary">฿{topCustomer.amount.toLocaleString()}</p>
                    )}
                </div>
            </div>

            {/* Time Range Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTimeRange(7)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === 7 ? 'bg-pink-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    7 วัน
                </button>
                <button
                    onClick={() => setTimeRange(30)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === 30 ? 'bg-pink-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    30 วัน
                </button>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueData} height={280} />
                <BookingChart data={bookingData} height={280} />
                <ProductSalesChart data={productSalesData} size={180} />
                <CustomerGrowthChart data={customerGrowthData} height={280} />
            </div>
        </div>
    );
}
