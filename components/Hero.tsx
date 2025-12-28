"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Palette, Scissors } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor - Gradient Blobs */}
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-amber-400/20 rounded-full blur-[100px] opacity-50 translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 -z-10 w-100 h-100 bg-blue-400/10 rounded-full blur-[80px] opacity-30 -translate-x-1/3 translate-y-1/4" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              Teknologi Simulasi Batik No.1
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
              Lestarikan Budaya, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-orange-500">
                Rancang Karyamu.
              </span>
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Kombinasikan motif tradisional dengan gaya modern secara
              real-time. Pilih bahan, sesuaikan warna, dan lihat estimasi harga
              transparan dalam hitungan detik.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white text-base"
              >
                Mulai Desain Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-8 border-zinc-200 dark:border-zinc-800"
              >
                Pelajari Cara Kerja
              </Button>
            </div>

            {/* Stats / Trust */}
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-zinc-500 dark:text-zinc-500">
              <div className="flex items-center gap-2">
                <Layers size={18} />
                <span className="text-sm font-medium">Multi-Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette size={18} />
                <span className="text-sm font-medium">Custom Warna</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors size={18} />
                <span className="text-sm font-medium">8+ Jenis Kain</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual (Abstract Representation of App) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            <div className="relative aspect-square md:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {/* Mockup UI Interface */}
              <div className="absolute inset-0 flex flex-col">
                {/* Header Mockup */}
                <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                {/* Body Mockup */}
                <div className="flex-1 flex bg-white dark:bg-zinc-950 relative">
                  {/* Sidebar Palette */}
                  <div className="w-16 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-6 gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-600 ring-2 ring-offset-2 ring-amber-600 ring-offset-white dark:ring-offset-black"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 opacity-50 grayscale"></div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 opacity-50 grayscale"></div>
                  </div>
                  {/* Canvas Area (Abstract Batik Pattern) */}
                  <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
                    <div
                      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    ></div>

                    {/* Floating Cards (Simulasi Layers) */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "easeInOut",
                      }}
                      className="w-48 h-64 bg-amber-100 dark:bg-amber-900/20 rounded-lg border-2 border-amber-600/30 flex items-center justify-center relative z-10 backdrop-blur-sm"
                    >
                      <span className="text-amber-700 dark:text-amber-500 font-serif italic text-xl">
                        Motif Semen
                      </span>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -15, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 5,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                      className="absolute w-40 h-56 bg-zinc-900/5 dark:bg-white/5 rounded-lg border border-dashed border-zinc-400 dark:border-zinc-600 -rotate-6 z-0"
                    />
                  </div>
                </div>

                {/* Floating Price Tag */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 flex flex-col"
                >
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">
                    Estimasi Harga
                  </span>
                  <span className="font-bold text-lg text-zinc-900 dark:text-white">
                    Rp 185.000
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
