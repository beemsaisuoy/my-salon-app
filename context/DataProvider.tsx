'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service, Booking, Dessert, CartItem, Order, DataContextType } from '@/types';

// Initial dummy services
const initialServices: Service[] = [
    {
        id: 'srv-1',
        name: 'Classic Haircut',
        description: 'A stylish haircut tailored to your preferences',
        price: 35,
        duration: 45,
        category: 'haircut'
    },
    {
        id: 'srv-2',
        name: 'Hair Coloring',
        description: 'Full hair coloring with premium products',
        price: 85,
        duration: 120,
        category: 'coloring'
    },
    {
        id: 'srv-3',
        name: 'Highlights',
        description: 'Beautiful highlights to brighten your look',
        price: 75,
        duration: 90,
        category: 'coloring'
    },
    {
        id: 'srv-4',
        name: 'Relaxing Spa Treatment',
        description: 'Full body relaxation with aromatherapy',
        price: 120,
        duration: 90,
        category: 'spa'
    },
    {
        id: 'srv-5',
        name: 'Facial Treatment',
        description: 'Deep cleansing facial with premium skincare',
        price: 65,
        duration: 60,
        category: 'spa'
    },
    {
        id: 'srv-6',
        name: 'Hair & Scalp Massage',
        description: 'Rejuvenating scalp massage for relaxation',
        price: 45,
        duration: 30,
        category: 'spa'
    }
];

// Initial dummy desserts
const initialDesserts: Dessert[] = [
    {
        id: 'des-1',
        name: 'Strawberry Dream Cake',
        description: 'Light sponge cake with fresh strawberries and cream',
        price: 42,
        category: 'cake',
        image: '/images/strawberry-cake.jpg',
        available: true
    },
    {
        id: 'des-2',
        name: 'Chocolate Fudge Brownie',
        description: 'Rich, decadent brownie with chocolate chips',
        price: 18,
        category: 'brownie',
        image: '/images/brownie.jpg',
        available: true
    },
    {
        id: 'des-3',
        name: 'Rose Latte',
        description: 'Creamy latte infused with rose essence',
        price: 28,
        category: 'drink',
        image: '/images/rose-latte.jpg',
        available: true
    },
    {
        id: 'des-4',
        name: 'Matcha Cheesecake',
        description: 'Japanese-style cheesecake with matcha swirl',
        price: 38,
        category: 'cake',
        image: '/images/matcha-cheesecake.jpg',
        available: true
    },
    {
        id: 'des-5',
        name: 'Salted Caramel Brownie',
        description: 'Gooey brownie topped with salted caramel drizzle',
        price: 22,
        category: 'brownie',
        image: '/images/caramel-brownie.jpg',
        available: true
    },
    {
        id: 'des-6',
        name: 'Lavender Honey Drink',
        description: 'Soothing lavender tea with local honey',
        price: 24,
        category: 'drink',
        image: '/images/lavender-drink.jpg',
        available: true
    },
    {
        id: 'des-7',
        name: 'Tiramisu Cup',
        description: 'Classic Italian tiramisu in a personal serving',
        price: 32,
        category: 'pastry',
        image: '/images/tiramisu.jpg',
        available: true
    },
    {
        id: 'des-8',
        name: 'Berry Tart',
        description: 'Buttery tart filled with mixed berries and custard',
        price: 36,
        category: 'pastry',
        image: '/images/berry-tart.jpg',
        available: true
    }
];

// Initial dummy bookings
const initialBookings: Booking[] = [
    {
        id: 'book-1',
        serviceId: 'srv-1',
        serviceName: 'Classic Haircut',
        customerName: 'Sarah Johnson',
        customerPhone: '555-0101',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'book-2',
        serviceId: 'srv-4',
        serviceName: 'Relaxing Spa Treatment',
        customerName: 'Emily Chen',
        customerPhone: '555-0102',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        status: 'pending',
        createdAt: new Date().toISOString()
    }
];

