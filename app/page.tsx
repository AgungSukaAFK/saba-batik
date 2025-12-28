import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-amber-200 dark:selection:bg-amber-900">
      <Navbar />
      <Hero />
    </main>
  );
}
