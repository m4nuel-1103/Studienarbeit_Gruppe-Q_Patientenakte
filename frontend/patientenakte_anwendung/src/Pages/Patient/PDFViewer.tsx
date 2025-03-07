import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import jsPDF from "jspdf";

const PDFProcessor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      processPDF(file);
    }
  };

  const processPDF = async (file: File) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      const processedImages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Wasserzeichen hinzufügen
        const watermarkedImage = await addWatermark(canvas, "CONFIDENTIAL");
        processedImages.push(watermarkedImage);
      }

      // Bilder wieder in ein PDF speichern
      generatePDF(processedImages);
    };
  };

  const addWatermark = (canvas: HTMLCanvasElement, watermarkText: string) => {
    return new Promise<string>((resolve) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.font = "40px Arial";
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Transparenter roter Text
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(watermarkText, 50, 200);
      ctx.fillText(watermarkText, 50, 600);
      resolve(canvas.toDataURL("image/png"));
    });
  };

  const generatePDF = (images: string[]) => {
    const pdf = new jsPDF();

    images.forEach((img, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(img, "PNG", 0, 0, 210, 297);
    });

    //pdf.save("processed.pdf");
    return pdf.output("arraybuffer");
  };

  return (
    <div>
      <h2>PDF Wasserzeichen & Schutz</h2>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {pdfFile && <p>Datei: {pdfFile.name}</p>}
    </div>
  );
};

export default PDFProcessor;
