// Service types for salon
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number; // in minutes
    category: 'haircut' | 'coloring' | 'spa';
}

// Booking for salon services
export interface Booking {
    id: string;
    serviceId: string;
    serviceName: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}

// Dessert product
export interface Dessert {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'cake' | 'brownie' | 'drink' | 'pastry';
    image: string;
    available: boolean;
}

// Cart item
export interface CartItem {
    dessert: Dessert;
    quantity: number;
}

// Order for desserts
export interface Order {
    id: string;
    items: CartItem[];
    customerName: string;
    customerPhone: string;
    paymentMethod: 'cash' | 'transfer';
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    notes?: string;
}

// Context types
export interface DataContextType {
    // Services
    services: Service[];

    // Bookings
    bookings: Booking[];
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => boolean;
    cancelBooking: (id: string) => void;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    isSlotAvailable: (date: string, time: string, serviceId: string) => boolean;

    // Desserts
    desserts: Dessert[];

    // Cart
    cart: CartItem[];
    addToCart: (dessert: Dessert, quantity?: number) => void;
    removeFromCart: (dessertId: string) => void;
    updateCartQuantity: (dessertId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;

    // Orders
    orders: Order[];
    placeOrder: (customerName: string, customerPhone: string, paymentMethod: 'cash' | 'transfer', notes?: string) => boolean;
    updateOrderStatus: (id: string, status: Order['status']) => void;

    // Stats
    getTodayBookings: () => Booking[];
    getTodaySales: () => number;
}
