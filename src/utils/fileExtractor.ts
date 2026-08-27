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
      const text = result.value.trim();
      if (!text) {
        throw new Error("No readable text found in the Word document.");
      }
      return {
        fileName,
        fileType: "Word (.docx)",
        fileSize,
        extractedText: text,
      };
    }

    // 2. PDF Document handling
    if (extension === "pdf" || fileType === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += (pageNum > 1 ? "\n\n" : "") + pageText;
      }

      fullText = fullText.trim();
      if (!fullText) {
        throw new Error("The PDF appears to be a scanned image without selectable text.");
      }

      return {
        fileName,
        fileType: "PDF Document",
        fileSize,
        extractedText: fullText,
      };
    }

    // 3. Plain text files (.txt, .md, .rtf, .csv)
    const text = await file.text();
    return {
      fileName,
      fileType: extension.toUpperCase() || "Text",
      fileSize,
      extractedText: text.trim(),
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
