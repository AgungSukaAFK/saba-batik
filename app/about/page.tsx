import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Heart, Code, BookOpen, Coffee, Gamepad } from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "M. Agung Maulana",
    npm: "1101221114",
    role: "Lead Developer",
    photo: "/images/anggota/agung.jpeg",
    hobby: "Coding, Swimming, Gaming, Loving, Sabung Ayam",
    motto: "Talk is cheap. Show me the code.",
    icon: Code,
  },
  {
    id: 2,
    name: "Yofa Firmansyah",
    npm: "1101221182",
    role: "UI/UX Designer",
    photo: "/images/anggota/yofa.jpeg",
    hobby: "Swimming",
    motto:
      "Tetap lakuin apa yang menurut lo baik selagi ga ngerugiin orang lain.",
    icon: Heart,
  },
  {
    id: 3,
    name: "Nur Dela Handayani",
    npm: "1102221016",
    role: "System Analyst",
    photo: "/images/anggota/dela.jpeg",
    hobby: "Membaca Buku",
    motto: "Temukan kebahagiaan dalam hal-hal sederhana.",
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Hanipah",
    npm: "1102221026",
    role: "Database Engineer",
    photo: "/images/anggota/hani.jpeg",
    hobby: "Memasak",
    motto: "Don't rely on the past because what you will face is the future.",
    icon: Coffee,
  },
  {
    id: 5,
    name: "Febri Ari Wijaya",
    npm: "1101221132",
    role: "QA Engineer",
    photo: "/images/anggota/febri.jpeg",
    hobby: "Gaming",
    motto: "Hidup untuk belajar, belajar untuk hidup.",
    icon: Gamepad,
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
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
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
