"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Tag,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- DATA & TYPE ---
type Motif = {
  id: number;
  name: string;
  price_modifier: number;
  image_url: string;
};

// Library Data Statis
const MOTIF_INFO: Record<
  string,
  { desc: string; usage: string; meaning: string }
> = {
  semen: {
    meaning: "Semi / Tumbuh",
    desc: "Motif Semen melambangkan kehidupan yang terus tumbuh dan bersemi. Pola ini menyiratkan harapan agar pemakainya mendapatkan berkah kehidupan yang terus berkembang dan kesejahteraan yang melimpah.",
    usage: "Cocok untuk acara pernikahan atau upacara sakral.",
  },
  "terang bulan": {
    meaning: "Cahaya & Keteduhan",
    desc: "Terang Bulan menggambarkan keindahan malam yang syahdu. Motif ini sering dikaitkan dengan ketenangan hati dan kejernihan pikiran, membawa aura damai bagi pemakainya.",
    usage: "Busana santai sore hari atau acara semi-formal.",
  },
  liong: {
    meaning: "Naga / Kekuatan",
    desc: "Liong adalah simbol naga dalam mitologi Tionghoa yang melambangkan kekuatan, kekuasaan, dan keberuntungan. Perpaduan budaya yang melahirkan karya seni yang agung.",
    usage: "Acara Imlek, festival budaya, atau pernyataan karakter kuat.",
  },
  encim: {
    meaning: "Keceriaan & Akulturasi",
    desc: "Batik Encim atau Peranakan menonjolkan warna-warna cerah dan motif floral (buketan). Melambangkan kelembutan, keceriaan, dan keindahan akulturasi budaya pesisir.",
    usage: "Kebaya wisuda, pesta kebun, atau acara wanita modern.",
  },
  phoenix: {
    meaning: "Keabadian & Kebajikan",
    desc: "Burung Phoenix (Hong) melambangkan keabadian, kebangkitan, dan kebajikan. Dipercaya sebagai pembawa damai dan tanda keberuntungan bagi pemimpin atau pasangan baru.",
    usage: "Gaun malam atau kemeja eksklusif.",
  },
  hokokai: {
    meaning: "Ketabahan & Keindahan",
    desc: "Lahir di era penjajahan Jepang (Jawa Hokokai), motif ini sangat detail dengan ornamen kupu-kupu dan bunga sakura. Mengajarkan bahwa keindahan tetap bisa lahir dalam kondisi sulit sekalipun.",
    usage: "Kolektor item, pameran seni, atau acara kenegaraan.",
  },
  "tujuh rupa": {
    meaning: "Kekayaan Alam Pekalongan",
    desc: "Motif Tujuh Rupa sangat kental dengan nuansa alam (hewan dan tumbuhan) dari Pekalongan. Melambangkan keluwesan beradaptasi dan kekayaan budaya yang berwarna-warni.",
    usage: "Oleh-oleh premium, seragam keluarga, atau casual wear.",
  },
};

const getMotifInfo = (name: string) => {
  const lowerName = name.toLowerCase();
  const key = Object.keys(MOTIF_INFO).find((k) => lowerName.includes(k));
  return (
    MOTIF_INFO[key || ""] || {
      meaning: "Keindahan Nusantara",
      desc: "Sebuah karya seni batik yang dibuat dengan ketelitian tinggi, menggabungkan unsur tradisional dan estetika modern untuk penampilan yang elegan.",
      usage: "Cocok untuk berbagai acara formal maupun casual.",
    }
  );
};

