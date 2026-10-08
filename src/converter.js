/**
 * SlamDoc Converter Engine
 * High-performance, pure client-side document cross-conversion:
 * - PDF -> DOCX (Word)
 * - DOCX (Word) -> PDF
 * - PDF -> Images (PNG)
 * - Images (JPG/PNG) -> PDF
 * - PDF -> TXT / Markdown
 * - DOCX -> TXT / HTML / Markdown
 * - TXT / MD -> DOCX & PDF
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

// Configure pdf.js worker safely
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  console.warn('Worker URL resolution failed, using fallback', e);
}

export const SUPPORTED_TARGETS = {
  pdf: [
    { id: 'docx', label: 'Word Document (.docx)', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: 'file-text' },
    { id: 'txt', label: 'Plain Text (.txt)', ext: 'txt', mime: 'text/plain', icon: 'align-left' },
    { id: 'png', label: 'High-Res Image (.png)', ext: 'png', mime: 'image/png', icon: 'image' },
  ],
  docx: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'txt', label: 'Plain Text (.txt)', ext: 'txt', mime: 'text/plain', icon: 'align-left' },
    { id: 'html', label: 'Web Page (.html)', ext: 'html', mime: 'text/html', icon: 'code' },
    { id: 'md', label: 'Markdown (.md)', ext: 'md', mime: 'text/markdown', icon: 'hash' },
  ],
  doc: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'txt', label: 'Plain Text (.txt)', ext: 'txt', mime: 'text/plain', icon: 'align-left' },
  ],
  txt: [
    { id: 'docx', label: 'Word Document (.docx)', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: 'file-text' },
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
  ],
  md: [
    { id: 'docx', label: 'Word Document (.docx)', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: 'file-text' },
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
  ],
  jpg: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'png', label: 'PNG Image (.png)', ext: 'png', mime: 'image/png', icon: 'image' },
  ],
  jpeg: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'png', label: 'PNG Image (.png)', ext: 'png', mime: 'image/png', icon: 'image' },
  ],
  png: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'jpg', label: 'JPEG Image (.jpg)', ext: 'jpg', mime: 'image/jpeg', icon: 'image' },
  ],
  webp: [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf', icon: 'file' },
    { id: 'png', label: 'PNG Image (.png)', ext: 'png', mime: 'image/png', icon: 'image' },
  ]
};

export function getFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['docx', 'doc'].includes(ext)) return 'docx';
  if (['txt', 'md'].includes(ext)) return 'txt';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  return 'other';
}

export function getDefaultTarget(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'docx';
  if (ext === 'docx' || ext === 'doc') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'pdf';
  if (ext === 'txt' || ext === 'md') return 'docx';
  return 'pdf';
}

export function getAvailableTargets(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return SUPPORTED_TARGETS[ext] || [
    { id: 'pdf', label: 'PDF Document (.pdf)', ext: 'pdf', mime: 'application/pdf' },
    { id: 'docx', label: 'Word Document (.docx)', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  ];
}

/**
 * Main Conversion Pipeline
 */
