'use client';

import { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, Booking, getTodayString, formatTimestamp } from '@/lib/firestore';
import { checkBookingTodayNotification } from '@/lib/notifications';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getBookings();
            setBookings(data);

            // Check booking today notification
            const todayBookings = data.filter(b => b.date === getTodayString()).length;
            if (todayBookings > 0) {
                await checkBookingTodayNotification(todayBookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStatusChange = async (id: string, status: Booking['status']) => {
        try {
            await updateBookingStatus(id, status);
            setBookings(prev =>
                prev.map(b => (b.id === id ? { ...b, status } : b))
            );
            showToast('อัพเดทสถานะเรียบร้อย!');
        } catch (error) {
            showToast('เกิดข้อผิดพลาด', 'error');
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesDate = !filterDate || b.date === filterDate;
        const matchesStatus = !filterStatus || b.status === filterStatus;
        const matchesSearch = !searchQuery ||
            b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.customerPhone.includes(searchQuery);
        return matchesDate && matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'รอยืนยัน': return 'badge-yellow';
            case 'ยืนยัน': return 'badge-green';
            case 'เสร็จ': return 'badge-blue';
            case 'ยกเลิก': return 'badge-red';
            default: return 'badge-yellow';
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
                <h1 className="font-kanit text-2xl font-bold text-gray-800">💇 จัดการจอง</h1>
                <p className="text-gray-500">พบ {filteredBookings.length} รายการ</p>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="grid sm:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="🔍 ค้นหาชื่อ/เบอร์โทร..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="input-field"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="select-field"
                    >
                        <option value="">ทุกสถานะ</option>
                        <option value="รอยืนยัน">รอยืนยัน</option>
                        <option value="ยืนยัน">ยืนยัน</option>
                        <option value="เสร็จ">เสร็จ</option>
                        <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ชื่อลูกค้า</th>
                            <th>เบอร์โทร</th>
                            <th>บริการ</th>
                            <th>วันที่</th>
                            <th>เวลา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-400">
                                    ไม่พบรายการจอง
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <p className="font-medium text-gray-800">{booking.customerName}</p>
                                        <p className="text-xs text-gray-400">{booking.customerEmail}</p>
                                    </td>
                                    <td>{booking.customerPhone}</td>
                                    <td>
                                        <p>{booking.service}</p>
                                        <p className="text-xs text-pink-dark font-medium">฿{booking.servicePrice}</p>
                                    </td>
                                    <td>
                                        {new Date(booking.date).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td>{booking.time}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {booking.status === 'รอยืนยัน' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id!, 'ยืนยัน')}
                                                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                    >
                                                        ยืนยัน
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id!, 'ยกเลิก')}
                                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'ยืนยัน' && (
                                                <button
                                                    onClick={() => handleStatusChange(booking.id!, 'เสร็จ')}
                                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    เสร็จแล้ว
                                                </button>
                                            )}
                                            {(booking.status === 'เสร็จ' || booking.status === 'ยกเลิก') && (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
