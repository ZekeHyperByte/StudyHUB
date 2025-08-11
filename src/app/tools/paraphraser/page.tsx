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
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ParaphraserPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleParaphrase = async () => {
    if (!inputText) {
      toast.error("Please enter some text to paraphrase.");
      return;
    }
    setIsLoading(true);
    setOutputText("");

    try {
      const response = await fetch("/api/paraphrase", {
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

      setOutputText(data.paraphrasedText);
      toast.success("Text paraphrased successfully!");
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
      <h1 className="text-3xl font-bold">AI Paraphraser</h1>
      <p className="text-muted-foreground">
        Rewrite your text to improve clarity, tone, and style.
      </p>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Paraphrase Text</CardTitle>
          <CardDescription>
            Enter the text you want to rewrite in the box below.
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
              Paraphrased Text
            </label>
            <Textarea
              id="output-text"
              placeholder="Your rewritten text will appear here..."
              className="h-48"
              value={outputText}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleParaphrase}
            disabled={!inputText || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Paraphrasing...
              </>
            ) : (
              <>
                Paraphrase
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
