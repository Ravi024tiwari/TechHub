import PDFDocument from "pdfkit";


const HSN_CODE_MAP = {
  laptop: "8471",
  smartphone: "8517",
  audio: "8518",
  charger: "8504",
  wearable: "8517",
  peripheral: "8471"
};

export const COMPANY_DETAILS = {
  name: "TechHub Electronics Retail Pvt. Ltd.",
  tradeName: "TechHub Electronics",
  gstin: "07AAACT1234F1Z9",
  cin: "U72200HR2026PTC109823",
  address: "DLF Cyber City, Building 10, Tower C, DLF Phase 2",
  city: "Gurugram",
  state: "Haryana",
  pincode: "122002",
  country: "India",
  email: "billing@techhub-electronics.com",
  phone: "+91 (1800) 200-8899",
  website: "https://techhub-electronics.com"
};

/**
 * Resolve HSN code for a given item
 */
export const getHsnCode = (category) => {
  if (!category) return "8517";
  const normalized = category.toLowerCase().trim();
  return HSN_CODE_MAP[normalized] || "8517";
};

/**
 * Format currency with Indian standard (₹)
 */
const formatINR = (amount) => {
  return `INR ${(Number(amount) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Generate streaming PDF buffer using PDFKit
 * @param {Object} order - Populated Order document
 * @param {NodeJS.WritableStream} stream - Output stream (e.g. Express res)
 */

export const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: {
      Title: `Invoice-${order.orderNumber}`,
      Author: COMPANY_DETAILS.name,
      Subject: "Tax Invoice for Electronics Purchase"
    }
  });

  // Pipe directly to the output stream
  doc.pipe(stream);

  const primaryColor = "#0f172a"; // Deep navy slate
  const accentColor = "#2563eb"; // Tech blue
  const mutedColor = "#64748b"; // Slate gray
  const lightBg = "#f8fafc"; // Very light slate
  const borderColor = "#e2e8f0";

  let y = 40;

  // ========================================================
  // 1. TOP HEADER & BRANDING
  // ========================================================
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor(accentColor)
    .text(COMPANY_DETAILS.tradeName, 40, y);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor(mutedColor)
    .text("PREMIUM ELECTRONICS & COMPUTERS", 40, y + 24);

  // Invoice Title on the right
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text("TAX INVOICE", 380, y, { align: "right" });

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(mutedColor)
    .text(`ORIGINAL FOR RECIPIENT`, 380, y + 26, { align: "right" });

  y += 55;

  // Horizontal divider
  doc.strokeColor(borderColor).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
  y += 15;

  // ========================================================
  // 2. COMPANY DETAILS & INVOICE METADATA (TWO COLUMNS)
  // ========================================================
  const companyStartY = y;

  // Left Column: Seller Info
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(primaryColor).text("SOLD BY / SELLER:", 40, y);
  y += 13;
  doc.fontSize(8.5).font("Helvetica").fillColor(primaryColor).text(COMPANY_DETAILS.name, 40, y);
  y += 12;
  doc.fillColor(mutedColor).text(COMPANY_DETAILS.address, 40, y);
  y += 12;
  doc.text(`${COMPANY_DETAILS.city}, ${COMPANY_DETAILS.state} - ${COMPANY_DETAILS.pincode}`, 40, y);
  y += 12;
  doc.font("Helvetica-Bold").text(`GSTIN: `, 40, y, { continued: true }).font("Helvetica").text(COMPANY_DETAILS.gstin);
  y += 12;
  doc.font("Helvetica-Bold").text(`CIN: `, 40, y, { continued: true }).font("Helvetica").text(COMPANY_DETAILS.cin);

  // Right Column: Invoice & Order Metadata
  let rightY = companyStartY;
  const rightX = 330;

  const invoiceNumber = `INV-${order.orderNumber}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const drawMetaRow = (label, value, boldValue = false) => {
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(mutedColor).text(label, rightX, rightY, { width: 100 });
    doc
      .font(boldValue ? "Helvetica-Bold" : "Helvetica")
      .fillColor(primaryColor)
      .text(value, rightX + 90, rightY, { width: 135, align: "right" });
    rightY += 14;
  };

  drawMetaRow("Invoice No:", invoiceNumber, true);
  drawMetaRow("Invoice Date:", orderDate);
  drawMetaRow("Order ID:", order.orderNumber, true);
  drawMetaRow("Payment Method:", order.paymentInfo?.method || "ONLINE");
  drawMetaRow("Payment Status:", order.paymentInfo?.status || "PAID", true);
  if (order.paymentInfo?.razorpayPaymentId) {
    drawMetaRow("Transaction ID:", order.paymentInfo.razorpayPaymentId);
  }

  y = Math.max(y, rightY) + 10;

  // Box background for Customer Address
  doc.rect(40, y, 515, 62).fill(lightBg).stroke(borderColor);

  const ship = order.shippingAddress || {};
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(accentColor).text("BILL TO & SHIP TO (CUSTOMER):", 50, y + 8);

  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text(ship.fullName || "Customer", 50, y + 22);

  const addressLine = [ship.street, ship.landmark, ship.city, `${ship.state} - ${ship.pincode}`]
    .filter(Boolean)
    .join(", ");

  doc.font("Helvetica").fillColor(mutedColor).text(addressLine, 50, y + 34, { width: 495 });
  doc.text(`Contact: ${ship.phone || "N/A"} | State Code: 07`, 50, y + 46);

  y += 75;

  // ========================================================
  // 3. PURCHASED ITEMS TABLE HEADER
  // ========================================================
  const tableTop = y;
  const colX = {
    sn: 45,
    desc: 75,
    hsn: 275,
    qty: 325,
    price: 370,
    taxable: 440,
    total: 500
  };

  doc.rect(40, tableTop, 515, 20).fill("#f1f5f9").stroke(borderColor);

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text("#", colX.sn, tableTop + 6)
    .text("ITEM DESCRIPTION & SPECS", colX.desc, tableTop + 6)
    .text("HSN", colX.hsn, tableTop + 6)
    .text("QTY", colX.qty, tableTop + 6, { align: "center", width: 30 })
    .text("UNIT PRICE", colX.price, tableTop + 6, { align: "right", width: 60 })
    .text("TOTAL", colX.total, tableTop + 6, { align: "right", width: 50 });

  y = tableTop + 24;

  // ========================================================
  // 4. ITEMS TABLE ROWS
  // ========================================================
  const items = order.orderItems || [];

  items.forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    const hsn = getHsnCode(item.product?.category);

    // Subtle row stripe
    if (index % 2 === 1) {
      doc.rect(40, y - 4, 515, 24).fill("#fafafa");
    }

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text(String(index + 1), colX.sn, y)
      .font("Helvetica-Bold")
      .text(item.title, colX.desc, y, { width: 190, ellipsis: true })
      .font("Helvetica")
      .fillColor(mutedColor)
      .text(hsn, colX.hsn, y)
      .fillColor(primaryColor)
      .text(String(item.quantity), colX.qty, y, { align: "center", width: 30 })
      .text(formatINR(item.price).replace("INR ", ""), colX.price, y, { align: "right", width: 60 })
      .font("Helvetica-Bold")
      .text(formatINR(itemTotal).replace("INR ", ""), colX.total, y, { align: "right", width: 50 });

    // Print specs if available
    const specs = item.selectedSpecs || {};
    const specsArr = [specs.color, specs.storage, specs.ram].filter(Boolean);
    if (specsArr.length > 0) {
      y += 10;
      doc.fontSize(7).font("Helvetica").fillColor(mutedColor).text(`Variant: ${specsArr.join(" | ")}`, colX.desc, y);
    }

    y += 16;
    doc.strokeColor("#f1f5f9").lineWidth(0.5).moveTo(40, y - 3).lineTo(555, y - 3).stroke();
  });

  y += 8;

  // ========================================================
  // 5. FINANCIAL TAX BREAKDOWN SUMMARY
  // ========================================================
  const summaryStartX = 340;
  const summaryWidth = 215;

  const pricing = order.pricing || {};
  const itemsTotal = pricing.itemsTotal || 0;
  const discount = pricing.discountAmount || 0;
  const shipping = pricing.shippingFee || 0;
  const grandTotal = pricing.grandTotal || 0;

  // Calculate 18% GST (9% CGST + 9% SGST)
  const taxableBase = Math.max(0, itemsTotal - discount);
  const cgstAmount = Math.round((taxableBase * 0.09) * 100) / 100;
  const sgstAmount = Math.round((taxableBase * 0.09) * 100) / 100;

  const drawSummaryRow = (label, val, isGrandTotal = false) => {
    doc
      .fontSize(isGrandTotal ? 10 : 8.5)
      .font(isGrandTotal ? "Helvetica-Bold" : "Helvetica")
      .fillColor(isGrandTotal ? primaryColor : mutedColor)
      .text(label, summaryStartX, y);

    doc
      .font("Helvetica-Bold")
      .fillColor(isGrandTotal ? accentColor : primaryColor)
      .text(val, summaryStartX, y, { width: summaryWidth, align: "right" });

    y += isGrandTotal ? 18 : 14;
  };

  doc.strokeColor(borderColor).lineWidth(1).moveTo(summaryStartX, y).lineTo(555, y).stroke();
  y += 8;

  drawSummaryRow("Items Subtotal:", formatINR(itemsTotal));
  if (discount > 0) {
    drawSummaryRow(`Discount (${order.coupon?.code || "PROMO"}):`, `- ${formatINR(discount)}`);
  }
  drawSummaryRow("CGST (9.0%):", formatINR(cgstAmount));
  drawSummaryRow("SGST (9.0%):", formatINR(sgstAmount));
  drawSummaryRow("Shipping & Handling:", shipping === 0 ? "FREE" : formatINR(shipping));

  // Grand Total highlighted line
  doc.rect(summaryStartX - 8, y - 2, summaryWidth + 16, 22).fill("#eff6ff").stroke("#bfdbfe");
  drawSummaryRow("GRAND TOTAL (INC. TAX):", formatINR(grandTotal), true);

  y += 20;

  // ========================================================
  // 6. DECLARATION, TERMS & SIGNATURE
  // ========================================================
  const bottomY = Math.max(y + 10, 710);

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text("DECLARATION & WARRANTY TERMS:", 40, bottomY);

  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor(mutedColor)
    .text(
      "1. All electronic goods sold are genuine manufacturer products covered by standard 1-year brand warranty.\n" +
      "2. Goods once delivered are eligible for 7-day replacement for manufacturing defects per store policy.\n" +
      "3. This is a computer generated invoice issued under Section 31 of CGST Act, 2017. No physical signature required.",
      40,
      bottomY + 12,
      { width: 330, lineGap: 2 }
    );

  // Authorized Signatory Box on the right
  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text(`For ${COMPANY_DETAILS.tradeName}`, 400, bottomY + 15, { align: "center", width: 150 });

  doc
    .fontSize(7)
    .font("Helvetica")
    .fillColor(mutedColor)
    .text("[AUTHORIZED SIGNATORY]", 400, bottomY + 50, { align: "center", width: 150 });

  // Finalize PDF stream
  doc.end();
};