// Initial dummy orders
const initialOrders: Order[] = [
    {
        id: 'ord-1',
        items: [
            { dessert: initialDesserts[0], quantity: 1 },
            { dessert: initialDesserts[2], quantity: 2 }
        ],
        customerName: 'Michael Brown',
        customerPhone: '555-0201',
        paymentMethod: 'cash',
        totalAmount: 98,
        status: 'completed',
        createdAt: new Date().toISOString()
    }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [services] = useState<Service[]>(initialServices);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [desserts] = useState<Dessert[]>(initialDesserts);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBookings = localStorage.getItem('salon_bookings');
            const savedOrders = localStorage.getItem('salon_orders');
            const savedCart = localStorage.getItem('salon_cart');

            if (savedBookings) {
                try {
                    setBookings(JSON.parse(savedBookings));
                } catch (e) {
                    console.error('Failed to parse bookings', e);
                }
            }

            if (savedOrders) {
                try {
                    setOrders(JSON.parse(savedOrders));
                } catch (e) {
                    console.error('Failed to parse orders', e);
                }
            }

            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }

            setIsHydrated(true);
        }
    }, []);

    // Save to localStorage on changes
    useEffect(() => {
        if (isHydrated && typeof window !== 'undefined') {
            localStorage.setItem('salon_bookings', JSON.stringify(bookings));
        }
    }, [bookings, isHydrated]);

    useEffect(() => {
        if (isHydrated && typeof window !== 'undefined') {
            localStorage.setItem('salon_orders', JSON.stringify(orders));
        }
    }, [orders, isHydrated]);

    useEffect(() => {
        if (isHydrated && typeof window !== 'undefined') {
            localStorage.setItem('salon_cart', JSON.stringify(cart));
        }
    }, [cart, isHydrated]);

    // Check if a slot is available
    const isSlotAvailable = (date: string, time: string, serviceId: string): boolean => {
        return !bookings.some(
            booking =>
                booking.date === date &&
                booking.time === time &&
                booking.status !== 'cancelled'
        );
    };

    // Add a new booking
    const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): boolean => {
        if (!isSlotAvailable(bookingData.date, bookingData.time, bookingData.serviceId)) {
            return false;
        }

        const newBooking: Booking = {
            ...bookingData,
            id: `book-${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        setBookings(prev => [...prev, newBooking]);
        return true;
    };

    // Cancel a booking
    const cancelBooking = (id: string) => {
        setBookings(prev =>
            prev.map(booking =>
                booking.id === id ? { ...booking, status: 'cancelled' as const } : booking
            )
        );
    };

    // Update booking status
    const updateBookingStatus = (id: string, status: Booking['status']) => {
        setBookings(prev =>
            prev.map(booking =>
                booking.id === id ? { ...booking, status } : booking
            )
        );
    };

    // Add to cart
    const addToCart = (dessert: Dessert, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.dessert.id === dessert.id);
            if (existing) {
                return prev.map(item =>
                    item.dessert.id === dessert.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { dessert, quantity }];
        });
    };

    // Remove from cart
    const removeFromCart = (dessertId: string) => {
        setCart(prev => prev.filter(item => item.dessert.id !== dessertId));
    };

    // Update cart quantity
    const updateCartQuantity = (dessertId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(dessertId);
            return;
        }
        setCart(prev =>
            prev.map(item =>
                item.dessert.id === dessertId ? { ...item, quantity } : item
            )
        );
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // Calculate cart total
    const cartTotal = cart.reduce(
        (sum, item) => sum + item.dessert.price * item.quantity,
        0
    );

    // Calculate cart item count
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Place order
    const placeOrder = (
        customerName: string,
        customerPhone: string,
        paymentMethod: 'cash' | 'transfer',
        notes?: string
    ): boolean => {
        if (cart.length === 0) return false;

        const newOrder: Order = {
            id: `ord-${Date.now()}`,
            items: [...cart],
            customerName,
            customerPhone,
            paymentMethod,
            totalAmount: cartTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
            notes
        };

        setOrders(prev => [...prev, newOrder]);
        clearCart();
        return true;
    };

    // Update order status
    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === id ? { ...order, status } : order
            )
        );
    };

    // Get today's bookings
    const getTodayBookings = (): Booking[] => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(
            booking => booking.date === today && booking.status !== 'cancelled'
        );
    };

    // Get today's sales
    const getTodaySales = (): number => {
        const today = new Date().toISOString().split('T')[0];
        return orders
            .filter(order =>
                order.createdAt.startsWith(today) &&
                order.status !== 'cancelled'
            )
            .reduce((sum, order) => sum + order.totalAmount, 0);
    };

    const value: DataContextType = {
        services,
        bookings,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        isSlotAvailable,
        desserts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        orders,
        placeOrder,
        updateOrderStatus,
        getTodayBookings,
        getTodaySales
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
