import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for PDF.js - Using CDN for better compatibility on static hosts
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Clean and normalize text to improve AI analysis.
 * Handles common OCR/PDF artifacts, whitespace issues, and formatting inconsistencies.
 */
export const preprocessText = (text: string): string => {
  if (!text) return "";

  let cleaned = text;

  // 1. Normalize line breaks and whitespace
  // Replace multiple spaces/tabs with a single space
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  // Replace multiple newlines with a double newline (paragraph break)
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');

  // 2. Fix hyphenated words at line breaks (common in PDFs)
  // e.g., "responsi-\n ble" -> "responsible"
  // Logic: Lowercase letter + hyphen + newline + lowercase letter
  cleaned = cleaned.replace(/([a-z])-\n\s*([a-z])/g, '$1$2');

  // 3. Standardize bullet points
  // Replace various dot/bullet characters with a standard dash
  cleaned = cleaned.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '- ');

  // 4. Remove null bytes and non-printable control characters (keeping newlines)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 5. Fix common email obfuscation or spacing issues (simple heuristic)
  // e.g., "email @ domain . com" -> "email@domain.com"
  cleaned = cleaned.replace(/\s+@\s+/g, '@').replace(/\s+\.\s+(com|org|net|edu)/g, '.$1');

  return cleaned.trim();
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Sort items by vertical position to handle multi-column layouts better
    // Note: detailed layout analysis is complex, this is a basic heuristic
    const strings = textContent.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n\n';
  }

  return preprocessText(fullText);
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return preprocessText(result.value);
};

export const processFile = async (file: File): Promise<string> => {
  const type = file.type;
  
  if (type === 'application/pdf') {
    return extractTextFromPdf(file);
  } else if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    file.name.endsWith('.docx')
  ) {
    return extractTextFromDocx(file);
  } else if (type === 'text/plain' || type === 'text/markdown') {
    const text = await file.text();
    return preprocessText(text);
  } else {
    throw new Error('Formato no soportado. Por favor usa PDF, DOCX o TXT.');
  }
};