export async function convertDocument(file, targetFormat, onProgress = () => {}) {
  const ext = file.name.split('.').pop().toLowerCase();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  onProgress(10, 'Reading file buffer...');

  const arrayBuffer = await file.arrayBuffer();
  let resultBlob = null;
  let outputFilename = `${baseName}.${targetFormat}`;
  let mimeType = 'application/octet-stream';

  // 1. PDF conversions
  if (ext === 'pdf') {
    if (targetFormat === 'docx') {
      resultBlob = await convertPdfToDocx(arrayBuffer, onProgress);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (targetFormat === 'txt') {
      resultBlob = await convertPdfToText(arrayBuffer, onProgress);
      mimeType = 'text/plain';
    } else if (targetFormat === 'png') {
      resultBlob = await convertPdfToPng(arrayBuffer, onProgress);
      mimeType = 'image/png';
    }
  }

  // 2. DOCX conversions
  else if (ext === 'docx') {
    if (targetFormat === 'pdf') {
      resultBlob = await convertDocxToPdf(arrayBuffer, baseName, onProgress);
      mimeType = 'application/pdf';
    } else if (targetFormat === 'txt') {
      resultBlob = await convertDocxToText(arrayBuffer, onProgress);
      mimeType = 'text/plain';
    } else if (targetFormat === 'html') {
      resultBlob = await convertDocxToHtml(arrayBuffer, onProgress);
      mimeType = 'text/html';
    } else if (targetFormat === 'md') {
      resultBlob = await convertDocxToMarkdown(arrayBuffer, onProgress);
      mimeType = 'text/markdown';
    }
  }

  // 3. Image conversions
  else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    if (targetFormat === 'pdf') {
      resultBlob = await convertImageToPdf(file, onProgress);
      mimeType = 'application/pdf';
    } else if (targetFormat === 'png' || targetFormat === 'jpg') {
      resultBlob = await convertImageFormat(file, targetFormat, onProgress);
      mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
    }
  }

  // 4. Text / Markdown conversions
  else if (['txt', 'md'].includes(ext)) {
    const textContent = await file.text();
    if (targetFormat === 'docx') {
      resultBlob = await convertTextToDocx(textContent, baseName, onProgress);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (targetFormat === 'pdf') {
      resultBlob = await convertTextToPdf(textContent, baseName, onProgress);
      mimeType = 'application/pdf';
    }
  }

  if (!resultBlob) {
    throw new Error(`Unsupported conversion from .${ext} to .${targetFormat}`);
  }

  onProgress(100, 'Conversion Complete!');
  return {
    blob: resultBlob,
    filename: outputFilename,
    mimeType,
    size: resultBlob.size,
    originalSize: file.size,
    url: URL.createObjectURL(resultBlob)
  };
}

/**
 * PDF -> DOCX Converter
 */
async function convertPdfToDocx(arrayBuffer, onProgress) {
  onProgress(25, 'Analyzing PDF pages and structure...');
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const docSections = [];
  const paragraphs = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress(30 + Math.floor((pageNum / numPages) * 45), `Extracting Page ${pageNum} of ${numPages}...`);
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by vertical position (lines)
    const linesMap = new Map();
    for (const item of textContent.items) {
      if (!item.str || item.str.trim() === '') continue;
      const y = Math.round(item.transform[5]);
      if (!linesMap.has(y)) {
        linesMap.set(y, []);
      }
      linesMap.get(y).push(item);
    }

    // Sort lines from top to bottom (descending Y)
    const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

    if (pageNum > 1) {
      // Add page break indicator or separator
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${pageNum} ---`,
              color: '888888',
              italics: true,
              size: 20
            })
          ],
          spacing: { before: 240, after: 120 }
        })
      );
    }

    for (const y of sortedY) {
      const items = linesMap.get(y);
      // Sort items horizontally (ascending X)
      items.sort((a, b) => a.transform[4] - b.transform[4]);

      const lineText = items.map(i => i.str).join(' ');
      if (!lineText.trim()) continue;

      // Detect header heuristics based on font size / height
      const maxHeight = Math.max(...items.map(i => Math.abs(i.height || 12)));
      let headingLevel = undefined;
      let isBold = false;

      if (maxHeight >= 20) {
        headingLevel = HeadingLevel.HEADING_1;
        isBold = true;
      } else if (maxHeight >= 16) {
        headingLevel = HeadingLevel.HEADING_2;
        isBold = true;
      } else if (maxHeight >= 14) {
        headingLevel = HeadingLevel.HEADING_3;
        isBold = true;
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: lineText,
              bold: isBold,
              size: Math.min(Math.max(Math.round(maxHeight * 1.8), 20), 40)
            })
          ],
          heading: headingLevel,
          spacing: { after: 120 }
        })
      );
    }
  }

  onProgress(85, 'Assembling Word Document (.docx)...');

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: 'Converted from PDF (no selectable text found in original document).' })]
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  onProgress(92, 'Packaging final DOCX file...');
  return await Packer.toBlob(doc);
}

/**
 * DOCX -> PDF Converter
 */
async function convertDocxToPdf(arrayBuffer, title, onProgress) {
  onProgress(30, 'Parsing DOCX document styles & structure...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  onProgress(60, 'Rendering high-fidelity PDF layout...');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Simple clean HTML parser to format text directly into vector jsPDF
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function checkPageBreak(neededHeight) {
    if (currentY + neededHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  }

  // Iterate top level elements
  const children = Array.from(tempDiv.children);

  if (children.length === 0) {
    // Pure plain text docx
    const rawText = tempDiv.innerText || 'Converted Document';
    const lines = pdf.splitTextToSize(rawText, contentWidth);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    for (const line of lines) {
      checkPageBreak(16);
      pdf.text(line, margin, currentY);
      currentY += 16;
    }
  } else {
    for (const child of children) {
      const tag = child.tagName.toLowerCase();
      const text = child.innerText.trim();
      if (!text) continue;

      if (tag === 'h1') {
        checkPageBreak(36);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(24, 24, 27);
        currentY += 10;
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          pdf.text(line, margin, currentY);
          currentY += 24;
        }
        currentY += 6;
      } else if (tag === 'h2') {
        checkPageBreak(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(39, 39, 42);
        currentY += 8;
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          pdf.text(line, margin, currentY);
          currentY += 20;
        }
        currentY += 4;
      } else if (tag === 'h3') {
        checkPageBreak(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(63, 63, 70);
        currentY += 6;
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          pdf.text(line, margin, currentY);
          currentY += 18;
        }
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(child.children);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);

        for (let i = 0; i < items.length; i++) {
          const itemText = items[i].innerText.trim();
          const prefix = tag === 'ol' ? `${i + 1}. ` : '• ';
          const fullText = prefix + itemText;
          const lines = pdf.splitTextToSize(fullText, contentWidth - 15);
          for (const line of lines) {
            checkPageBreak(16);
            pdf.text(line, margin + 15, currentY);
            currentY += 16;
          }
        }
        currentY += 6;
      } else if (tag === 'table') {
        // Simple table rendering
        const rows = Array.from(child.querySelectorAll('tr'));
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        for (const tr of rows) {
          const cells = Array.from(tr.querySelectorAll('td, th'));
          const cellWidth = contentWidth / Math.max(cells.length, 1);
          checkPageBreak(20);
          cells.forEach((cell, idx) => {
            pdf.text(cell.innerText.trim(), margin + idx * cellWidth + 4, currentY);
          });
          currentY += 18;
        }
        currentY += 10;
      } else {
        // Standard paragraph
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(51, 65, 85);
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          checkPageBreak(16);
          pdf.text(line, margin, currentY);
          currentY += 16;
        }
        currentY += 8;
      }
    }
  }

  onProgress(90, 'Generating PDF Blob...');
  return pdf.output('blob');
}

/**
 * PDF -> Text (.txt)
 */
async function convertPdfToText(arrayBuffer, onProgress) {
  onProgress(30, 'Extracting text streams from PDF...');
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    onProgress(30 + Math.floor((i / pdfDoc.numPages) * 60), `Processing Page ${i}...`);
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
  }

  return new Blob([fullText], { type: 'text/plain;charset=utf-8' });
}

/**
 * DOCX -> Text (.txt)
 */
async function convertDocxToText(arrayBuffer, onProgress) {
  onProgress(40, 'Extracting raw text from DOCX...');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return new Blob([result.value], { type: 'text/plain;charset=utf-8' });
}

/**
 * DOCX -> HTML (.html)
 */
async function convertDocxToHtml(arrayBuffer, onProgress) {
  onProgress(40, 'Converting DOCX to clean HTML...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Converted Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    td, th { border: 1px solid #cbd5e1; padding: 8px 12px; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`;
  return new Blob([styledHtml], { type: 'text/html;charset=utf-8' });
}

/**
 * DOCX -> Markdown (.md)
 */
async function convertDocxToMarkdown(arrayBuffer, onProgress) {
  onProgress(40, 'Converting DOCX to Markdown...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  // Convert basic HTML to markdown
  let md = result.value
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p><strong>(.*?)<\/strong><\/p>/gi, '**$1**\n\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]+>/g, '');

  return new Blob([md], { type: 'text/markdown;charset=utf-8' });
}

/**
 * PDF -> PNG Image
 */
async function convertPdfToPng(arrayBuffer, onProgress) {
  onProgress(30, 'Rendering PDF page to image canvas...');
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  const scale = 2.0; // Crisp rendering
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;
  onProgress(85, 'Encoding PNG image...');

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Image -> PDF
 */
async function convertImageToPdf(imageFile, onProgress) {
  onProgress(30, 'Loading image into graphics buffer...');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onProgress(60, 'Creating PDF container with matched aspect ratio...');
        const isLandscape = img.width > img.height;
        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'pt',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Fit image keeping aspect ratio
        const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
        const drawWidth = img.width * ratio;
        const drawHeight = img.height * ratio;
        const posX = (pageWidth - drawWidth) / 2;
        const posY = (pageHeight - drawHeight) / 2;

        pdf.addImage(e.target.result, 'JPEG', posX, posY, drawWidth, drawHeight);
        onProgress(90, 'Packaging PDF...');
        resolve(pdf.output('blob'));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Image format conversion (JPG <-> PNG)
 */
async function convertImageFormat(file, targetFormat, onProgress) {
  onProgress(40, `Converting image to ${targetFormat.toUpperCase()}...`);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const mime = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(blob => resolve(blob), mime, 0.95);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Text -> DOCX
 */
async function convertTextToDocx(text, title, onProgress) {
  onProgress(50, 'Building Word Document structure...');
  const lines = text.split('\n');
  const paragraphs = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^#\s*/, ''), bold: true, size: 36 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 }
      });
    }
    if (trimmed.startsWith('## ')) {
      return new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^##\s*/, ''), bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 80 }
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: line, size: 22 })],
      spacing: { after: 100 }
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }]
  });

  return await Packer.toBlob(doc);
}

