"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Script from "next/script"; // Wajib untuk Midtrans
import {
  Loader2,
  ShoppingCart,
  RotateCcw,
  Shirt,
  Check,
  Palette,
  Layers,
  Move,
  ZoomIn,
  ZoomOut,
  X,
  Ban,
  Dices,
  Scaling,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
type PatternSize = "kecil" | "sedang" | "besar";

type PartConfig = {
  material: Material | null;
  motif: Motif | null;
  baseColor: string;
  motifColor: string;
  patternSize: PatternSize;
};

// Warna Default Tambahan
const DEFAULT_COLORS = [
  { id: 998, name: "Hitam Legam", hex_code: "#000000" },
  { id: 999, name: "Putih Tulang", hex_code: "#F5F5F5" },
];

export default function SimulasiEditor() {
  const supabase = createClient();
  const router = useRouter();

  // --- DATA MASTER ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE TRANSAKSI ---
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [qty, setQty] = useState([1]);

  // --- STATE SIMULASI ---
  const [gender, setGender] = useState<"pria" | "wanita">("pria");

  const [topConfig, setTopConfig] = useState<PartConfig>({
    material: null,
    motif: null,
    baseColor: "#FFFFFF",
    motifColor: "#000000",
    patternSize: "sedang",
  });
  const [bottomConfig, setBottomConfig] = useState<PartConfig>({
    material: null,
    motif: null,
    baseColor: "#000000",
    motifColor: "#FFFFFF",
    patternSize: "sedang",
  });

  // --- ZOOM & DRAG STATE ---
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH DATA & INITIALIZATION ---
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

        const combinedColors = [...(colData || []), ...DEFAULT_COLORS];
        const uniqueColors = combinedColors.filter(
          (v, i, a) => a.findIndex((v2) => v2.hex_code === v.hex_code) === i
        );
        setColors(uniqueColors);

        // --- CEK LOCAL STORAGE (RESTORE STATE SETELAH LOGIN) ---
        const savedState = localStorage.getItem("pendingCheckout");
        if (savedState && matData && motData) {
          try {
            const parsed = JSON.parse(savedState);
            // Restore Config
            setTopConfig(parsed.top);
            setBottomConfig(parsed.bottom);
            setQty(parsed.qty);

            // Hapus agar tidak load ulang terus
            localStorage.removeItem("pendingCheckout");

            // Auto open modal checkout
            setTimeout(() => setShowCheckoutModal(true), 500);
          } catch (e) {
            console.error("Gagal restore state", e);
          }
        } else if (matData && motData && uniqueColors.length > 0) {
          // --- DEFAULT VALUES (JIKA TIDAK ADA SAVED STATE) ---
          const black =
            uniqueColors.find((c) => c.hex_code === "#000000") ||
            uniqueColors[0];

          const randomMat = () =>
            matData[Math.floor(Math.random() * matData.length)];
          const randomMotif = () =>
            motData[Math.floor(Math.random() * motData.length)];
          const randomCol = () =>
            uniqueColors[Math.floor(Math.random() * uniqueColors.length)];

          const topBase = randomCol();
          setTopConfig({
            material: randomMat(),
            motif: randomMotif(),
            baseColor: topBase.hex_code,
            motifColor: topBase.hex_code === "#000000" ? "#FFFFFF" : "#000000",
            patternSize: "sedang",
          });

          setBottomConfig({
            material: matData[0],
            motif: null,
            baseColor: black.hex_code,
            motifColor: "#FFFFFF",
            patternSize: "sedang",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- 2. PREVENT SCROLL PAGE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newScale = Math.min(
        Math.max(transform.scale + e.deltaY * -0.001, 0.5),
        3
      );
      setTransform((prev) => ({ ...prev, scale: newScale }));
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [transform.scale]);

  // --- HELPER LOGIC ---
  const getPatternSizePx = (size: PatternSize) => {
    switch (size) {
      case "kecil":
        return "60px";
      case "besar":
        return "200px";
      default:
        return "120px";
    }
  };

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

  const updateConfig = (
    part: "atasan" | "bawahan",
    key: keyof PartConfig,
    value: any
  ) => {
    if (part === "atasan") setTopConfig((prev) => ({ ...prev, [key]: value }));
    else setBottomConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    if (materials.length === 0 || motifs.length === 0 || colors.length === 0)
      return;

    const randomMat = () =>
      materials[Math.floor(Math.random() * materials.length)];
    const randomMotif = () => motifs[Math.floor(Math.random() * motifs.length)];
    const randomCol = () => colors[Math.floor(Math.random() * colors.length)];
    const black = colors.find((c) => c.hex_code === "#000000") || colors[0];

    const topBase = randomCol();
    setTopConfig({
      material: randomMat(),
      motif: randomMotif(),
      baseColor: topBase.hex_code,
      motifColor: topBase.hex_code === "#000000" ? "#FFFFFF" : "#000000",
      patternSize: "sedang",
    });

    setBottomConfig({
      material: materials[0],
      motif: null,
      baseColor: black.hex_code,
      motifColor: "#FFFFFF",
      patternSize: "sedang",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };
  const handleMouseUp = () => setIsDragging(false);

  // --- 3. CHECKOUT & MIDTRANS LOGIC (FINAL UPDATED) ---
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // 1. Cek User Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // A. JIKA BELUM LOGIN
      if (!user) {
        // Simpan state ke LocalStorage
        const stateToSave = {
          top: topConfig,
          bottom: bottomConfig,
          qty: qty,
        };
        localStorage.setItem("pendingCheckout", JSON.stringify(stateToSave));

        // Alert info
        alert(
          "Silakan login atau daftar akun terlebih dahulu untuk melanjutkan pemesanan."
        );

        // Redirect ke login dengan parameter 'next'
        router.push("/login?next=/simulasi");
        return;
      }

      // B. JIKA SUDAH LOGIN, CEK KELENGKAPAN PROFIL
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Validasi Alamat & HP
      if (!profile?.address || !profile?.phone_number) {
        const confirmGoToDashboard = confirm(
          "Data pengiriman (Alamat/No HP) belum lengkap. Lengkapi di Dashboard sekarang?"
        );
        if (confirmGoToDashboard) {
          router.push("/dashboard");
        }
        setIsCheckingOut(false);
        return;
      }

      // C. PROSES ORDER (Create Transaction)
      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const items = [
        {
          order_id: orderData.id,
          material_id: topConfig.material?.id,
          motif_id: topConfig.motif?.id,
          qty: qty[0],
          price_at_purchase: calculatePartPrice(topConfig),
          bottom_hex_code: `Base:${topConfig.baseColor}|Motif:${topConfig.motifColor}|Size:${topConfig.patternSize}|Type:Atasan`,
        },
        {
          order_id: orderData.id,
          material_id: bottomConfig.material?.id,
          motif_id: bottomConfig.motif?.id,
          qty: qty[0],
          price_at_purchase: calculatePartPrice(bottomConfig),
          bottom_hex_code: `Base:${bottomConfig.baseColor}|Motif:${bottomConfig.motifColor}|Size:${bottomConfig.patternSize}|Type:Bawahan`,
        },
      ];
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);
      if (itemsError) throw itemsError;

      // 3. Request Midtrans Token (Internal API)
      const response = await fetch("/api/tokenizer", {
        method: "POST",
        body: JSON.stringify({
          id: orderData.id,
          total: totalPrice,
          user: {
            full_name: profile.full_name || user.email,
            email: user.email,
            phone: profile.phone_number || "08123456789",
          },
        }),
      });

      const { token } = await response.json();
      if (!token) throw new Error("Gagal mendapatkan token pembayaran");

      // 4. Trigger Snap Popup
      window.snap.pay(token, {
        onSuccess: async function (result: any) {
          // [BARU] Panggil API Server untuk update status agar reliable & aman
          await fetch("/api/orders/update-status", {
            method: "POST",
            body: JSON.stringify({ orderId: orderData.id }),
          });

          alert("Pembayaran Berhasil! Mengalihkan ke dashboard...");
          router.push("/dashboard");
        },
        onPending: function (result: any) {
          alert("Menunggu pembayaran... Silakan cek dashboard.");
          router.push("/dashboard");
        },
        onError: function (result: any) {
          alert("Pembayaran gagal!");
          router.push("/dashboard");
        },
        onClose: function () {
          alert(
            "Anda belum menyelesaikan pembayaran. Cek dashboard untuk bayar nanti."
          );
          router.push("/dashboard");
        },
      });
    } catch (e: any) {
      alert("Proses Gagal: " + e.message);
    } finally {
      setIsCheckingOut(false);
      setShowCheckoutModal(false);
    }
  };

  // --- VISUALISASI ---
  const renderLayer = (type: "top" | "bottom") => {
    const config = type === "top" ? topConfig : bottomConfig;
    const maskImage = `/images/${gender}/mask-${type}.png`;
    const shadowImage = `/images/${gender}/shadow-${type}.png`;
    const patternSizePx = getPatternSizePx(config.patternSize);

    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div
          className="absolute inset-0 z-10"
          style={{
            maskImage: `url('${maskImage}')`,
            WebkitMaskImage: `url('${maskImage}')`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          {/* Base Color */}
          <div
            className="absolute inset-0 w-full h-full transition-colors duration-300"
            style={{ backgroundColor: config.baseColor }}
          />

          {/* Motif Layer */}
          {config.motif?.image_url && (
            <>
              {/* Layer 1: Masking */}
              <div
                className="absolute inset-0 w-full h-full transition-all duration-300 z-10"
                style={{
                  backgroundColor: config.motifColor,
                  maskImage: `url('${config.motif.image_url}')`,
                  WebkitMaskImage: `url('${config.motif.image_url}')`,
                  maskSize: patternSizePx,
                  WebkitMaskSize: patternSizePx,
                  maskRepeat: "repeat",
                  WebkitMaskRepeat: "repeat",
                  maskPosition: "center",
                }}
              />
              {/* Layer 2: Fallback Multiply */}
              <div
                className="absolute inset-0 w-full h-full z-0 mix-blend-multiply opacity-80 transition-all duration-300"
                style={{
                  backgroundImage: `url('${config.motif.image_url}')`,
                  backgroundSize: patternSizePx,
                  backgroundRepeat: "repeat",
                  backgroundPosition: "center",
                  display: config.motifColor === "#000000" ? "block" : "none",
                }}
              />
            </>
          )}
        </div>

        {/* Shadow */}
        <div className="absolute inset-0 z-20 mix-blend-multiply opacity-60">
          <Image
            src={shadowImage}
            alt="Shadow"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  };

  // --- PANEL ---
  const ConfigPanel = ({
    type,
    title,
  }: {
    type: "atasan" | "bawahan";
    title: string;
  }) => {
    const isTop = type === "atasan";
    const config = isTop ? topConfig : bottomConfig;

    return (
      <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
        <CardHeader className="pb-2 border-b px-4 pt-4 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            {isTop ? (
              <Shirt className="w-4 h-4" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
            {title}
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 pb-20">
            {/* 1. BAHAN */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-zinc-500">
                Bahan Kain
              </Label>
              <Select
                value={config.material?.id.toString()}
                onValueChange={(val) =>
                  updateConfig(
                    type,
                    "material",
                    materials.find((m) => m.id.toString() === val)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Bahan" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} (+{formatRupiah(m.base_price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* 2. MOTIF */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-zinc-500">
                Motif Batik
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig(type, "motif", null)}
                  className={cn(
                    "relative aspect-square rounded-md border flex flex-col items-center justify-center gap-1 transition-all bg-zinc-50 dark:bg-zinc-800",
                    config.motif === null
                      ? "ring-2 ring-amber-600 border-amber-600"
                      : "hover:border-amber-400 border-zinc-200"
                  )}
                >
                  <Ban className="w-6 h-6 text-zinc-400" />
                  <span className="text-[9px] text-zinc-500 font-medium">
                    Tanpa Motif
                  </span>
                  {config.motif === null && (
                    <div className="absolute top-1 right-1 bg-amber-600 rounded-full p-0.5">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>

                {motifs.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateConfig(type, "motif", m)}
                    className={cn(
                      "relative aspect-square rounded-md border overflow-hidden transition-all bg-zinc-100",
                      config.motif?.id === m.id
                        ? "ring-2 ring-amber-600 border-amber-600"
                        : "hover:border-amber-400 border-zinc-200"
                    )}
                  >
                    <Image
                      src={m.image_url}
                      alt={m.name}
                      fill
                      className="object-cover p-1"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    {config.motif?.id === m.id && (
                      <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                    <div className="absolute bottom-0 w-full bg-black/70 text-[8px] text-white p-1 truncate text-center">
                      {m.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. UKURAN MOTIF */}
            {config.motif && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-semibold uppercase text-zinc-500 flex items-center gap-1">
                  <Scaling className="w-3 h-3" /> Ukuran Motif
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["kecil", "sedang", "besar"] as PatternSize[]).map(
                    (size) => (
                      <Button
                        key={size}
                        variant={
                          config.patternSize === size ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => updateConfig(type, "patternSize", size)}
                        className={cn(
                          "text-xs h-8",
                          config.patternSize === size
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* 4. WARNA */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold uppercase text-zinc-500">
                    Warna Kain Dasar
                  </Label>
                  <div
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: config.baseColor }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={`base-${c.id}`}
                      onClick={() =>
                        updateConfig(type, "baseColor", c.hex_code)
                      }
                      className={cn(
                        "w-7 h-7 rounded-full border border-zinc-200 shadow-sm transition-transform hover:scale-110",
                        config.baseColor === c.hex_code &&
                          "ring-2 ring-offset-2 ring-zinc-900 scale-110"
                      )}
                      style={{ backgroundColor: c.hex_code }}
                      title={`Kain: ${c.name}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "space-y-2",
                  config.motif === null && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold uppercase text-zinc-500">
                    Warna Corak Motif
                  </Label>
                  <div
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: config.motifColor }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={`motif-${c.id}`}
                      onClick={() =>
                        updateConfig(type, "motifColor", c.hex_code)
                      }
                      className={cn(
                        "w-7 h-7 rounded-full border border-zinc-200 shadow-sm transition-transform hover:scale-110",
                        config.motifColor === c.hex_code &&
                          "ring-2 ring-offset-2 ring-amber-600 scale-110"
                      )}
                      style={{ backgroundColor: c.hex_code }}
                      title={`Motif: ${c.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    );
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
      </div>
    );

  return (
    <section className="bg-zinc-50 dark:bg-black min-h-screen flex flex-col relative overflow-hidden">
      {/* Script Midtrans (Penting!) */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_URL}
        strategy="afterInteractive"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur border-b h-16 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="hover:bg-zinc-100"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-serif font-bold text-zinc-900 dark:text-amber-500">
              Atelier Batik
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Simulasi Pesanan
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRandomize}
            className="hidden sm:flex items-center gap-2 mr-2 border-amber-500 text-amber-600 hover:bg-amber-50"
          >
            <Dices className="w-4 h-4" /> Acak Atasan
          </Button>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <Button
              size="sm"
              variant={gender === "pria" ? "default" : "ghost"}
              onClick={() => setGender("pria")}
              className={
                gender === "pria" ? "bg-amber-700 hover:bg-amber-800" : ""
              }
            >
              Pria
            </Button>
            <Button
              size="sm"
              variant={gender === "wanita" ? "default" : "ghost"}
              onClick={() => setGender("wanita")}
              className={
                gender === "wanita" ? "bg-amber-700 hover:bg-amber-800" : ""
              }
            >
              Wanita
            </Button>
          </div>
        </div>
      </div>

      {/* GRID UTAMA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 pt-16 h-screen">
        {/* KIRI */}
        <div className="hidden lg:block lg:col-span-3 border-r bg-white dark:bg-zinc-950 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <ConfigPanel type="atasan" title="Atasan (Kemeja)" />
        </div>

        {/* TENGAH (MODEL) */}
        <div
          ref={canvasRef}
          className="col-span-1 lg:col-span-6 relative bg-zinc-200 dark:bg-zinc-900 overflow-hidden cursor-move active:cursor-grabbing select-none group"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/file.svg')] bg-repeat space-x-2" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-300/20 dark:to-black/40 pointer-events-none" />

          <div className="w-full h-full flex items-center justify-center">
            <div
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transition: isDragging
                  ? "none"
                  : "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
              className="relative w-[400px] h-[650px] filter drop-shadow-2xl"
            >
              <Image
                src={`/images/${gender}/base.png`}
                alt="Model Base"
                fill
                className="object-contain pointer-events-none z-0"
                priority
              />
              {renderLayer("top")}
              {renderLayer("bottom")}
            </div>
          </div>

          <div className="absolute bottom-32 lg:bottom-12 right-6 flex flex-col gap-2 bg-white/90 dark:bg-zinc-800/90 p-1.5 rounded-xl shadow-xl border border-white/20 backdrop-blur">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-100"
              onClick={() =>
                setTransform((p) => ({
                  ...p,
                  scale: Math.min(p.scale + 0.2, 3),
                }))
              }
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-bold text-center select-none">
              {Math.round(transform.scale * 100)}%
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-100"
              onClick={() =>
                setTransform((p) => ({
                  ...p,
                  scale: Math.max(p.scale - 0.2, 0.5),
                }))
              }
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Separator className="my-1" />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-100 text-amber-600"
              onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
              title="Reset"
            >
              <Move className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KANAN */}
        <div className="hidden lg:block lg:col-span-3 border-l bg-white dark:bg-zinc-950 z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <ConfigPanel type="bawahan" title="Bawahan (Celana/Rok)" />
        </div>
      </div>

      {/* FLOATING CHECKOUT */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
        <button
          onClick={() => setShowCheckoutModal(true)}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-2xl p-2 pl-6 pr-2 flex items-center justify-between group hover:scale-[1.02] transition-transform border border-zinc-700/50"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">
              Total Estimasi
            </span>
            <span className="text-lg font-mono font-bold leading-tight">
              {formatRupiah(totalPrice)}
            </span>
          </div>
          <div className="bg-amber-600 group-hover:bg-amber-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors">
            Checkout <ShoppingCart className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* MODAL CHECKOUT */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Konfirmasi Pesanan
            </DialogTitle>
            <DialogDescription>Periksa kembali pesanan Anda.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3 border">
              {/* Atasan Detail */}
              <div className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <Shirt className="w-3 h-3" /> Atasan
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {topConfig.material?.name}
                    {topConfig.motif
                      ? `, ${topConfig.motif.name}`
                      : ", Tanpa Motif"}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: topConfig.baseColor }}
                      title="Kain"
                    />
                    {topConfig.motif && (
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: topConfig.motifColor }}
                        title="Motif"
                      />
                    )}
                  </div>
                </div>
                <span className="font-mono">
                  {formatRupiah(calculatePartPrice(topConfig))}
                </span>
              </div>

              <Separator />

              {/* Bawahan Detail */}
              <div className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Bawahan
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {bottomConfig.material?.name}
                    {bottomConfig.motif
                      ? `, ${bottomConfig.motif.name}`
                      : ", Tanpa Motif"}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: bottomConfig.baseColor }}
                      title="Kain"
                    />
                    {bottomConfig.motif && (
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: bottomConfig.motifColor }}
                        title="Motif"
                      />
                    )}
                  </div>
                </div>
                <span className="font-mono">
                  {formatRupiah(calculatePartPrice(bottomConfig))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <Label>Jumlah Pesanan</Label>
              <div className="flex items-center gap-3 border rounded-md px-1 bg-white dark:bg-black">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setQty([Math.max(1, qty[0] - 1)])}
                >
                  -
                </Button>
                <span className="font-bold w-4 text-center">{qty[0]}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setQty([qty[0] + 1])}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <div className="flex justify-between items-center w-full mb-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                Total Tagihan
              </span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <Button
              className="w-full h-11 text-base bg-amber-600 hover:bg-amber-700"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Bayar Sekarang"
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowCheckoutModal(false)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
