import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 overflow-y-auto md:p-8">{children}</main>
      </div>
    </div>
  );
}
