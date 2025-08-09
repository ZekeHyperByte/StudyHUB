import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Student Productivity Hub
        </h1>
        <p className="mt-3 text-xl sm:text-2xl text-muted-foreground">
          All the tools you need, in one place.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/tools/converter">Get Started</Link>
          </Button>
        </div>
      </main>
      <footer className="py-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudyHub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
