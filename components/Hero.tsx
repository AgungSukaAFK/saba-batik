"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Layers,
  Palette,
  Scissors,
  Sparkles,
  BookOpen,
} from "lucide-react"; // Tambah Icon BookOpen
import { motion, AnimatePresence } from "framer-motion";

const DEMO_LOOKS = [
  {
    id: 1,
    name: "Semen Merah",
    color: "#B91C1C",
    pattern: "/images/batik/semen.webp",
    price: "Rp 185.000",
  },
  {
    id: 2,
    name: "Liong Biru",
    color: "#1D4ED8",
    pattern: "/images/batik/liong.webp",
    price: "Rp 210.000",
  },
  {
    id: 3,
    name: "Hokokai Hitam",
    color: "#18181B",
    pattern: "/images/batik/hokokai.webp",
    price: "Rp 250.000",
  },
];

export default function Hero() {
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const activeLook = DEMO_LOOKS[activeLookIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % DEMO_LOOKS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-12 lg:py-0 lg:h-screen flex items-center overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-150 h-150 bg-amber-400/20 rounded-full blur-[100px] opacity-50 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-100 h-100 bg-blue-400/10 rounded-full blur-[80px] opacity-30 -translate-x-1/3 translate-y-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 h-full flex items-center">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">
          {/* TEKS KIRI */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium border border-amber-200 dark:border-amber-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              Teknologi Simulasi Batik No.1 Dari Cipocok
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15] font-serif">
              Lestarikan Budaya, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                Rancang Karyamu.
              </span>
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Platform simulasi batik pertama yang memungkinkan Anda memadukan
              motif tradisional nusantara dengan gaya modern secara real-time.
            </p>

            {/* TOMBOL ACTION (UPDATED) */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white text-base shadow-lg shadow-amber-900/20 w-full sm:w-auto transition-all hover:scale-105"
                asChild
              >
                <Link href="/simulasi">
                  Mulai Desain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-14 px-8 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur w-full sm:w-auto hover:bg-white dark:hover:bg-zinc-800 transition-all"
                asChild
              >
                <Link href="/gallery">Lihat Galeri</Link>
              </Button>

              {/* TOMBOL BARU: TENTANG KAMI */}
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full h-14 px-6 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 w-full sm:w-auto transition-colors"
                asChild
              >
                <Link href="/about">
                  <BookOpen className="mr-2 h-4 w-4" /> Tentang Kami
                </Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-12 text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Layers size={18} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium">Layer Realistis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Palette size={18} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium">Warna Dinamis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Scissors size={18} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium">Custom Size</span>
              </div>
            </div>
          </motion.div>

          {/* VISUAL KANAN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-[450px] lg:max-w-[500px] relative z-10"
          >
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-zinc-800">
              <div className="absolute inset-0 opacity-[0.05] bg-[url('/file.svg')] bg-repeat space-x-2" />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/0 to-zinc-200/50 dark:to-black/50" />

              <div className="absolute inset-0 flex items-end justify-center pb-0">
                <div className="relative w-[90%] h-[90%]">
                  <Image
                    src="/images/pria/base.png"
                    alt="Model Base"
                    fill
                    className="object-contain object-bottom z-0"
                    priority
                  />

                  <div className="absolute inset-0 z-10">
                    <motion.div
                      animate={{ backgroundColor: activeLook.color }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full"
                      style={{
                        maskImage: `url('/images/pria/mask-top.png')`,
                        WebkitMaskImage: `url('/images/pria/mask-top.png')`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskPosition: "bottom",
                        WebkitMaskPosition: "bottom",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeLook.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 w-full h-full mix-blend-multiply opacity-90"
                          style={{
                            backgroundImage: `url('${activeLook.pattern}')`,
                            backgroundSize: "120px",
                            backgroundRepeat: "repeat",
                          }}
                        />
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  <div className="absolute inset-0 z-20 mix-blend-multiply opacity-80 pointer-events-none">
                    <Image
                      src="/images/pria/shadow-top.png"
                      alt="Shadow"
                      fill
                      className="object-contain object-bottom"
                    />
                  </div>

                  <div className="absolute inset-0 z-10">
                    <div
                      className="absolute inset-0 bg-zinc-900"
                      style={{
                        maskImage: `url('/images/pria/mask-bottom.png')`,
                        WebkitMaskImage: `url('/images/pria/mask-bottom.png')`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskPosition: "bottom",
                        WebkitMaskPosition: "bottom",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                      }}
                    />
                    <Image
                      src="/images/pria/shadow-bottom.png"
                      alt="Shadow"
                      fill
                      className="object-contain object-bottom z-20 mix-blend-multiply opacity-80"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
                {DEMO_LOOKS.map((look, idx) => (
                  <motion.div
                    key={look.id}
                    animate={{
                      scale: activeLookIndex === idx ? 1.2 : 1,
                      opacity: activeLookIndex === idx ? 1 : 0.5,
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer"
                    style={{ backgroundColor: look.color }}
                    onClick={() => setActiveLookIndex(idx)}
                  />
                ))}
              </div>

              <motion.div
                key={activeLook.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute bottom-8 left-8 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4 max-w-[80%] z-30"
              >
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    Sedang Ditampilkan
                  </p>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {activeLook.name}
                  </h3>
                  <p className="text-xs text-amber-600 font-mono mt-0.5">
                    {activeLook.price}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-[3rem] opacity-20 blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
