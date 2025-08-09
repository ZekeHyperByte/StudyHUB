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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

export default function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    fileName: string;
    downloadUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null);
    setError(null);
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file || !outputFormat) {
      setError("Please select a file and an output format.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("outputFormat", outputFormat);

    try {
      const response = await fetch("/api/convert", {
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
      let fileName = "converted-file";
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
      setResult({ fileName, downloadUrl: "#" }); // Indicate success

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
      <h1 className="text-3xl font-bold">File Converter</h1>
      <p className="text-muted-foreground">
        Convert your files between PDF, Word, Excel, and PowerPoint.
      </p>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Upload your file</CardTitle>
          <CardDescription>
            Select a file from your device to convert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, XLSX, PPTX (MAX. 10MB)
                </p>
              </div>
              <Input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {file && (
            <p className="text-sm text-center text-muted-foreground">
              Selected file: {file.name}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Convert to:</label>
            <Select onValueChange={setOutputFormat} value={outputFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word (DOCX)</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="pptx">PowerPoint (PPTX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleConvert}
            disabled={!file || !outputFormat || isLoading}
          >
            {isLoading ? "Converting..." : "Convert File"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 text-center text-green-500 bg-green-100 rounded-lg">
          Conversion successful! Your download should start automatically.
        </div>
      )}
    </div>
  );
}
