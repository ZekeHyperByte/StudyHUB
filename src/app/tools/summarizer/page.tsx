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
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setOutputText("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setOutputText(data.summarizedText);
    } catch (err) {
      if (err instanceof Error) {
        setOutputText(`Error: ${err.message}`);
      } else {
        setOutputText("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">AI Summarizer</h1>
      <p className="text-muted-foreground">
        Condense long articles, documents, or text into key points.
      </p>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Summarize Text</CardTitle>
          <CardDescription>
            Enter the text you want to summarize in the box below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="input-text" className="font-medium">
              Original Text
            </label>
            <Textarea
              id="input-text"
              placeholder="Paste your text here..."
              className="h-48"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="output-text" className="font-medium">
              Summarized Text
            </label>
            <Textarea
              id="output-text"
              placeholder="Your summary will appear here..."
              className="h-48"
              value={outputText}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSummarize}
            disabled={!inputText || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Summarizing..." : "Summarize"}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
