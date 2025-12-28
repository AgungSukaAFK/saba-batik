import Navbar from "@/components/Navbar";
import SimulasiEditor from "@/components/SimulasiEditor";

export default function SimulasiPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <div className="pt-24">
        <SimulasiEditor />
      </div>
    </main>
  );
}
