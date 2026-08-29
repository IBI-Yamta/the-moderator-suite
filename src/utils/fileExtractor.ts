import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker if available or use standard CDN/inline
if (typeof window !== "undefined") {
  try {
    // Set worker source for pdfjs-dist
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
  } catch (e) {
    console.warn("Could not set PDF worker URL:", e);
  }
}

export interface ExtractedFileResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  error?: string;
}

/**
 * Reconstructs lines and paragraphs from PDF.js text items with precise coordinate sorting.
 * This prevents entire PDF pages from collapsing into a single unbroken line.
 */
function extractLinesFromPdfItems(items: any[]): string {
  if (!items || items.length === 0) return "";

  const validItems = items.filter((it) => it && typeof it.str === "string" && it.str.length > 0);
  if (validItems.length === 0) return "";

  // Extract items with position metadata
  const itemsWithPos = validItems.map((it) => {
    const transform = Array.isArray(it.transform) ? it.transform : [1, 0, 0, 1, 0, 0];
    const x = transform[4] || 0;
    const y = transform[5] || 0;
    const width = typeof it.width === "number" ? it.width : 0;
    return {
      str: it.str,
      x,
      y,
      width,
      hasEOL: !!it.hasEOL,
    };
  });

  // In PDF coordinates, Y = 0 is bottom of page, so higher Y is higher up on page.
  // Sort primarily by Y descending (top to bottom), within 3.5pt tolerance sort by X ascending (left to right)
  itemsWithPos.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3.5) {
      return yDiff; // top-to-bottom
    }
    return a.x - b.x; // left-to-right
  });

  const lines: string[] = [];
  let currentLine = "";
  let lastY = itemsWithPos[0]?.y ?? 0;
  let lastX = 0;
  let lastWidth = 0;

  for (const it of itemsWithPos) {
    const isNewLine = Math.abs(it.y - lastY) > 3.5 || it.hasEOL;
    const isParagraphGap = (lastY - it.y) > 13.0; // Noticeable gap between question items

    if (isNewLine) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      if (isParagraphGap && lines.length > 0) {
        lines.push(""); // blank line to separate paragraphs / questions
      }
      currentLine = it.str;
    } else {
      // Same horizontal line: insert space if gap exists between items
      const gap = it.x - (lastX + lastWidth);
      if (currentLine && !currentLine.endsWith(" ") && !it.str.startsWith(" ") && (gap > 2 || gap < -20)) {
        currentLine += " " + it.str;
      } else {
        currentLine += it.str;
      }
    }
    lastY = it.y;
    lastX = it.x;
    lastWidth = it.width;
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
}

/**
 * Extracts raw textual content from DOCX, PDF, or Plain Text files.
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const fileType = file.type || "";
  const fileSize = file.size;
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  try {
    // 1. DOCX / Word Document handling
    if (
      extension === "docx" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      let text = (result.value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      
      if (!text) {
        throw new Error("No readable text found in the Word document. If it is password protected or contains only scanned images, please paste text directly.");
      }

      return {
        fileName,
        fileType: "Word (.docx)",
        fileSize,
        extractedText: text,
      };
    }

    // 2. PDF Document handling with coordinate-based layout preservation
    if (extension === "pdf" || fileType === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = extractLinesFromPdfItems(textContent.items);
        
        if (pageText.trim()) {
          fullText += (fullText ? "\n\n" : "") + pageText;
        }
      }

      fullText = fullText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      if (!fullText) {
        throw new Error("The PDF appears to be a scanned image without selectable text. Use the 'Scan Question Paper (Photo/OCR)' feature to transcribe photographed or scanned papers.");
      }

      return {
        fileName,
        fileType: "PDF Document",
        fileSize,
        extractedText: fullText,
      };
    }

    // 3. Plain text files (.txt, .md, .rtf, .csv)
    const rawText = await file.text();
    const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    return {
      fileName,
      fileType: extension.toUpperCase() || "Text",
      fileSize,
      extractedText: text,
    };
  } catch (err: any) {
    console.error("Error extracting text from file:", err);
    return {
      fileName,
      fileType: extension.toUpperCase(),
      fileSize,
      extractedText: "",
      error: err?.message || "Failed to parse file content. Please paste raw text instead.",
    };
  }
}

