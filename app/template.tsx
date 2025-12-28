"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} // Mulai dari geser kanan sedikit & transparan
      animate={{ x: 0, opacity: 1 }} // Masuk ke posisi normal & jelas
      exit={{ x: -20, opacity: 0 }} // (Opsional) Keluar ke kiri
      transition={{ ease: "easeInOut", duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
