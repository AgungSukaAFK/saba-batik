import GalleryGrid from "@/components/GalleryGrid";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";

// Revalidate data setiap 1 jam agar performa cepat tapi tetap update
export const revalidate = 3600;

export default async function GalleryPage() {
  const supabase = await createClient();

  // Fetch data motif dari Supabase
  const { data: motifs } = await supabase
    .from("motifs")
    .select("*")
    .order("price_modifier", { ascending: true });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-amber-200 dark:selection:bg-amber-900">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-12 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-6 text-center">
          <span className="text-amber-600 font-medium tracking-wider text-sm uppercase mb-2 block">
            Warisan Budaya Nusantara
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 font-serif">
            Galeri Motif Eksklusif
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
            Jelajahi koleksi motif batik pilihan kami. Setiap goresan memiliki
            makna filosofis yang mendalam, siap dipadukan dengan material
            terbaik.
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12 container mx-auto px-6">
        {motifs ? (
          <GalleryGrid motifs={motifs} />
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Gagal memuat data galeri. Silakan refresh halaman.
          </div>
        )}
      </section>
    </main>
  );
}
