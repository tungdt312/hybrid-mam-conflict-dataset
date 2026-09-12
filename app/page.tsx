import { DatasetAnnotator } from "@/components/dataset-annotator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <DatasetAnnotator />
    </main>
  );
}
