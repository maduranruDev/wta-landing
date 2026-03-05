"use client";

import { ArrowDown, Calculator, BarChart3, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tools = [
  { icon: Calculator, label: "Landed Cost", href: "#landed-cost", color: "bg-blue-50 text-blue-700" },
  { icon: BarChart3, label: "ROI Sourcing", href: "#roi-sourcing", color: "bg-emerald-50 text-emerald-700" },
  { icon: ShieldCheck, label: "Risk Assessment", href: "#risk-assessment", color: "bg-amber-50 text-amber-700" },
  { icon: Activity, label: "KPI Dashboard", href: "#kpi-dashboard", color: "bg-purple-50 text-purple-700" },
];

const stats = [
  { value: "+15 años", label: "de experiencia en Asia" },
  { value: "150+", label: "fábricas homologadas" },
  { value: "120+", label: "clientes activos" },
  { value: "98%", label: "de resolución en 30 días" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYmU3ZmYiIGZpbGwtb3BhY2l0eT0iMC41Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 border-blue-200">
            Herramientas gratuitas para importadores
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Toma mejores decisiones en tu{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              cadena de suministro asiática
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Calcula tu Landed Cost real, proyecta el ROI de diversificación,
            evalúa riesgos de proveedores y monitoriza KPIs logísticos.
            Respaldado por más de 15 años de experiencia operativa en Asia.
          </p>

          {/* Tool buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {tools.map((tool) => (
              <a key={tool.href} href={tool.href}>
                <Button variant="outline" className="h-auto gap-2 px-5 py-3 hover:border-primary hover:text-primary transition-colors">
                  <tool.icon className="h-4 w-4" />
                  {tool.label}
                </Button>
              </a>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border bg-white/80 backdrop-blur px-8 py-6 shadow-sm sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#landed-cost"
              className="flex animate-bounce items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gray-900"
            >
              <ArrowDown className="h-4 w-4" />
              Explora las herramientas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
