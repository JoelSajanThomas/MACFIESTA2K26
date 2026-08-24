import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export const generateQRCodeDataUrl = async (registration: any, event: any, user: any) => {
  const passCode = registration.entryPass || "MF-2K26-PASS";
  const eventTitle = event?.title || "MacFiesta Event";
  const eventCategory = event?.category ? event.category.toUpperCase() : "GENERAL";
  const eventDate = event?.date || "Festival Day";
  const eventTime = event?.time || "Reporting Time";
  const eventVenue = event?.venue || "MACFAST Campus";
  const userName = user?.name || "Participant";
  const userEmail = user?.email || "N/A";
  const userCollege = user?.college || "MACFAST Tiruvalla";

  const qrText = `MACFIESTA 2K26 OFFICIAL ENTRY TICKET
------------------------------------
Pass Code: ${passCode}
Participant: ${userName}
Email: ${userEmail}
College: ${userCollege}
Event: ${eventTitle} (${eventCategory})
Date & Time: ${eventDate} @ ${eventTime}
Venue: ${eventVenue}
Payment Status: VERIFIED & PAID
Organized By: MACFAST Tiruvalla
Verification Link: https://macfiesta.macfast.org/verify/${passCode}
------------------------------------`;

  try {
    return await QRCode.toDataURL(qrText, {
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    return registration.qrCode || "";
  }
};

export const downloadEventTicketPDF = async (registration: any, event: any, user: any) => {
  try {
    // Generate high-quality QR code data URL containing all event and participant details
    const qrDataUrl = await generateQRCodeDataUrl(registration, event, user);

    // Create A5 Landscape Ticket PDF (210mm x 148mm)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a5"
    });

    const width = 210;
    const height = 148;

    // Background - Dark Festival Slate (#0B0F19)
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, width, height, "F");

    // Top Neon Glow Line (Gold)
    doc.setFillColor(234, 179, 8);
    doc.rect(0, 0, width, 4, "F");

    // Outer double border
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(1);
    doc.rect(6, 8, width - 12, height - 14);

    doc.setDrawColor(6, 182, 212); // Cyan accent
    doc.setLineWidth(0.3);
    doc.rect(8, 10, width - 16, height - 18);

    // Header Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MACFIESTA 2K26", 15, 22);

    doc.setFontSize(8);
    doc.setTextColor(234, 179, 8);
    doc.text("MACFAST TIRUVALLA • OFFICIAL EVENT ENTRY PASS", 15, 27);

    // Pass ID Badge Top Right
    const passCode = registration.entryPass || "MF-2K26-TICKET";
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(width - 70, 16, 55, 12, 2, 2, "F");
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(0.5);
    doc.roundedRect(width - 70, 16, 55, 12, 2, 2, "D");

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(6);
    doc.text("PASS CODE", width - 42.5, 20, { align: "center" });

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(passCode, width - 42.5, 25, { align: "center" });

    // Divider Line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(15, 32, width - 15, 32);

    // LEFT SECTION: EVENT & PARTICIPANT DETAILS
    // ----------------------------------------
    doc.setTextColor(6, 182, 212); // Cyan
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("EVENT DETAILS", 15, 40);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    const eventTitle = event?.title || "Festival Event";
    doc.text(eventTitle, 15, 47);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Category: ${event?.category ? event.category.toUpperCase() : "GENERAL"}`, 15, 53);

    // Event Info Grid
    doc.setFillColor(18, 24, 38);
    doc.roundedRect(15, 58, 120, 24, 2, 2, "F");

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.text("DATE & TIME:", 19, 64);
    doc.text("VENUE:", 19, 71);
    doc.text("PRIZE POOL:", 19, 78);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${event?.date || "25 Sep 2026"} @ ${event?.time || "09:00 AM"}`, 45, 64);
    doc.text(event?.venue || "MACFAST Main Campus", 45, 71);
    doc.setTextColor(234, 179, 8);
    doc.text(`Rs. ${(event?.prizePool || 0).toLocaleString("en-IN")}`, 45, 78);

    // Participant Details Box
    doc.setTextColor(236, 72, 153); // Pink accent
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PARTICIPANT DELEGATE", 15, 90);

    doc.setFillColor(18, 24, 38);
    doc.roundedRect(15, 94, 120, 32, 2, 2, "F");

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("NAME:", 19, 100);
    doc.text("EMAIL:", 19, 107);
    doc.text("COLLEGE:", 19, 114);
    doc.text("STATUS:", 19, 121);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(user?.name || "Registered Delegate", 45, 100);
    doc.text(user?.email || "N/A", 45, 107);
    doc.text(user?.college || "MACFAST Tiruvalla", 45, 114);

    doc.setTextColor(34, 197, 94); // Green
    doc.text("CONFIRMED & VERIFIED", 45, 121);

    // RIGHT SECTION: QR CODE & SCAN INSTRUCTIONS
    // ----------------------------------------
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(144, 40, 52, 52, 3, 3, "F");

    // Embed QR image
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 146, 42, 48, 48);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ENTRY VERIFICATION QR", 170, 98, { align: "center" });

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text("Scan with any camera or scanner app", 170, 103, { align: "center" });
    doc.text("to inspect complete registration details.", 170, 107, { align: "center" });

    // Green Verification Badge
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(144, 112, 52, 14, 2, 2, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("SECURE VERIFIED PASS", 170, 118, { align: "center" });

    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text("MACFAST Control Desk 2K26", 170, 123, { align: "center" });

    // FOOTER NOTICE
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.1);
    doc.line(15, 133, width - 15, 133);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(5.5);
    doc.text("NOTICE: Please carry this digital or printed pass along with your official College ID card to gain venue entry.", 15, 138);

    doc.text("MACFIESTA 2K26 • MACFAST Tiruvalla", width - 15, 138, { align: "right" });

    // Trigger Browser Download
    const fileName = `MacFiesta_Ticket_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${passCode}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    alert("Failed to generate ticket PDF. Please try again.");
  }
};
