import { supabase } from './supabase';

// Upload image to Supabase Storage
export async function uploadImage(file: File, path: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from('products')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
    }
}

// Upload product image
export async function uploadProductImage(file: File, productId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const path = `${productId}_${Date.now()}.${extension}`;
    return uploadImage(file, path);
}

// Delete image from Supabase Storage
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];

        if (fileName) {
            const { error } = await supabase.storage
                .from('products')
                .remove([fileName]);

            if (error) {
                console.error('Delete error:', error);
            }
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw - image might not exist
    }
}
