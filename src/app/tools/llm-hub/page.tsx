import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const llmRecommendations = [
  {
    task: "Essay Writing",
    llm: "Claude 3 Opus",
    strengths: "Strong reasoning, nuance, and creative writing.",
  },
  {
    task: "Mathematical Problems",
    llm: "ChatGPT-4o",
    strengths: "Excellent at logic, step-by-step problem solving.",
  },
  {
    task: "Coding & Programming",
    llm: "Gemini 1.5 Pro",
    strengths: "Large context window, good for codebase analysis.",
  },
  {
    task: "Brainstorming & Ideas",
    llm: "Llama 3",
    strengths: "Fast, creative, and good for generating diverse ideas.",
  },
  {
    task: "Summarizing Research",
    llm: "Perplexity AI",
    strengths: "Cites sources and provides direct links.",
  },
];

export default function LlmHubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">LLM Recommendation Hub</h1>
      <p className="text-muted-foreground">
        Find the best Large Language Model for your specific academic needs.
      </p>
      <Table>
        <TableCaption>
          Recommendations are based on general user consensus and may vary.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Task</TableHead>
            <TableHead>Recommended LLM</TableHead>
            <TableHead>Strengths</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {llmRecommendations.map((rec) => (
            <TableRow key={rec.task}>
              <TableCell className="font-medium">{rec.task}</TableCell>
              <TableCell>{rec.llm}</TableCell>
              <TableCell>{rec.strengths}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
