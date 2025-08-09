"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import Link from "next/link";

export default function YouTubeDownloaderPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    fileName: string;
    downloadUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/youtube-downloader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">YouTube Downloader</h1>
      <p className="text-muted-foreground">
        Download YouTube videos or audio for educational purposes.
      </p>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Download from YouTube</CardTitle>
          <CardDescription>
            Paste a YouTube video URL below to download it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button
            onClick={handleDownload}
            disabled={!url || isLoading}
            className="w-full"
          >
            {isLoading ? "Downloading..." : "Download"}
            {!isLoading && <Download className="w-4 h-4 ml-2" />}
          </Button>
          <p className="text-xs text-muted-foreground">
            Legal Disclaimer: By using this service, you agree that you are
            responsible for ensuring you have the rights to download and use
            the content.
          </p>
        </CardFooter>
      </Card>

      {error && (
        <div className="p-4 mt-4 text-center text-red-500 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <Card className="max-w-lg mt-4">
          <CardHeader>
            <CardTitle>Download Ready!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your download is ready.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={result.downloadUrl} download={result.fileName}>
                Download {result.fileName}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
