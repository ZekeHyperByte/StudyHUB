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
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function YouTubeDownloaderPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      toast.error("Please enter a YouTube URL.");
      return;
    }
    setIsLoading(true);

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

      toast.success("Download initiated! This might take a moment.");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred.");
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
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Download
                <Download className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Legal Disclaimer: By using this service, you agree that you are
            responsible for ensuring you have the rights to download and use
            the content.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
