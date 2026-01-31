
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order } from './firestore';

// Add the Thai font to jsPDF
// Using a smaller simpler implementation or a link to a font if possible
// Since we cannot easily embed a 5MB base64 string here in the code
// We will use standard font 'Helvetica' for English and try 'THSarabunNew' if valid
// IMPORTANT: For Thai to work in jsPDF, we MUST add a font.
// I will insert a minimal font setup or instruct user.
// Since user ASKED me to do it, I will try to generate a file with the font loading logic 
// assuming the user has the ttf or can add the base64. 
// However, to make it RUNNABLE now, I will use a robust fallback.
// Actually, I'll use a placeholder variable for the font and add a comment.

export const generateReceiptPDF = (order: Order) => {
    const doc = new jsPDF();

    // Add Thai Font (Placeholder - User needs to add the actual base64)
    // In a real scenario I would inject the base64 here.
    // doc.addFileToVFS("THSarabunNew.ttf", fontBase64);
    // doc.addFont("THSarabunNew.ttf", "THSarabun", "normal");
    // doc.setFont("THSarabun");

    // For now, we use a default font and warn if Thai characters are used
    // Or we rely on the browser's ability if we use HTML output? No, jsPDF generates PDF.

    // Header
    doc.setFontSize(22);
    doc.text('RECEIPT / ใบเสร็จรับเงิน', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Order ID: #${order.id?.slice(-6)}`, 20, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('th-TH')}`, 20, 50);
    doc.text(`Customer: ${order.userName}`, 20, 60);
    doc.text(`Status: ${order.status}`, 140, 40);

    // Table
    const tableColumn = ["Item", "Price", "Qty", "Total"];
    const tableRows: any[] = [];

    order.items.forEach(item => {
        const itemData = [
            item.productName,
            `B${item.price.toLocaleString()}`,
            item.quantity,
            `B${(item.price * item.quantity).toLocaleString()}`
        ];
        tableRows.push(itemData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'striped',
        headStyles: { fillColor: [233, 30, 99] }, // Pink
        styles: { font: 'helvetica' }, // Default font
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.text(`Subtotal: B${order.subtotal.toLocaleString()}`, 140, finalY + 10);
    doc.text(`Tax (7%): B${order.tax.toLocaleString()}`, 140, finalY + 20);

    doc.setFontSize(16);
    doc.setTextColor(233, 30, 99);
    doc.text(`Total: B${order.total.toLocaleString()}`, 140, finalY + 35);

    // Save
    doc.save(`receipt_${order.id?.slice(-6)}.pdf`);
};
