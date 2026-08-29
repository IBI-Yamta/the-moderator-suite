import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportExamToPDF(
  elementId: string,
  filename: string = "Exam_Paper.pdf",
  orientation: "portrait" | "landscape" = "portrait"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const isLandscape = orientation === "landscape";
  // A4 portrait: 210mm = 794px @ 96dpi; A4 landscape: 297mm = 1123px @ 96dpi
  const targetPxWidth = isLandscape ? "1123px" : "794px";
  const numWidth = isLandscape ? 1123 : 794;

  // Create an off-screen clone with exact standard A4 width
  // This guarantees perfect 2-column rendering and prevents mobile screen clipping or zoom distortion
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = targetPxWidth;
  clone.style.minWidth = targetPxWidth;
  clone.style.maxWidth = targetPxWidth;
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.backgroundColor = "#ffffff";
  clone.style.zIndex = "-9999";
  clone.style.boxSizing = "border-box";
  clone.classList.remove("shadow-2xl");

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // High resolution (300dpi equivalent)
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: numWidth,
      windowWidth: numWidth,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    
    // Standard A4 dimensions: 210 x 297 (portrait) or 297 x 210 (landscape)
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 (portrait) or 297 (landscape)
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 (portrait) or 210 (landscape)
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;

    // Subsequent pages if multiple pages needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}

export function printExamPaper(): void {
  window.print();
}

/**
 * Exports an Answer Key document or custom examiner element to a standalone high-resolution A4 PDF.
 */
export async function exportAnswerKeyToPDF(
  elementId: string,
  filename: string = "Answer_Key.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const targetPxWidth = "794px"; // Standard A4 Portrait width at 96dpi
  const numWidth = 794;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = targetPxWidth;
  clone.style.minWidth = targetPxWidth;
  clone.style.maxWidth = targetPxWidth;
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.backgroundColor = "#ffffff";
  clone.style.zIndex = "-9999";
  clone.style.boxSizing = "border-box";
  clone.classList.remove("shadow-2xl");

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: numWidth,
      windowWidth: numWidth,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}
