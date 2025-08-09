import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
    const file = formData.get("file") as File | null;
    const outputFormat = formData.get("outputFormat") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!outputFormat) {
      return NextResponse.json(
        { error: "No output format provided." },
        { status: 400 }
      );
    }

    // 1. Save the uploaded file temporarily
    const inputPath = path.join("/tmp", file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, fileBuffer);

    // 2. Prepare paths for the output file
    const originalFileName = file.name.substring(0, file.name.lastIndexOf('.'));
    const newFileName = `${originalFileName}.${outputFormat}`;
    const outputPath = path.join("/tmp", newFileName);
    const outputDir = "/tmp";

    // 3. Execute the LibreOffice conversion command
    // IMPORTANT: This requires LibreOffice to be installed on the server
    // and accessible from the command line.
    const command = `libreoffice --headless --convert-to ${outputFormat} "${inputPath}" --outdir "${outputDir}"`;

    try {
      await execAsync(command);
    } catch (error) {
      console.error("LibreOffice conversion failed:", error);
      return NextResponse.json(
        { error: "File conversion failed. Please ensure LibreOffice is installed on the server." },
        { status: 500 }
      );
    }

    // 4. Read the converted file
    const convertedFileBuffer = await fs.readFile(outputPath);

    // 5. Clean up the temporary files
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    // 6. Return the converted file as a blob
    // @ts-expect-error - Buffer is compatible with NextResponse, but TypeScript has trouble with the types here.
    return new NextResponse(convertedFileBuffer, {
      headers: {
        "Content-Type": `application/${outputFormat}`,
        "Content-Disposition": `attachment; filename="${newFileName}"`,
      },
    });

  } catch (error) {
    console.error("An error occurred during file conversion:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