/**
 * Text -> PDF
 */
async function convertTextToPdf(text, title, onProgress) {
  onProgress(40, 'Compiling text to PDF layout...');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margin = 50;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 41, 59);

  const lines = pdf.splitTextToSize(text, contentWidth);
  for (const line of lines) {
    if (currentY + 16 > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.text(line, margin, currentY);
    currentY += 16;
  }

  return pdf.output('blob');
}

/**
 * Built-in Sample Generator for instant demonstration
 */
export async function createSampleDocument(type = 'pdf') {
  if (type === 'pdf') {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(234, 88, 12); // Basketball orange
    pdf.text('SLAMDOC CHAMPIONSHIP PLAYBOOK', 50, 70);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Game Strategy & File Transformation Report', 50, 105);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    const body = 
      'This official sample playbook document demonstrates high-fidelity cross-format conversion directly inside your browser.\n\n' +
      '1. OFFENSIVE TACTIC (PDF to Word DOCX):\n' +
      'All text paragraphs, titles, headings, and layout segments are parsed into editable Microsoft Word formatting.\n\n' +
      '2. FAST BREAK (Interactive Basketball Shot):\n' +
      'Pull back on the ball, aim at the glowing rim, and release to trigger the physics simulation.\n\n' +
      '3. 3-POINT ACCURACY:\n' +
      'Zero server latency, zero cloud uploads. Your documents stay 100% private on your machine while converting at lightning speed.\n\n' +
      'Player Stats: 32 PTS | 100% CONVERSION EFFICIENCY | 12 SWISHES';

    const lines = pdf.splitTextToSize(body, 500);
    pdf.text(lines, 50, 135);

    const blob = pdf.output('blob');
    return new File([blob], 'Championship_Playbook.pdf', { type: 'application/pdf' });
  }

  if (type === 'docx') {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'NBA All-Star Scouting Report', bold: true, size: 36, color: 'FF5500' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Player Profile: SlamDoc Converter MVP', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This Word document is ready to be converted into a pristine, high-resolution PDF with vector typography and clean margins. Throw it in the hoop to convert!',
                size: 22
              })
            ],
            spacing: { after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Vertical Leap: 44 inches\n', size: 22 }),
              new TextRun({ text: '• Conversion Speed: Instant Client-Side\n', size: 22 }),
              new TextRun({ text: '• Privacy: 100% Local Browser Engine\n', size: 22 })
            ]
          })
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    return new File([blob], 'AllStar_Scouting_Report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  // Sample Image
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 400);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#ff5500');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 400);

  // Basketball graphic
  ctx.fillStyle = '#ff7722';
  ctx.beginPath();
  ctx.arc(300, 200, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#222';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SLAMDOC PASS', 300, 320);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob], 'Game_Pass_Ticket.png', { type: 'image/png' }));
    }, 'image/png');
  });
}
