"use client";

import Link from "next/link";
import { Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { label: "Landed Cost", href: "#landed-cost" },
  { label: "ROI Sourcing", href: "#roi-sourcing" },
  { label: "Risk Assessment", href: "#risk-assessment" },
  { label: "KPI Dashboard", href: "#kpi-dashboard" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="https://worldtradeasian.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight tracking-tight text-gray-900">
              World Trade Asian
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Supply Chain Intelligence
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
          <a href="https://worldtradeasian.com/#contacto" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="ml-3">
              Contactar Experto
            </Button>
          </a>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-4 pt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
              <a href="https://worldtradeasian.com/#contacto" target="_blank" rel="noopener noreferrer">
                <Button className="mt-4 w-full">Contactar Experto</Button>
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
