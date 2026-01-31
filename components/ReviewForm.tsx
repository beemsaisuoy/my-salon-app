'use client';

import { useState } from 'react';
import { addReview } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';

interface ReviewFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ onSuccess, onCancel }: ReviewFormProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [name, setName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !name.trim()) return;

        setIsSubmitting(true);
        try {
            await addReview({
                userName: name,
                userId: user?.id,
                rating,
                text,
                avatar: user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการส่งรีวิว');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
                <h3 className="font-kanit text-xl font-bold text-gray-800 mb-4 text-center">
                    ✍️ เขียนรีวิว
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-4xl transition-transform hover:scale-110 ${star <= rating ? 'text-gold-primary' : 'text-gray-200'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    {/* Name (if not logged in) */}
                    {!user && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">ชื่อของคุณ</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field w-full mt-1"
                                placeholder="ระบุชื่อ..."
                                required
                            />
                        </div>
                    )}

                    {/* Review Text */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">ความรู้สึกที่มีต่อร้าน</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="input-field w-full mt-1"
                            rows={4}
                            placeholder="บริการเป็นอย่างไร ขนมอร่อยไหม?..."
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 btn-outline py-2.5"
                            disabled={isSubmitting}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-2.5"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
