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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Languages } from "lucide-react";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setOutputText("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText, sourceLang, targetLang }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setOutputText(data.translatedText);
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
      <h1 className="text-3xl font-bold">Translator</h1>
      <p className="text-muted-foreground">
        Translate text between different languages.
      </p>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Translate Text</CardTitle>
          <CardDescription>
            Select the source and target languages, then enter your text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select onValueChange={setSourceLang} defaultValue="auto">
              <SelectTrigger>
                <SelectValue placeholder="Source Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-center">
              <Languages className="w-6 h-6 text-muted-foreground" />
            </div>
            <Select onValueChange={setTargetLang} defaultValue="en">
              <SelectTrigger>
                <SelectValue placeholder="Target Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Textarea
              placeholder="Enter text to translate..."
              className="h-48"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Textarea
              placeholder="Translation will appear here..."
              className="h-48"
              value={outputText}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleTranslate}
            disabled={!inputText || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Translating..." : "Translate"}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
