"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, ShoppingCart, RefreshCcw, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Tipe data sesuai database Supabase
type Material = {
  id: number;
  name: string;
  base_price: number;
  description?: string;
};
type Motif = {
  id: number;
  name: string;
  price_modifier: number;
  image_url: string;
};
type Color = { id: number; name: string; hex_code: string };

export default function SimulasiEditor() {
  const supabase = createClient();

  // --- STATE DATA MASTER ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PILIHAN USER ---
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [selectedMotif, setSelectedMotif] = useState<Motif | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedModel, setSelectedModel] = useState<"kain" | "rok" | "celana">(
    "kain"
  );
  const [qty, setQty] = useState([1]);

  // --- FETCH DATA SAAT LOAD ---
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: matData } = await supabase
          .from("materials")
          .select("*")
          .order("base_price", { ascending: true });
        const { data: motData } = await supabase
          .from("motifs")
          .select("*")
          .order("price_modifier", { ascending: true });
        const { data: colData } = await supabase.from("colors").select("*");

        if (matData) {
          setMaterials(matData);
          setSelectedMaterial(matData[0]); // Default select termurah
        }
        if (motData) {
          setMotifs(motData);
          setSelectedMotif(motData[0]);
        }
        if (colData) {
          setColors(colData);
          setSelectedColor(colData[0]);
        }
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- KALKULASI HARGA ---
  const basePrice = selectedMaterial?.base_price || 0;
  const motifPrice = selectedMotif?.price_modifier || 0;
  const unitPrice = basePrice + motifPrice;
  const totalPrice = unitPrice * qty[0];

  // --- FORMAT CURRENCY ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // --- MODEL SHAPE (CSS CLIP-PATH) ---
  // Ini trik CSS untuk memotong kotak menjadi bentuk rok/celana sederhana
  const getClipPath = () => {
    if (selectedModel === "rok")
      return "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)"; // Trapesium
    if (selectedModel === "celana")
      return "polygon(0 0, 100% 0, 100% 100%, 55% 100%, 50% 40%, 45% 100%, 0 100%)"; // Bentuk Celana
    return "none"; // Kain utuh
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-zinc-500">Memuat Aset Batik...</span>
      </div>
    );
  }

  return (
    <section id="simulasi" className="py-20 bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Studio Simulasi
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Kreasikan batik impianmu dalam 3 langkah mudah.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- KOLOM KIRI: VISUAL PREVIEW --- */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="relative bg-zinc-200 dark:bg-zinc-900 rounded-3xl p-8 min-h-125 flex items-center justify-center shadow-inner overflow-hidden border border-zinc-300 dark:border-zinc-800">
              {/* Background Grid Pattern (Supaya tidak flat) */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#a1a1aa 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* THE CLOTH SIMULATION */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md aspect-3/4 shadow-2xl transition-all duration-500 ease-in-out"
                style={{
                  clipPath: getClipPath(),
                  // Transisi bentuk rok/celana
                }}
              >
                {/* LAYER 1: WARNA DASAR (Kain) */}
                <div
                  className="absolute inset-0 transition-colors duration-500 ease-linear"
                  style={{ backgroundColor: selectedColor?.hex_code || "#fff" }}
                />

                {/* LAYER 2: MOTIF (Overlay) */}
                {/* Menggunakan mix-blend-mode agar motif menyatu dengan warna kain */}
                <div className="absolute inset-0 opacity-80 mix-blend-multiply dark:mix-blend-overlay transition-opacity duration-300">
                  {selectedMotif?.image_url ? (
                    // Dalam real case, ganti src ini dengan selectedMotif.image_url
                    // Disini saya pakai placeholder motif batik karena user belum upload gambar ke Supabase Storage
                    <Image
                      src="/window.svg" // Placeholder sementara (Ganti nanti dengan real URL)
                      alt="Motif Overlay"
                      fill
                      className="object-cover opacity-40 pattern-repeat"
                      style={{ filter: "grayscale(100%) contrast(150%)" }} // Memastikan motif hitam putih agar bisa diwarnai
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* LAYER 3: TEXTURE KAIN (Noise/Shadow untuk realism) */}
                <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />

                {/* Label Model (Hanya bantuan visual) */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="inline-block bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    Mode: {selectedModel.toUpperCase()}
                  </span>
                </div>
              </motion.div>

              {/* Toggle Model Buttons (Floating) */}
              <div className="absolute bottom-6 flex gap-2 bg-white/90 dark:bg-zinc-800/90 p-1.5 rounded-full shadow-lg backdrop-blur-md">
                <Button
                  variant={selectedModel === "kain" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSelectedModel("kain")}
                >
                  Kain
                </Button>
                <Button
                  variant={selectedModel === "rok" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSelectedModel("rok")}
                >
                  Rok
                </Button>
                <Button
                  variant={selectedModel === "celana" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSelectedModel("celana")}
                >
                  Celana
                </Button>
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN: CONTROLS --- */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Konfigurasi Produk</CardTitle>
                <CardDescription>
                  Sesuaikan spesifikasi batik Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. PILIH MOTIF */}
                <div className="space-y-3">
                  <Label>Pilih Motif</Label>
                  <Select
                    onValueChange={(val) =>
                      setSelectedMotif(
                        motifs.find((m) => m.id.toString() === val) || null
                      )
                    }
                    defaultValue={selectedMotif?.id.toString()}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih Motif Batik" />
                    </SelectTrigger>
                    <SelectContent>
                      {motifs.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          <div className="flex justify-between w-full items-center gap-4">
                            <span>{m.name}</span>
                            <span className="text-xs text-amber-600 font-mono">
                              +{formatRupiah(m.price_modifier)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. PILIH BAHAN */}
                <div className="space-y-3">
                  <Label>Jenis Bahan Kain</Label>
                  <Select
                    onValueChange={(val) =>
                      setSelectedMaterial(
                        materials.find((m) => m.id.toString() === val) || null
                      )
                    }
                    defaultValue={selectedMaterial?.id.toString()}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih Bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          <div className="flex justify-between w-full items-center gap-4">
                            <span>{m.name}</span>
                            <span className="text-xs text-zinc-500">
                              {formatRupiah(m.base_price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-500 italic">
                    *Harga bahan mempengaruhi kenyamanan dan kualitas kain.
                  </p>
                </div>

                {/* 3. PILIH WARNA (Visual Selector) */}
                <div className="space-y-3">
                  <Label>Warna Dominan</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black",
                          selectedColor?.id === c.id
                            ? "border-zinc-900 dark:border-white scale-110"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: c.hex_code }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 4. TOTAL HARGA & CHECKOUT */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Jumlah Pesanan (Meter/Pcs)</Label>
                    <span className="font-bold font-mono">{qty[0]}</span>
                  </div>
                  <Slider
                    value={qty}
                    onValueChange={setQty}
                    max={100}
                    min={1}
                    step={1}
                    className="py-4"
                  />

                  <div className="bg-zinc-100 dark:bg-black/40 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Harga Satuan</span>
                      <span>{formatRupiah(unitPrice)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-amber-600">
                      <span>Total Estimasi</span>
                      <span>{formatRupiah(totalPrice)}</span>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Pesan Sekarang
                  </Button>

                  <p className="text-[10px] text-center text-zinc-400">
                    *Harga belum termasuk ongkos kirim. Checkout untuk detail
                    final.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
