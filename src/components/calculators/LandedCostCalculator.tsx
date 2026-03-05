"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, Download, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useLead } from "@/context/LeadContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { LandedCostBreakdown } from "@/lib/types";

const HS_CODES: Record<string, { label: string; rate: number }> = {
  "6109": { label: "6109 - Camisetas de punto", rate: 12 },
  "8471": { label: "8471 - Ordenadores portátiles", rate: 0 },
  "9403": { label: "9403 - Muebles", rate: 2.7 },
  "8528": { label: "8528 - Monitores/TV", rate: 14 },
  "6402": { label: "6402 - Calzado", rate: 16.9 },
  "8507": { label: "8507 - Baterías", rate: 2.7 },
  "3926": { label: "3926 - Plásticos", rate: 6.5 },
  "7326": { label: "7326 - Artículos de hierro/acero", rate: 2.7 },
};

const PORTS = [
  "Shanghai", "Shenzhen", "Ningbo", "Guangzhou", "Qingdao",
  "Ho Chi Minh", "Haiphong", "Bangkok",
];

const SHIPPING_METHODS = [
  { value: "FCL20", label: "FCL 20' Container" },
  { value: "FCL40", label: "FCL 40' Container" },
  { value: "LCL", label: "LCL (Grupaje)" },
  { value: "AIR", label: "Aéreo" },
];

const PORT_FEES: Record<string, number> = {
  FCL20: 450, FCL40: 680, LCL: 180, AIR: 95,
};

const HANDLING_RATE = 0.015;
const IMPORT_VAT_RATE = 0.21;

const CHART_COLORS = ["#1e40af", "#047857", "#b91c1c", "#d97706", "#7c3aed", "#0891b2"];

const fmt = (v: number) =>
  v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

interface WizardStep {
  title: string;
  fields: readonly (keyof FormValues)[];
}

const WIZARD_STEPS: WizardStep[] = [
  { title: "Valor y Costes CIF", fields: ["merchandiseValue", "cifCosts"] },
  { title: "Clasificación Arancelaria", fields: ["hsCode", "originPort"] },
  { title: "Logística de Envío", fields: ["shippingMethod", "shippingVolume"] },
];

const formSchema = z.object({
  merchandiseValue: z.coerce.number().positive("Debe ser mayor que 0"),
  cifCosts: z.coerce.number().min(0, "No puede ser negativo"),
  hsCode: z.string().min(1, "Selecciona un código HS"),
  originPort: z.string().min(1, "Selecciona un puerto"),
  shippingVolume: z.coerce.number().positive("Debe ser mayor que 0"),
  shippingMethod: z.enum(["FCL20", "FCL40", "LCL", "AIR"]),
});

type FormValues = z.infer<typeof formSchema>;

function calculateLandedCost(values: FormValues): LandedCostBreakdown {
  const dutyRate = HS_CODES[values.hsCode]?.rate ?? 5;
  const cifTotal = values.merchandiseValue + values.cifCosts;
  const customsDuty = cifTotal * (dutyRate / 100);
  const portFees = PORT_FEES[values.shippingMethod] * Math.ceil(values.shippingVolume);
  const handlingFees = cifTotal * HANDLING_RATE;
  // IVA importación (art. 83 Ley IVA): base = valor en aduana + aranceles + gastos accesorios
  // hasta primer punto de destino interior (incluye tasas portuarias y handling)
  const taxableBase = cifTotal + customsDuty + portFees + handlingFees;
  const importVAT = taxableBase * IMPORT_VAT_RATE;
  const totalLandedCost = cifTotal + customsDuty + importVAT + portFees + handlingFees;

  return {
    merchandiseValue: values.merchandiseValue,
    cifCosts: values.cifCosts,
    customsDuty,
    customsDutyRate: dutyRate,
    importVAT,
    portFees,
    handlingFees,
    totalLandedCost,
  };
}

