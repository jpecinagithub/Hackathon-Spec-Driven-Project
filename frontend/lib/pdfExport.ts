import { jsPDF } from "jspdf";

export function downloadTranscriptionAsPDF(text: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, margin + 12);

  doc.save("transcription.pdf");
}
