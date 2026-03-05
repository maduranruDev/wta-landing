"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLead } from "@/context/LeadContext";
import { submitLead } from "@/lib/submit-lead";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.es", "yahoo.co.uk",
  "hotmail.com", "hotmail.es", "hotmail.co.uk", "outlook.com", "outlook.es",
  "live.com", "live.es", "msn.com", "aol.com", "icloud.com", "me.com", "mac.com",
  "mail.com", "protonmail.com", "proton.me", "zoho.com", "yandex.com",
  "gmx.com", "gmx.es", "tutanota.com", "mailinator.com", "yopmail.com",
]);

function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return FREE_EMAIL_DOMAINS.has(domain);
}

const leadSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Introduce un email válido")
    .refine(
      (email) => !isFreeEmailDomain(email),
      "Solo se aceptan correos corporativos (no Gmail, Hotmail, etc.)"
    ),
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  company: z.string().min(2, "Mínimo 2 caracteres").max(150),
  jobTitle: z.string().min(2, "Mínimo 2 caracteres").max(100),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function GatekeeperModal() {
  const { showGatekeeper, setShowGatekeeper, setLead, pendingTool } = useLead();
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { email: "", name: "", company: "", jobTitle: "" },
  });

  async function onSubmit(values: LeadFormValues) {
    setLoading(true);
    try {
      submitLead({ ...values, toolUsed: pendingTool }).catch(() => {});
      setLead({ ...values, verifiedAt: new Date() });
      setShowGatekeeper(false);
      form.reset();
      toast.success("Acceso concedido", {
        description: "Consulta los resultados detallados.",
      });
    } catch {
      toast.error("Error de conexión", {
        description: "Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) setShowGatekeeper(false);
  }

  return (
    <Dialog open={showGatekeeper} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Accede a los resultados detallados
          </DialogTitle>
          <DialogDescription className="text-center">
            Introduce tus datos para desbloquear el análisis completo
            {pendingTool && (
              <span className="mt-1 block text-xs font-medium text-primary">
                Herramienta: {pendingTool}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Corporativo</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@empresa.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de tu empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Director de Compras" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Acceder a los Resultados
            </Button>
            <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                Tus datos están seguros. No spam.
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> GDPR Compliant
                </span>
                <span className="text-muted-foreground/30">|</span>
                <span>ISO 9001 Certified</span>
                <span className="text-muted-foreground/30">|</span>
                <span>SSL Encrypted</span>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
