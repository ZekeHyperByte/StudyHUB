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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud } from "lucide-react";

// A shared component for file uploading
const FileUploader = ({
  onFileChange,
  title,
  description,
  multiple = false,
}: {
  onFileChange: (files: FileList | null) => void;
  title: string;
  description: string;
  multiple?: boolean;
}) => (
  <div className="flex items-center justify-center w-full">
    <label
      htmlFor={`dropzone-file-${title}`}
      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold">{title}</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Input
        id={`dropzone-file-${title}`}
        type="file"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files)}
        multiple={multiple}
        accept="application/pdf"
      />
    </label>
  </div>
);

export default function PdfToolsPage() {
  const [mergeFiles, setMergeFiles] = useState<FileList | null>(null);
  const [splitFile, setSplitFile] = useState<FileList | null>(null);
  const [compressFile, setCompressFile] = useState<FileList | null>(null);
  const [splitRanges, setSplitRanges] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    fileName: string;
    downloadUrl: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    setter: React.Dispatch<React.SetStateAction<FileList | null>>
  ) => (files: FileList | null) => {
    setResult(null);
    setError(null);
    setter(files);
  };

  const handlePdfAction = async (
    action: "merge" | "split" | "compress",
    files: FileList | null,
    extraData?: Record<string, string>
  ) => {
    if (!files || files.length === 0) {
      setError("Please select one or more files.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("action", action);
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    if (extraData) {
      for (const key in extraData) {
        formData.append(key, extraData[key]);
      }
    }

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      // Handle the file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = response.headers.get("content-disposition");
      let fileName = "result.pdf";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setResult({ fileName, downloadUrl: "#", message: "Success!" }); // Indicate success

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
      <h1 className="text-3xl font-bold">PDF Tools</h1>
      <p className="text-muted-foreground">
        Merge, split, or compress your PDF files with ease.
      </p>
      <Tabs defaultValue="merge" className="max-w-2xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="merge">Merge</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="compress">Compress</TabsTrigger>
        </TabsList>

        <TabsContent value="merge">
          <Card>
            <CardHeader>
              <CardTitle>Merge PDFs</CardTitle>
              <CardDescription>
                Combine multiple PDF files into a single document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onFileChange={handleFileChange(setMergeFiles)}
                title="Select files to merge"
                description="Upload two or more PDFs"
                multiple
              />
              {mergeFiles && (
                <div className="text-sm text-center text-muted-foreground">
                  {Array.from(mergeFiles)
                    .map((file) => file.name)
                    .join(", ")}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!mergeFiles || mergeFiles.length < 2 || isLoading}
                onClick={() => handlePdfAction("merge", mergeFiles)}
              >
                {isLoading ? "Merging..." : "Merge PDFs"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="split">
          <Card>
            <CardHeader>
              <CardTitle>Split PDF</CardTitle>
              <CardDescription>
                Extract one or more pages from a PDF file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onFileChange={handleFileChange(setSplitFile)}
                title="Select a file to split"
                description="Upload a single PDF"
              />
              {splitFile && (
                <p className="text-sm text-center text-muted-foreground">
                  Selected file: {splitFile[0].name}
                </p>
              )}
              <Input
                placeholder="e.g., 1-3, 5, 7-9"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!splitFile || !splitRanges || isLoading}
                onClick={() =>
                  handlePdfAction("split", splitFile, { ranges: splitRanges })
                }
              >
                {isLoading ? "Splitting..." : "Split PDF"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="compress">
          <Card>
            <CardHeader>
              <CardTitle>Compress PDF</CardTitle>
              <CardDescription>
                Reduce the file size of your PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onFileChange={handleFileChange(setCompressFile)}
                title="Select a file to compress"
                description="Upload a single PDF"
              />
              {compressFile && (
                <p className="text-sm text-center text-muted-foreground">
                  Selected file: {compressFile[0].name}
                </p>
              )}
              <div className="text-sm text-center text-muted-foreground">
                (Compression options coming soon)
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!compressFile || isLoading}
                onClick={() => handlePdfAction("compress", compressFile)}
              >
                {isLoading ? "Compressing..." : "Compress PDF"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-4 mt-4 text-center text-red-500 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 mt-4 text-center text-green-500 bg-green-100 rounded-lg">
          Action successful! Your download should start automatically.
        </div>
      )}
    </div>
  );
}
