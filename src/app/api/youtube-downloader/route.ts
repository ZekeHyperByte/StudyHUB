import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import YTDlpWrap from "yt-dlp-wrap";
import path from "path";

// Initialize YTDlpWrap. You might need to specify the path to your yt-dlp binary
// if it's not in the system's PATH.
const ytDlpWrap = new YTDlpWrap();

export async function POST(req: NextRequest) {
  try {
    const { limited } = await checkRateLimit(req);
    if (limited) {
      return NextResponse.json(
        { error: "You have exceeded the daily limit of 5 requests." },
        { status: 429 }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided." }, { status: 400 });
    }

    // IMPORTANT: This requires yt-dlp and ffmpeg to be installed on the server.
    // We will download the video to a temporary directory.
    const outputPath = path.join("/tmp", `%(title)s.%(ext)s`);

    // Execute yt-dlp to get video info and download
    const readableStream = ytDlpWrap.exec([
        url,
        "-o",
        outputPath,
        "-f",
        "best", // Download the best quality
    ]);

    // We need to wait for the download to finish.
    // This can be complex to handle in a serverless function due to timeouts.
    // A more robust solution would use a queue and background worker.
    // For this MVP, we'll pipe the output to a file and then read it.
    
    // This is a simplified example. A real implementation would need to handle
    // the stream events to know when the download is complete and get the final filename.
    // For now, we'll return a success message and a placeholder download.
    
    await new Promise((resolve, reject) => {
        readableStream.on('close', resolve);
        readableStream.on('error', reject);
    });

    // Since getting the exact filename is complex without more stream handling,
    // we'll return a placeholder. A real implementation would need to parse
    // the output of yt-dlp to get the final filename.
    const videoTitle = "downloaded_video.mp4";

    return NextResponse.json({
      success: true,
      message: `Successfully initiated download for: ${url}`,
      fileName: videoTitle,
      downloadUrl: `/api/placeholder-download/${videoTitle}`, // Placeholder
    });

  } catch (error) {
    console.error("An error occurred during YouTube download:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Ensure yt-dlp and ffmpeg are installed on the server." },
      { status: 500 }
    );
  }
}