export default function GalleryGrid({ motifs }: { motifs: Motif[] }) {
  const [search, setSearch] = useState("");
  const [selectedMotif, setSelectedMotif] = useState<Motif | null>(null);

  const filteredMotifs = motifs.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/80 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm sticky top-24 z-30">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari motif (misal: Semen, Liong)..."
            className="pl-10 bg-transparent border-zinc-200 dark:border-zinc-700 focus-visible:ring-amber-500"
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
        <AnimatePresence mode="popLayout">
          {filteredMotifs.map((motif, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={motif.id}
              onClick={() => setSelectedMotif(motif)}
              className="cursor-pointer"
            >
              <Card className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                {/* 1. THUMBNAIL: CONTINUOUS / FULL COVER */}
                {/* Menghapus padding (p-6) dan bg-zinc-100 agar gambar full */}
                <div className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-b dark:border-zinc-800">
                  <Image
                    src={motif.image_url || "/window.svg"}
                    alt={motif.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" // object-cover bikin gambar full
                  />

                  <Badge className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white border shadow-sm backdrop-blur-sm z-10">
                    +{formatRupiah(motif.price_modifier)}
                  </Badge>

                  {/* Overlay Hitam Transparan saat Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/95 text-zinc-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                      Lihat Detail
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col gap-2 grow justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {motif.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                      Classic Collection
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex items-center justify-between text-xs text-zinc-400 group-hover:text-amber-600 transition-colors">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" /> Info Menarik
                    </span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* --- MODAL DETAIL (FIX SCROLL & CONTINUOUS IMAGE) --- */}
      <Dialog
        open={!!selectedMotif}
        onOpenChange={(open) => !open && setSelectedMotif(null)}
      >
        {selectedMotif && (
          // FIX 1: Set max-h-[90vh] dan h-[600px] pada DialogContent agar tingginya pasti
          // Flex Column pada mobile, Flex Row pada Desktop
          <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-none shadow-2xl h-[90vh] md:h-[600px] flex flex-col md:flex-row gap-0">
            {/* KIRI: GAMBAR (Continuous / Full Cover) */}
            <div className="relative w-full md:w-[45%] h-[35%] md:h-full bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <Image
                src={selectedMotif.image_url || "/window.svg"}
                alt={selectedMotif.name}
                fill
                className="object-cover" // Full Bleed Image
                priority
              />

              {/* Overlay Judul di Mobile (Karena layout bertumpuk) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:hidden">
                <h2 className="text-white text-xl font-serif font-bold">
                  {selectedMotif.name}
                </h2>
              </div>
            </div>

            {/* KANAN: INFO DETAIL (Scrollable) */}
            {/* FIX 2: min-h-0 sangat penting agar flex item bisa discroll */}
            <div className="flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-zinc-950 relative overflow-auto">
              {/* <DialogClose className="absolute top-3 right-3 z-50 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </DialogClose> */}

              {/* Header (Hidden on Mobile) */}
              <DialogHeader className="p-6 pb-2 hidden md:block shrink-0">
                <div className="pr-8">
                  <DialogTitle className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
                    {selectedMotif.name}
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                  >
                    Koleksi Eksklusif
                  </Badge>
                </div>
              </DialogHeader>

              {/* Scrollable Content Area */}
              {/* FIX 3: Flex-1 pada ScrollArea membuatnya mengisi sisa ruang yang tersedia */}
              <ScrollArea className="flex-1 w-full">
                <div className="p-6 space-y-6">
                  {/* Makna */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Filosofi
                    </div>
                    <div className="prose dark:prose-invert">
                      <h4 className="font-medium text-lg text-amber-700 dark:text-amber-500 mb-2 leading-tight">
                        "{getMotifInfo(selectedMotif.name).meaning}"
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                        {getMotifInfo(selectedMotif.name).desc}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Rekomendasi */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      Rekomendasi Acara
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {getMotifInfo(selectedMotif.name).usage}
                    </p>
                  </div>

                  {/* Harga */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <Tag className="w-3 h-3 text-amber-500" /> Harga
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Biaya Tambahan
                      </span>
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
                        +{formatRupiah(selectedMotif.price_modifier)}
                      </span>
                    </div>
                  </div>

                  {/* Spacer untuk memastikan konten terbawah bisa discroll */}
                  <div className="h-4 md:h-0" />
                </div>
              </ScrollArea>

              {/* Footer Actions (Sticky Bottom) */}
              <div className="p-4 md:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 z-20">
                <Button
                  className="w-full bg-zinc-900 hover:bg-black text-white h-12 text-base shadow-lg"
                  asChild
                >
                  <Link href="/simulasi">
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                    Coba Simulasi
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
