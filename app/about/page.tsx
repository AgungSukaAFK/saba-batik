import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Heart, Code, Music, BookOpen, Coffee } from "lucide-react";

// --- DATA ANGGOTA KELOMPOK (EDIT DISINI) ---
const teamMembers = [
  {
    id: 1,
    name: "M. Agung Maulana", // Contoh, sesuaikan dengan nama aslimu
    npm: "2025430001",
    role: "Lead Developer",
    photo: "/team/member-1.jpg", // Ganti dengan path foto aslimu nanti
    hobby: "Coding & Swimming",
    motto: "Talk is cheap. Show me the code.",
    icon: Code, // Ikon hobi (bisa diganti)
  },
  {
    id: 2,
    name: "Anggota Dua",
    npm: "2025430002",
    role: "UI/UX Designer",
    photo: "/team/member-2.jpg",
    hobby: "Sketching",
    motto: "Design is not just what it looks like, it's how it works.",
    icon: Heart,
  },
  {
    id: 3,
    name: "Anggota Tiga",
    npm: "2025430003",
    role: "System Analyst",
    photo: "/team/member-3.jpg",
    hobby: "Membaca Buku",
    motto: "Stay hungry, stay foolish.",
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Anggota Empat",
    npm: "2025430004",
    role: "Database Engineer",
    photo: "/team/member-4.jpg",
    hobby: "Traveling & Kopi",
    motto: "Life begins at the end of your comfort zone.",
    icon: Coffee,
  },
  {
    id: 5,
    name: "Anggota Lima",
    npm: "2025430005",
    role: "Project Manager",
    photo: "/team/member-5.jpg",
    hobby: "Musik",
    motto: "Simplicity is the ultimate sophistication.",
    icon: Music,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-amber-200 dark:selection:bg-amber-900">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-16 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 font-serif">
          Di Balik Layar <span className="text-amber-600">Saba Batik</span>
        </h1>
        <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
          Kami adalah sekelompok mahasiswa yang berdedikasi untuk melestarikan
          budaya batik melalui inovasi teknologi digital.
        </p>
      </section>

      {/* Team Grid */}
      <section className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {/* Foto Anggota */}
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale"
                  // Note: Hapus 'grayscale' di class di atas jika ingin foto selalu berwarna
                />

                {/* Overlay Gradient (Muncul saat hover) */}
                <div className="absolute inset-0 bg-linear-to-t from-amber-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="relative p-6 text-center -mt-12">
                {/* Badge NPM (Floating) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge
                    variant="secondary"
                    className="px-4 py-1 bg-white dark:bg-zinc-800 shadow-md border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  >
                    {member.npm}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-sm text-amber-600 font-medium">
                      {member.role}
                    </p>
                  </div>

                  {/* Moto Hidup */}
                  <div className="relative bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <Quote className="absolute top-2 left-2 w-4 h-4 text-amber-600/40 transform rotate-180" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic px-2">
                      "{member.motto}"
                    </p>
                  </div>

                  {/* Hobi Section */}
                  <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-500 text-sm pt-2">
                    <member.icon className="w-4 h-4" />
                    <span>Hobi: {member.hobby}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
