"use client";

import { Globe, Shield, Award, CheckCircle, Star, ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const certifications = [
  { icon: Shield, label: "ISO 9001:2015", desc: "Quality Management" },
  { icon: Award, label: "ISO 14001", desc: "Environmental" },
  { icon: CheckCircle, label: "SA8000", desc: "Social Accountability" },
];

const testimonials = [
  {
    quote: "Redujimos un 34% nuestros costes de sourcing en 6 meses. Su equipo en China nos ahorró semanas de gestión.",
    author: "María G., Directora de Compras",
    company: "Sector Textil · España",
  },
  {
    quote: "La visibilidad Tier-2 que nos dieron fue un game-changer. Detectaron un problema de calidad antes de que llegara al puerto.",
    author: "Carlos R., COO",
    company: "Industria · España",
  },
  {
    quote: "El ROI fue positivo desde el primer trimestre. Sin WTA no hubiéramos podido diversificar a Vietnam.",
    author: "Ana P., CFO",
    company: "MedTech · España",
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      {/* Social Proof Bar */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Certificaciones y Cumplimiento
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {certifications.map((cert) => (
            <div
              key={cert.label}
              className="flex items-center gap-3 rounded-lg border bg-white px-5 py-3 shadow-sm"
            >
              <cert.icon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{cert.label}</p>
                <p className="text-xs text-muted-foreground">{cert.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Testimonials */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Lo que dicen nuestros clientes
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-4 text-sm italic text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                <p className="text-xs text-muted-foreground">{t.company}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <a
            href="https://worldtradeasian.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
              World Trade Asian
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Herramientas gratuitas para importadores · Respaldado por{" "}
            <a href="https://worldtradeasian.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              worldtradeasian.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} World Trade Asian. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
