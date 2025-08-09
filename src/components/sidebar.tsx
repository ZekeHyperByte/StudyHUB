"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const tools = [
  { name: "File Converter", href: "/tools/converter" },
  { name: "PDF Tools", href: "/tools/pdf" },
  { name: "AI Paraphraser", href: "/tools/paraphraser" },
  { name: "AI Summarizer", href: "/tools/summarizer" },
  { name: "Translator", href: "/tools/translator" },
  { name: "YouTube Downloader", href: "/tools/youtube-downloader" },
  { name: "LLM Hub", href: "/tools/llm-hub" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-gray-100 p-4 dark:bg-gray-800 md:flex">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold">
          StudyHub
        </Link>
      </div>
      <nav className="flex flex-col space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              pathname === tool.href
                ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            {tool.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
}
