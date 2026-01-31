'use client';

import React, { useState } from 'react';
import {
    ShoppingBag,
    X,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    User,
    Phone,
    FileText,
    CheckCircle,
    ShoppingCart
} from 'lucide-react';
import { useData } from '@/context/DataProvider';

export default function FloatingCart() {
    const { cart, cartTotal, cartItemCount, updateCartQuantity, removeFromCart, clearCart, placeOrder } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [isCheckout, setIsCheckout] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        paymentMethod: 'cash' as 'cash' | 'transfer',
        notes: ''
    });

    const handlePlaceOrder = () => {
        if (!checkoutForm.name.trim() || !checkoutForm.phone.trim()) {
            return;
        }

        const success = placeOrder(
            checkoutForm.name,
            checkoutForm.phone,
            checkoutForm.paymentMethod,
            checkoutForm.notes
        );

        if (success) {
            setOrderPlaced(true);
            setTimeout(() => {
                setOrderPlaced(false);
                setIsCheckout(false);
                setIsOpen(false);
                setCheckoutForm({
                    name: '',
                    phone: '',
                    paymentMethod: 'cash',
                    notes: ''
                });
            }, 3000);
        }
    };

    if (cartItemCount === 0 && !isOpen) {
        return null;
    }

    return (
        <>
            {/* Floating Cart Button */}
            {!isOpen && cartItemCount > 0 && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-brown-600 to-brown-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                    <div className="relative">
                        <ShoppingBag className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    </div>
                </button>
            )}

            {/* Cart Sidebar */}
            <div
                className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-brown-900/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => {
                        if (!isCheckout) setIsOpen(false);
                    }}
                />

                {/* Cart Panel */}
                <div
                    className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-cream-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-gradient-to-br from-brown-600 to-brown-700">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-semibold text-brown-800">
                                        {isCheckout ? 'Checkout' : 'Your Cart'}
                                    </h2>
                                    <p className="text-xs text-brown-500">
                                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (isCheckout) {
                                        setIsCheckout(false);
                                    } else {
                                        setIsOpen(false);
                                    }
                                }}
                                className="p-2 rounded-full hover:bg-primary-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-brown-600" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {orderPlaced ? (
                            /* Order Success */
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-display font-semibold text-brown-800 mb-2">
                                    Order Placed!
                                </h3>
                                <p className="text-brown-500">
                                    Thank you for your order. We'll prepare it with love!
                                </p>
                            </div>
                        ) : isCheckout ? (
                            /* Checkout Form */
                            <div className="p-4 space-y-4">
                                {/* Order Summary */}
                                <div className="p-4 rounded-xl bg-cream-50 space-y-2">
                                    <h4 className="font-medium text-brown-700 text-sm">Order Summary</h4>
                                    {cart.map((item) => (
                                        <div key={item.dessert.id} className="flex justify-between text-sm">
                                            <span className="text-brown-600">
                                                {item.quantity}x {item.dessert.name}
                                            </span>
                                            <span className="font-medium text-brown-800">
                                                ${(item.dessert.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <hr className="border-brown-200" />
                                    <div className="flex justify-between font-semibold">
                                        <span className="text-brown-700">Total</span>
                                        <span className="text-primary-600">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-1">
                                            <User className="w-4 h-4" />
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={checkoutForm.name}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                            placeholder="Your name"
                                            className="input-field text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-1">
                                            <Phone className="w-4 h-4" />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={checkoutForm.phone}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                            placeholder="Your phone number"
                                            className="input-field text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-2">
                                            <CreditCard className="w-4 h-4" />
                                            Payment Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'cash' })}
                                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${checkoutForm.paymentMethod === 'cash'
                                                        ? 'border-primary-400 bg-primary-50'
                                                        : 'border-primary-100 hover:border-primary-200'
                                                    }`}
                                            >
                                                <Banknote className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-brown-700">Cash</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'transfer' })}
                                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${checkoutForm.paymentMethod === 'transfer'
                                                        ? 'border-primary-400 bg-primary-50'
                                                        : 'border-primary-100 hover:border-primary-200'
                                                    }`}
                                            >
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-medium text-brown-700">Transfer</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-1">
                                            <FileText className="w-4 h-4" />
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={checkoutForm.notes}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                                            placeholder="Any special requests..."
                                            rows={2}
                                            className="input-field text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Cart Items */
                            <div className="p-4 space-y-3">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-12 h-12 text-brown-200 mx-auto mb-3" />
                                        <p className="text-brown-400">Your cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div
                                            key={item.dessert.id}
                                            className="p-3 rounded-xl bg-cream-50 flex gap-3"
                                        >
                                            {/* Image Placeholder */}
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
                                                {item.dessert.category === 'cake' ? '🎂' :
                                                    item.dessert.category === 'brownie' ? '🍫' :
                                                        item.dessert.category === 'drink' ? '🥤' : '🥧'}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-brown-800 text-sm truncate">
                                                    {item.dessert.name}
                                                </h4>
                                                <p className="text-primary-600 font-semibold text-sm">
                                                    ${item.dessert.price}
                                                </p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => updateCartQuantity(item.dessert.id, item.quantity - 1)}
                                                            className="w-7 h-7 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-primary-50 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3 text-brown-600" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-brown-800 text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateCartQuantity(item.dessert.id, item.quantity + 1)}
                                                            className="w-7 h-7 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-primary-50 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3 text-brown-600" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.dessert.id)}
                                                        className="p-1.5 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && !orderPlaced && (
                        <div className="p-4 border-t border-primary-100 bg-white">
                            {!isCheckout && (
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-brown-600 font-medium">Total</span>
                                    <span className="text-2xl font-bold text-brown-800">
                                        ${cartTotal.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2">
                                {isCheckout ? (
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={!checkoutForm.name.trim() || !checkoutForm.phone.trim()}
                                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Place Order - ${cartTotal.toFixed(2)}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsCheckout(true)}
                                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg transition-all"
                                        >
                                            Proceed to Checkout
                                        </button>
                                        <button
                                            onClick={clearCart}
                                            className="w-full py-2 text-sm text-brown-400 hover:text-red-500 transition-colors"
                                        >
                                            Clear Cart
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
