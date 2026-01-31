import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Upload image to Firebase Storage
export async function uploadImage(file: File, path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
    }
}

// Upload product image
export async function uploadProductImage(file: File, productId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const path = `products/${productId}_${Date.now()}.${extension}`;
    return uploadImage(file, path);
}

// Delete image from Firebase Storage
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1]);
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw - image might not exist
    }
}
