import Image from "next/image";
import { Montserrat } from "next/font/google";
import { LeadForm } from "@/components/lead-form";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative flex h-[400px] items-center justify-center bg-[#d9dea5] px-4 overflow-hidden">
        {/* Side image — hidden on mobile */}
        <div className="absolute left-0 top-0 hidden 2xl:block h-full">
          <Image
            src="/banner-side.jpg"
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            className="h-full w-auto object-cover"
            priority
          />
        </div>
        <div className="w-full max-w-3xl flex flex-col gap-6 space-y-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={50}
            className="object-contain"
            priority
          />
          <h1 className={`${montserrat.className} text-4xl font-bold leading-tight text-primary sm:text-5xl`}>
            Get An Assessment <br />Of Your Immigration Case
          </h1>
        </div>
      </div>

      {/* ── Public Lead Form ─────────────────────────────────────────────── */}
      <div className="py-16">
        <LeadForm />
      </div>
    </main>
  );
}
