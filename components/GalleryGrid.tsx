"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, Sparkles, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Sesuaikan tipe data dengan tabel Supabase
type Motif = {
  id: number;
  name: string;
  price_modifier: number;
  image_url: string;
};

export default function GalleryGrid({ motifs }: { motifs: Motif[] }) {
  const [search, setSearch] = useState("");

  // Filter motif berdasarkan search
  const filteredMotifs = motifs.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm sticky top-24 z-30">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari nama motif batik..."
            className="pl-10 bg-transparent border-zinc-200 dark:border-zinc-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-zinc-500">
          Menampilkan{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {filteredMotifs.length}
          </span>{" "}
          koleksi
        </div>
      </div>

      {/* Grid Gallery */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filteredMotifs.map((motif, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={motif.id}
            >
              <Card className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-4/5 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {/* Image Placeholder / Real Image */}
                  <Image
                    src={
                      motif.image_url && motif.image_url.startsWith("http")
                        ? motif.image_url
                        : "/window.svg"
                    }
                    alt={motif.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    // Efek filter agar motif terlihat artistik (opsional, hapus jika ingin warna asli)
                    style={
                      !motif.image_url.startsWith("http")
                        ? { filter: "grayscale(100%) opacity(0.5)" }
                        : {}
                    }
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button
                      asChild
                      className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                      <Link href="/?simulasi=true">
                        <Sparkles className="mr-2 h-4 w-4 text-amber-600" />
                        Coba Simulasi
                      </Link>
                    </Button>
                  </div>

                  <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white border-none hover:bg-black/70">
                    +{formatRupiah(motif.price_modifier)}
                  </Badge>
                </div>

                <CardContent className="p-5 flex flex-col gap-2 grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 transition-colors">
                        {motif.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                        Classic Collection
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMotifs.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-500">
            <p className="text-lg">
              Tidak ada motif yang ditemukan dengan nama "{search}".
            </p>
            <Button
              variant="link"
              onClick={() => setSearch("")}
              className="mt-2 text-amber-600"
            >
              Reset Pencarian
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
