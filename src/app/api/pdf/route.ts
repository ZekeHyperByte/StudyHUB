import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import { PDFDocument } from "pdf-lib";

async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const pdfBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return mergedPdf.save();
}

async function splitPdf(file: File, ranges: string): Promise<Uint8Array> {
  const pdfBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(pdfBytes);
  const splitPdf = await PDFDocument.create();
  
  // Basic range parsing (e.g., "1-3,5,7-9")
  const pageIndices = new Set<number>();
  const rangeParts = ranges.split(',');
  for (const part of rangeParts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim(), 10) - 1);
      for (let i = start; i <= end; i++) {
        if (i < pdf.getPageCount()) pageIndices.add(i);
      }
    } else {
      const pageNum = parseInt(part.trim(), 10) - 1;
      if (pageNum < pdf.getPageCount()) pageIndices.add(pageNum);
    }
  }

  const copiedPages = await splitPdf.copyPages(pdf, Array.from(pageIndices));
  copiedPages.forEach((page) => splitPdf.addPage(page));

  return splitPdf.save();
}

async function compressPdf(file: File): Promise<Uint8Array> {
    // pdf-lib does not support direct compression in the same way as other tools.
    // A common strategy is to simply re-save the document, which can sometimes
    // reduce file size by removing unused objects or optimizing the structure.
    // For true compression (e.g., image quality reduction), a more advanced
    // library like Ghostscript would be needed.
    const pdfBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    return pdf.save();
}

export async function POST(req: NextRequest) {
  try {
    const { limited } = await checkRateLimit(req);
    if (limited) {
      return NextResponse.json(
        { error: "You have exceeded the daily limit of 5 requests." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const action = formData.get("action") as string;
    const files = formData.getAll("files") as File[];

    if (!action || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing action or files." },
        { status: 400 }
      );
    }

    let resultBytes: Uint8Array;
    let newFileName = "result.pdf";

    switch (action) {
      case "merge":
        if (files.length < 2) {
          return NextResponse.json(
            { error: "Merge action requires at least two files." },
            { status: 400 }
          );
        }
        resultBytes = await mergePdfs(files);
        newFileName = "merged.pdf";
        break;

      case "split":
        const ranges = formData.get("ranges") as string;
        if (!ranges) {
          return NextResponse.json(
            { error: "Split action requires page ranges." },
            { status: 400 }
          );
        }
        resultBytes = await splitPdf(files[0], ranges);
        newFileName = `split_${files[0].name}`;
        break;

      case "compress":
        resultBytes = await compressPdf(files[0]);
        newFileName = `compressed_${files[0].name}`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid PDF action." },
          { status: 400 }
        );
    }

    // @ts-expect-error - Uint8Array is compatible with NextResponse, but TypeScript has trouble with the types here.
    return new NextResponse(resultBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${newFileName}"`,
      },
    });

  } catch (error) {
    console.error("An error occurred during PDF processing:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during PDF processing." },
      { status: 500 }
    );
  }
}
