import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

// Reads raw text out of an uploaded file, using the right tool based on its type.
export async function extractTextFromFile(file) {
  const mimeType = file.mimetype;

  if (mimeType === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return { text: data.text, fileType: "pdf" };
  }

  if (mimeType === "image/jpeg" || mimeType === "image/png") {
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(file.buffer);
    await worker.terminate();
    return { text: data.text, fileType: "image" };
  }

  throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF, JPG, or PNG.`);
}