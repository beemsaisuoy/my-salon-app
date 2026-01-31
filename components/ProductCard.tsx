'use client';

import { useCart } from './CartProvider';

interface ProductCardProps {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
    preOrderDays: number;
}

export default function ProductCard({
    id,
    name,
    description,
    price,
    category,
    imageUrl,
    stock,
    preOrderDays,
}: ProductCardProps) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            productId: id,
            productName: name,
            price,
            imageUrl,
        });
    };

    const getCategoryEmoji = (cat: string) => {
        switch (cat) {
            case 'คุกกี้': return '🍪';
            case 'เค้ก': return '🎂';
            case 'ขนมปัง': return '🍞';
            case 'เครื่องดื่ม': return '🥤';
            default: return '🍰';
        }
    };

    const isPreOrder = stock <= 0 && preOrderDays > 0;
    const canBuy = stock > 0 || isPreOrder;

    return (
        <div className="card overflow-hidden group">
            {/* Image */}
            <div className="relative h-48 bg-pink-light overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!canBuy && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="badge badge-red font-kanit">หมด</span>
                    </div>
                )}
                {isPreOrder && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="badge badge-gold font-kanit">สั่งล่วงหน้า {preOrderDays} วัน</span>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                        {getCategoryEmoji(category)} {category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-kanit font-semibold text-lg text-gray-800 mb-1 line-clamp-1">
                    {name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center justify-between">
                    <span className="font-kanit font-bold text-xl text-pink-dark">
                        ฿{price.toLocaleString()}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={!canBuy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${canBuy
                            ? 'bg-pink-primary text-white hover:bg-pink-dark hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        เพิ่ม
                    </button>
                </div>
            </div>
        </div>
    );
}