export function LandedCostCalculator() {
  const { isVerified, setShowGatekeeper, setPendingTool } = useLead();
  const [result, setResult] = useState<LandedCostBreakdown | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  const STORAGE_KEY = "wta-landed-cost-form";
  const DEFAULT_VALUES: FormValues = {
    merchandiseValue: 25000,
    cifCosts: 3200,
    hsCode: "",
    originPort: "",
    shippingVolume: 1,
    shippingMethod: "FCL20",
  };
  const [savedForm, setSavedForm, { hydrated, removeValue: clearSavedForm }] =
    useLocalStorage<FormValues>(STORAGE_KEY, DEFAULT_VALUES);

  const form = useForm<FormValues>({
    // zodResolver cast required: zod v4 output types don't align with react-hook-form v7 Resolver generics
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  // Hydrate form from localStorage once available
  useEffect(() => {
    if (hydrated) form.reset(savedForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Persist form values on every change
  useEffect(() => {
    const sub = form.watch((values) => setSavedForm(values as FormValues));
    return () => sub.unsubscribe();
  }, [form, setSavedForm]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      const calc = calculateLandedCost(values);
      setResult(calc);
      setHasCalculated(true);
      clearSavedForm();
      if (!isVerified) {
        setPendingTool("Landed Cost Calculator");
        setShowGatekeeper(true);
      }
    },
    [isVerified, setPendingTool, setShowGatekeeper, clearSavedForm]
  );

  const wizardProgress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;

  async function handleNext() {
    const valid = await form.trigger([...WIZARD_STEPS[wizardStep].fields]);
    if (valid) setWizardStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  function handleBack() {
    setWizardStep((s) => Math.max(s - 1, 0));
  }

  // Derived: only show results when BOTH calculated AND verified
  const showResults = hasCalculated && isVerified && result !== null;

  // Chart data only computed when verified — never leaks to DOM otherwise
  const chartData = showResults && result
    ? [
        { name: "Mercancía", value: result.merchandiseValue },
        { name: "CIF (Flete+Seguro)", value: result.cifCosts },
        { name: `Arancel (${result.customsDutyRate}%)`, value: result.customsDuty },
        { name: "IVA Importación (21%)", value: result.importVAT },
        { name: "Tasas Portuarias", value: result.portFees },
        { name: "Handling", value: result.handlingFees },
      ]
    : [];

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Calculator className="mr-1.5 h-3 w-3" /> Calculadora de Coste
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Calculadora de Coste Total de Importación
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Estima el Landed Cost real de tu producto asiático puesto en almacén europeo.
            Aranceles, IVA, tasas portuarias y handling incluidos.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de la importación</CardTitle>
              <CardDescription>
                Paso {wizardStep + 1} de {WIZARD_STEPS.length} — {WIZARD_STEPS[wizardStep].title}
              </CardDescription>
              <Progress value={wizardProgress} className="mt-3 h-2" />
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="min-h-[260px]">
                    {/* Step 0 — Valor y Costes CIF */}
                    {wizardStep === 0 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                          control={form.control}
                          name="merchandiseValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor mercancía (EUR)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="25000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cifCosts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costes CIF — Flete + Seguro (EUR)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="3200" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 1 — Clasificación Arancelaria */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                          control={form.control}
                          name="hsCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código HS (Sistema Armonizado)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un código HS" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(HS_CODES).map(([code, info]) => (
                                    <SelectItem key={code} value={code}>
                                      {info.label} ({info.rate}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="originPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puerto de origen</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona puerto" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PORTS.map((port) => (
                                    <SelectItem key={port} value={port}>
                                      {port}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 2 — Logística con Slider */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                          control={form.control}
                          name="shippingMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Método de envío</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SHIPPING_METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingVolume"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Volumen (contenedores / CBM)</FormLabel>
                                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <div className="space-y-2 pt-1">
                                  <Slider
                                    value={[Number(field.value) || 1]}
                                    onValueChange={([v]) => field.onChange(v)}
                                    min={1}
                                    max={50}
                                    step={1}
                                  />
                                  <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>1</span>
                                    <span>25</span>
                                    <span>50</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Wizard navigation */}
                  <div className="flex gap-3 pt-2">
                    {wizardStep > 0 && (
                      <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                        <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                      </Button>
                    )}
                    {wizardStep < WIZARD_STEPS.length - 1 ? (
                      <Button type="button" onClick={handleNext} className="flex-1">
                        Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1">
                        <Calculator className="mr-2 h-4 w-4" />
                        Calcular Landed Cost
                      </Button>
                    )}
                  </div>

                  {/* Step dots */}
                  <div className="flex justify-center gap-1.5 pt-1">
                    {WIZARD_STEPS.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Paso ${i + 1}: ${s.title}`}
                        onClick={async () => {
                          if (i < wizardStep) { setWizardStep(i); return; }
                          for (let step = wizardStep; step < i; step++) {
                            const f = [...WIZARD_STEPS[step].fields];
                            const ok = await form.trigger(f);
                            if (!ok) { setWizardStep(step); return; }
                          }
                          setWizardStep(i);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          i === wizardStep ? "w-6 bg-primary" : i < wizardStep ? "w-2 bg-primary/60" : "w-2 bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Desglose del Coste Total</CardTitle>
              <CardDescription>
                Visualización interactiva del Landed Cost
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              {!hasCalculated ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Calculator className="mb-4 h-12 w-12 opacity-30" />
                  <p>Completa el formulario para ver el desglose</p>
                </div>
              ) : !isVerified ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Lock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-2 font-semibold text-gray-900">
                    Resultados calculados
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Verifica tu email corporativo para desbloquear el análisis completo
                  </p>
                  <Button
                    onClick={() => {
                      setPendingTool("Landed Cost Calculator");
                      setShowGatekeeper(true);
                    }}
                  >
                    Desbloquear resultados
                  </Button>
                </div>
              ) : result ? (
                <div className="w-full space-y-6">
                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Coste Total (Landed Cost)</p>
                    <p className="text-4xl font-bold text-primary">
                      {fmt(result.totalLandedCost)}
                    </p>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
                          }
                          labelLine={false}
                        >
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
                          formatter={(value) => fmt(Number(value))}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {chartData.map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[i] }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{fmt(item.value)}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://calendly.com/worldtradeasian/llamada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">
                      ¿Quieres reducir este coste? Agenda 20 min con WTA →
                    </Button>
                  </a>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Informe (PDF)
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
