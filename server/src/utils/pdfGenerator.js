import PDFDocument from 'pdfkit';

/**
 * Generate a Delivery Challan / Invoice PDF stream
 * @param {Object} challan - Challan record with customer, items, user
 * @param {boolean} isInvoice - Whether to format as Tax Invoice or Delivery Challan
 * @returns {PDFDocument}
 */
export function generateChallanPDF(challan, isInvoice = false) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  const primaryColor = '#1e293b'; // Slate 800
  const accentColor = isInvoice ? '#0284c7' : '#059669'; // Blue for invoice, Emerald for challan
  const lightBg = '#f8fafc';
  const borderColor = '#e2e8f0';

  // 1. Header Banner
  doc.rect(40, 40, 515, 65).fill(lightBg);
  doc.rect(40, 40, 515, 65).stroke(borderColor);

  doc
    .fillColor(primaryColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('APEX DISTRIBUTORS & INDUSTRIAL SUPPLIES', 55, 52);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#64748b')
    .text('Warehouse & Distribution Center, GIDC Logistics Park, Phase II, Ahmedabad - 382445', 55, 72)
    .text('Email: operations@apexdistributors.com | Phone: +91 79 4000 8899 | GSTIN: 24AAACA1234F1Z5', 55, 85);

  // 2. Document Title
  const docTitle = isInvoice ? 'TAX INVOICE' : 'DELIVERY CHALLAN';
  doc
    .fillColor(accentColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(docTitle, 55, 120, { align: 'right' });

  // 3. Document & Customer Details Grid
  const detailsTop = 145;
  doc.rect(40, detailsTop, 250, 115).stroke(borderColor);
  doc.rect(300, detailsTop, 255, 115).stroke(borderColor);

  // Left Box: Customer Details
  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('CONSIGNEE / BILLED TO:', 50, detailsTop + 10);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(challan.customer?.businessName || 'N/A', 50, detailsTop + 25)
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#334155')
    .text(`Attn: ${challan.customer?.name || 'N/A'}`, 50, detailsTop + 40)
    .text(`Phone: ${challan.customer?.mobile || 'N/A'}`, 50, detailsTop + 53)
    .text(`GSTIN: ${challan.customer?.gstNumber || 'Unregistered'}`, 50, detailsTop + 66)
    .text(`Address: ${challan.customer?.address || 'N/A'}`, 50, detailsTop + 79, { width: 230, height: 35 });

  // Right Box: Challan / Invoice Metadata
  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DOCUMENT DETAILS:', 310, detailsTop + 10);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Document No:', 310, detailsTop + 27)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(challan.challanNumber, 410, detailsTop + 27)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Date:', 310, detailsTop + 43)
    .fillColor(primaryColor)
    .text(new Date(challan.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 410, detailsTop + 43)
    .fillColor('#475569')
    .text('Status:', 310, detailsTop + 59)
    .fillColor(challan.status === 'CONFIRMED' ? '#16a34a' : challan.status === 'DRAFT' ? '#d97706' : '#dc2626')
    .font('Helvetica-Bold')
    .text(challan.status, 410, detailsTop + 59)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Created By:', 310, detailsTop + 75)
    .fillColor(primaryColor)
    .text(challan.user?.name || 'System', 410, detailsTop + 75)
    .fillColor('#475569')
    .text('Transport/Notes:', 310, detailsTop + 91)
    .fillColor(primaryColor)
    .text(challan.notes ? challan.notes.slice(0, 30) : 'Standard Delivery', 410, detailsTop + 91);

  // 4. Line Items Table Header
  const tableTop = 275;
  doc.rect(40, tableTop, 515, 22).fill(accentColor);

  doc
    .fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('#', 48, tableTop + 6)
    .text('SKU CODE', 68, tableTop + 6)
    .text('ITEM DESCRIPTION', 160, tableTop + 6)
    .text('RATE (INR)', 350, tableTop + 6, { width: 60, align: 'right' })
    .text('QTY', 420, tableTop + 6, { width: 40, align: 'right' })
    .text('AMOUNT (INR)', 470, tableTop + 6, { width: 75, align: 'right' });

  // 5. Table Rows
  let currentY = tableTop + 24;
  const items = challan.items || [];
  let subtotal = 0;
  let totalUnits = 0;

  items.forEach((item, index) => {
    const itemAmount = Number(item.totalPrice || Number(item.unitPrice) * item.quantity);
    subtotal += itemAmount;
    totalUnits += item.quantity;

    // Alternate row background
    if (index % 2 === 1) {
      doc.rect(40, currentY - 2, 515, 20).fill(lightBg);
    }

    doc
      .fillColor(primaryColor)
      .fontSize(8.5)
      .font('Helvetica')
      .text(String(index + 1), 48, currentY + 3)
      .font('Helvetica-Bold')
      .text(item.productSku || 'SKU', 68, currentY + 3)
      .font('Helvetica')
      .text(item.productName || 'Product', 160, currentY + 3, { width: 180, height: 16 })
      .text(Number(item.unitPrice).toFixed(2), 350, currentY + 3, { width: 60, align: 'right' })
      .font('Helvetica-Bold')
      .text(String(item.quantity), 420, currentY + 3, { width: 40, align: 'right' })
      .text(itemAmount.toFixed(2), 470, currentY + 3, { width: 75, align: 'right' });

    doc.rect(40, currentY + 18, 515, 0.5).stroke(borderColor);
    currentY += 22;
  });

  // 6. Summary Totals Section
  const summaryTop = Math.max(currentY + 15, 460);
  const taxRate = 0.18; // 18% GST (9% CGST + 9% SGST)
  const gstAmount = isInvoice ? subtotal * taxRate : 0;
  const grandTotal = isInvoice ? subtotal + gstAmount : subtotal;

  doc.rect(320, summaryTop, 235, isInvoice ? 90 : 50).stroke(borderColor);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Total Dispatch Quantity:', 330, summaryTop + 8)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`${totalUnits} Units`, 470, summaryTop + 8, { width: 75, align: 'right' })
    .font('Helvetica')
    .fillColor('#475569')
    .text('Subtotal Amount:', 330, summaryTop + 24)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`INR ${subtotal.toFixed(2)}`, 450, summaryTop + 24, { width: 95, align: 'right' });

  if (isInvoice) {
    doc
      .font('Helvetica')
      .fillColor('#475569')
      .text('GST (18% Integrated):', 330, summaryTop + 40)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(`INR ${gstAmount.toFixed(2)}`, 450, summaryTop + 40, { width: 95, align: 'right' });

    doc.rect(320, summaryTop + 58, 235, 32).fill(lightBg);
    doc.rect(320, summaryTop + 58, 235, 32).stroke(borderColor);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('GRAND TOTAL:', 330, summaryTop + 68)
      .fillColor(accentColor)
      .text(`INR ${grandTotal.toFixed(2)}`, 440, summaryTop + 68, { width: 105, align: 'right' });
  }

  // 7. Terms & Signatures
  const footerTop = 640;
  doc.rect(40, footerTop, 250, 80).stroke(borderColor);
  doc.rect(305, footerTop, 250, 80).stroke(borderColor);

  doc
    .fillColor(primaryColor)
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('TERMS & CONDITIONS:', 50, footerTop + 8)
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor('#64748b')
    .text('1. Goods once sold/dispatched will not be taken back.', 50, footerTop + 22)
    .text('2. Please check product seals and quantities upon delivery.', 50, footerTop + 34)
    .text('3. Subject to Ahmedabad jurisdiction only.', 50, footerTop + 46);

  doc
    .fillColor(primaryColor)
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('FOR APEX DISTRIBUTORS', 315, footerTop + 8)
    .fontSize(7.5)
    .font('Helvetica')
    .fillColor('#64748b')
    .text('Authorized Signatory / Warehouse Supervisor', 315, footerTop + 60);

  doc.end();
  return doc;
}
