"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ShoppingCart, RotateCcw, Shirt, Check } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// --- TIPE DATA ---
type Material = { id: number; name: string; base_price: number };
type Motif = {
  id: number;
  name: string;
  price_modifier: number;
  image_url: string;
};
type Color = { id: number; name: string; hex_code: string };

type PartConfig = {
  material: Material | null;
  motif: Motif | null;
  color: Color | null;
};

export default function SimulasiEditor() {
  const supabase = createClient();

  // --- DATA MASTER ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE SIMULASI ---
  const [gender, setGender] = useState<"pria" | "wanita">("pria");
  const [activeTab, setActiveTab] = useState<"atasan" | "bawahan">("atasan");

  // Konfigurasi Terpisah
  const [topConfig, setTopConfig] = useState<PartConfig>({
    material: null,
    motif: null,
    color: null,
  });
  const [bottomConfig, setBottomConfig] = useState<PartConfig>({
    material: null,
    motif: null,
    color: null,
  });

  const [qty, setQty] = useState([1]);

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: matData } = await supabase
          .from("materials")
          .select("*")
          .order("base_price");
        const { data: motData } = await supabase
          .from("motifs")
          .select("*")
          .order("price_modifier");
        const { data: colData } = await supabase.from("colors").select("*");

        if (matData) setMaterials(matData);
        if (motData) setMotifs(motData);
        if (colData) setColors(colData);

        // Set Default Values
        if (matData && motData && colData && matData.length > 0) {
          const defaults = {
            material: matData[0],
            motif: motData[0],
            color: colData[0],
          };
          setTopConfig(defaults);
          setBottomConfig(defaults);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- KALKULASI HARGA ---
  const calculatePartPrice = (config: PartConfig) => {
    return (
      (config.material?.base_price || 0) + (config.motif?.price_modifier || 0)
    );
  };

  const unitPrice =
    calculatePartPrice(topConfig) + calculatePartPrice(bottomConfig);
  const totalPrice = unitPrice * qty[0];

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  // --- HELPER UPDATE ---
  const updateConfig = (
    part: "atasan" | "bawahan",
    key: keyof PartConfig,
    value: any
  ) => {
    if (part === "atasan") {
      setTopConfig((prev) => ({ ...prev, [key]: value }));
    } else {
      setBottomConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  // --- RENDER LAYER (VISUAL CORE) ---
  const renderLayer = (type: "top" | "bottom") => {
    const config = type === "top" ? topConfig : bottomConfig;

    // Path aset disesuaikan dengan folder public/images yang baru
    const maskImage = `/images/${gender}/mask-${type}.png`;
    const shadowImage = `/images/${gender}/shadow-${type}.png`;

    return (
      <>
        {/* 1. LAYER WARNA & MOTIF (Masking) */}
        <div
          className="absolute inset-0 z-10 transition-all duration-300"
          style={{
            // Logika Masking: Memotong kotak menjadi bentuk baju
            maskImage: `url('${maskImage}')`,
            WebkitMaskImage: `url('${maskImage}')`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            // Warna Dasar Kain
            backgroundColor: config.color?.hex_code || "#fff",
          }}
        >
          {/* Texture Motif Batik (Tiled & Multiply) */}
          {config.motif?.image_url && (
            <div
              className="absolute inset-0 opacity-80 mix-blend-multiply"
              style={{
                backgroundImage: `url('${config.motif.image_url}')`,
                backgroundSize: "120px", // Ukuran tile motif
                backgroundRepeat: "repeat",
                // Filter agar motif hitam-putih terlihat tajam di atas warna
                filter: "contrast(1.1)",
              }}
            />
          )}
        </div>

        {/* 2. LAYER SHADOW (Lipatan Baju) */}
        <div className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-90">
          <Image
            src={shadowImage}
            alt={`${type} shadow`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </>
    );
  };

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <section className="py-8 lg:py-12 bg-zinc-50 dark:bg-black min-h-screen">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* --- KIRI: VISUAL PREVIEW --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative min-h-[600px] flex items-center justify-center">
              {/* Background Studio */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />

              {/* --- MODEL UTAMA --- */}
              <div className="relative w-full h-[600px] max-w-lg mx-auto">
                {/* BASE MODEL (Orang) */}
                <Image
                  src={`/images/${gender}/base.png`}
                  alt="Model Base"
                  fill
                  className="object-contain z-0"
                  priority
                />

                {/* LAYERS PAKAIAN */}
                {renderLayer("top")}
                {renderLayer("bottom")}
              </div>

              {/* Tombol Ganti Gender */}
              <div className="absolute top-6 left-6 flex gap-2 z-30">
                <Button
                  size="sm"
                  variant={gender === "pria" ? "default" : "secondary"}
                  onClick={() => setGender("pria")}
                  className="rounded-full shadow-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur text-zinc-900 dark:text-white hover:bg-white"
                >
                  Pria
                </Button>
                <Button
                  size="sm"
                  variant={gender === "wanita" ? "default" : "secondary"}
                  onClick={() => setGender("wanita")}
                  className="rounded-full shadow-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur text-zinc-900 dark:text-white hover:bg-white"
                >
                  Wanita
                </Button>
              </div>
            </div>
          </div>

          {/* --- KANAN: KONTROL --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold font-serif mb-2 text-zinc-900 dark:text-white">
                Atelier Simulasi
              </h1>
              <p className="text-zinc-500">
                Sesuaikan motif, warna, dan bahan untuk atasan dan bawahan.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-zinc-100 dark:bg-zinc-800/50">
                <TabsTrigger value="atasan">Konfigurasi Atasan</TabsTrigger>
                <TabsTrigger value="bawahan">Konfigurasi Bawahan</TabsTrigger>
              </TabsList>

              {["atasan", "bawahan"].map((part) => {
                const isTop = part === "atasan";
                const config = isTop ? topConfig : bottomConfig;

                return (
                  <TabsContent
                    key={part}
                    value={part}
                    className="space-y-6 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Shirt className="w-5 h-5 text-amber-600" />
                          Pilih {isTop ? "Atasan" : "Bawahan"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* 1. PILIH MOTIF */}
                        <div className="space-y-3">
                          <Label>Motif Batik</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {motifs.map((m) => (
                              <div
                                key={m.id}
                                onClick={() =>
                                  updateConfig(
                                    isTop ? "atasan" : "bawahan",
                                    "motif",
                                    m
                                  )
                                }
                                className={cn(
                                  "cursor-pointer rounded-xl border-2 p-2 transition-all hover:border-amber-400 relative overflow-hidden group aspect-square flex flex-col items-center justify-between",
                                  config.motif?.id === m.id
                                    ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                    : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                                )}
                              >
                                <div className="relative w-full h-full rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src={m.image_url}
                                    alt={m.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-[10px] text-center font-medium line-clamp-1 w-full truncate">
                                  {m.name}
                                </span>

                                {config.motif?.id === m.id && (
                                  <div className="absolute top-2 right-2 bg-amber-600 rounded-full p-1 shadow-sm">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. PILIH WARNA */}
                        <div className="space-y-3">
                          <Label>Warna Kain</Label>
                          <div className="flex flex-wrap gap-3">
                            {colors.map((c) => (
                              <button
                                key={c.id}
                                onClick={() =>
                                  updateConfig(
                                    isTop ? "atasan" : "bawahan",
                                    "color",
                                    c
                                  )
                                }
                                className={cn(
                                  "w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 dark:ring-offset-zinc-900 border border-black/5 dark:border-white/10",
                                  config.color?.id === c.id
                                    ? "ring-zinc-900 dark:ring-white scale-110"
                                    : "ring-transparent"
                                )}
                                style={{ backgroundColor: c.hex_code }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 3. PILIH BAHAN */}
                        <div className="space-y-3">
                          <Label>Jenis Bahan</Label>
                          <Select
                            value={config.material?.id.toString()}
                            onValueChange={(val) =>
                              updateConfig(
                                isTop ? "atasan" : "bawahan",
                                "material",
                                materials.find((m) => m.id.toString() === val)
                              )
                            }
                          >
                            <SelectTrigger className="h-12 bg-white dark:bg-zinc-900">
                              <SelectValue placeholder="Pilih Bahan Kain" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id.toString()}>
                                  {m.name}{" "}
                                  <span className="text-zinc-400 text-xs ml-2">
                                    (+{formatRupiah(m.base_price)})
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            {/* TOTAL & CHECKOUT */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg sticky bottom-6 z-40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-zinc-500 text-xs uppercase tracking-wider">
                    Total Estimasi
                  </Label>
                  <div className="text-3xl font-bold text-amber-600">
                    {formatRupiah(totalPrice)}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQty([Math.max(1, qty[0] - 1)])}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-bold">{qty[0]}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQty([qty[0] + 1])}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button className="flex-[2] bg-amber-600 hover:bg-amber-700 h-12 text-lg shadow-lg shadow-amber-600/20">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
