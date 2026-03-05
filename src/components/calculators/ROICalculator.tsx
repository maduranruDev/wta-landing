"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart3, Lock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
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
import type { ROIResult } from "@/lib/types";

const SAVINGS_RATES: Record<string, { production: number; logistics: number; label: string }> = {
  china: { production: 0.35, logistics: 0.12, label: "China" },
  vietnam: { production: 0.28, logistics: 0.15, label: "Vietnam" },
};

const WTA_FEE_RATE = 0.05;

interface WizardStep {
  title: string;
  fields: readonly (keyof FormValues)[];
}

const ROI_WIZARD_STEPS: WizardStep[] = [
  { title: "Costes de Producción", fields: ["currentProductionCost", "productionVolume"] },
  { title: "Logística y País", fields: ["currentLogisticsCost", "sourcingCountry"] },
];

const formSchema = z.object({
  currentProductionCost: z.coerce.number().positive("Debe ser mayor que 0"),
  productionVolume: z.coerce.number().positive("Debe ser mayor que 0"),
  currentLogisticsCost: z.coerce.number().min(0, "No puede ser negativo"),
  sourcingCountry: z.enum(["china", "vietnam"]),
});

type FormValues = z.infer<typeof formSchema>;

function calculateROI(values: FormValues): ROIResult {
  const rates = SAVINGS_RATES[values.sourcingCountry];
  const currentTotalCost =
    values.currentProductionCost * values.productionVolume + values.currentLogisticsCost;

  const optimizedProductionCost =
    values.currentProductionCost * (1 - rates.production) * values.productionVolume;
  const optimizedLogisticsCost = values.currentLogisticsCost * (1 - rates.logistics);
  const subtotalOptimized = optimizedProductionCost + optimizedLogisticsCost;
  const wtaFees = subtotalOptimized * WTA_FEE_RATE;
  const optimizedTotalCost = subtotalOptimized + wtaFees;

  const totalSavings = currentTotalCost - optimizedTotalCost;
  const roiPercentage = (totalSavings / currentTotalCost) * 100;
  const paybackMonths = totalSavings > 0 ? Math.ceil((wtaFees / totalSavings) * 12) : 0;

  return {
    currentTotalCost,
    optimizedProductionCost,
    optimizedLogisticsCost,
    wtaFees,
    optimizedTotalCost,
    totalSavings,
    roiPercentage,
    paybackMonths,
  };
}

const fmt = (v: number) =>
  v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export function ROICalculator() {
  const { isVerified, setShowGatekeeper, setPendingTool } = useLead();
  const [result, setResult] = useState<ROIResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [country, setCountry] = useState("china");
  const [wizardStep, setWizardStep] = useState(0);

  const STORAGE_KEY = "wta-roi-form";
  const DEFAULT_VALUES: FormValues = {
    currentProductionCost: 12,
    productionVolume: 10000,
    currentLogisticsCost: 15000,
    sourcingCountry: "china",
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
      const calc = calculateROI(values);
      setResult(calc);
      setHasCalculated(true);
      setCountry(values.sourcingCountry);
      clearSavedForm();
      if (!isVerified) {
        setPendingTool("ROI Sourcing Calculator");
        setShowGatekeeper(true);
      }
    },
    [isVerified, setPendingTool, setShowGatekeeper, clearSavedForm]
  );

  const wizardProgress = ((wizardStep + 1) / ROI_WIZARD_STEPS.length) * 100;

  async function handleNext() {
    const valid = await form.trigger([...ROI_WIZARD_STEPS[wizardStep].fields]);
    if (valid) setWizardStep((s) => Math.min(s + 1, ROI_WIZARD_STEPS.length - 1));
  }

  function handleBack() {
    setWizardStep((s) => Math.max(s - 1, 0));
  }

  // Derived: only show when BOTH calculated AND OTP verified
  const showResults = hasCalculated && isVerified && result !== null;

  // Chart data only computed when verified — never leaks to DOM
  const chartData = showResults && result
    ? [
        {
          name: "Producción",
          actual: result.currentTotalCost - (form.getValues("currentLogisticsCost") || 0),
          optimizado: result.optimizedProductionCost,
        },
        {
          name: "Logística",
          actual: form.getValues("currentLogisticsCost") || 0,
          optimizado: result.optimizedLogisticsCost,
        },
        {
          name: "Honorarios WTA",
          actual: 0,
          optimizado: result.wtaFees,
        },
      ]
    : [];

  const totalChartData = showResults && result
    ? [
        { name: "Coste Actual", value: result.currentTotalCost, fill: "#ef4444" },
        { name: "Coste Optimizado", value: result.optimizedTotalCost, fill: "#22c55e" },
      ]
    : [];

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <BarChart3 className="mr-1.5 h-3 w-3" /> Estimador de ROI
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Estimador de ROI y Ahorro en Sourcing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Proyecta el ahorro real de diversificar tu producción a Asia.
            Incluye honorarios de intermediación transparentes de World Trade Asian.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos de producción actuales</CardTitle>
              <CardDescription>
                Paso {wizardStep + 1} de {ROI_WIZARD_STEPS.length} — {ROI_WIZARD_STEPS[wizardStep].title}
              </CardDescription>
              <Progress value={wizardProgress} className="mt-3 h-2" />
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="min-h-[240px]">
                    {/* Step 0 — Costes de Producción */}
                    {wizardStep === 0 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                          control={form.control}
                          name="currentProductionCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coste producción unitario actual (EUR)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="12.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="productionVolume"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Volumen de producción (uds.)</FormLabel>
                                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
                                  {Number(field.value).toLocaleString("es-ES")}
                                </span>
                              </div>
                              <FormControl>
                                <div className="space-y-2 pt-1">
                                  <Slider
                                    value={[Number(field.value) || 1000]}
                                    onValueChange={([v]) => field.onChange(v)}
                                    min={1000}
                                    max={100000}
                                    step={1000}
                                  />
                                  <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>1.000</span>
                                    <span>50.000</span>
                                    <span>100.000</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 1 — Logística y País */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                          control={form.control}
                          name="currentLogisticsCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costes logísticos vigentes (EUR total)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="15000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sourcingCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País de diversificación</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="china">China (-35% producción)</SelectItem>
                                  <SelectItem value="vietnam">Vietnam (-28% producción)</SelectItem>
                                </SelectContent>
                              </Select>
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
                    {wizardStep < ROI_WIZARD_STEPS.length - 1 ? (
                      <Button type="button" onClick={handleNext} className="flex-1">
                        Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Calcular ROI de Sourcing
                      </Button>
                    )}
                  </div>

                  {/* Step dots */}
                  <div className="flex justify-center gap-1.5 pt-1">
                    {ROI_WIZARD_STEPS.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Paso ${i + 1}: ${s.title}`}
                        onClick={async () => {
                          if (i < wizardStep) { setWizardStep(i); return; }
                          for (let step = wizardStep; step < i; step++) {
                            const f = [...ROI_WIZARD_STEPS[step].fields];
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

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Comparativa de Costes</CardTitle>
              <CardDescription>
                Coste Actual vs. Coste Optimizado con {SAVINGS_RATES[country]?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              {!hasCalculated ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <BarChart3 className="mb-4 h-12 w-12 opacity-30" />
                  <p>Completa el formulario para ver la proyección de ROI</p>
                </div>
              ) : !isVerified ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Lock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-2 font-semibold text-gray-900">Análisis ROI calculado</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Verifica tu email para ver el desglose completo
                  </p>
                  <Button
                    onClick={() => {
                      setPendingTool("ROI Sourcing Calculator");
                      setShowGatekeeper(true);
                    }}
                  >
                    Desbloquear resultados
                  </Button>
                </div>
              ) : result ? (
                <div className="w-full space-y-6">
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Ahorro Total</p>
                      <p className="text-2xl font-bold text-green-700">
                        {fmt(result.totalSavings)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">ROI Neto</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {result.roiPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Honorarios WTA (5%)</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {fmt(result.wtaFees)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Payback</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {result.paybackMonths} meses
                      </p>
                    </div>
                  </div>

                  {/* Total comparison */}
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={totalChartData} layout="vertical" barSize={36}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`} />
                        <YAxis type="category" dataKey="name" width={130} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} formatter={(v) => fmt(Number(v))} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {totalChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} formatter={(v) => fmt(Number(v))} />
                        <Legend />
                        <Bar dataKey="actual" name="Coste Actual" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="optimizado" name="Optimizado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : null}
            <div className="mt-6">
              <a href="https://calendly.com/worldtradeasian/llamada" target="_blank" rel="noopener noreferrer" className="block w-full">
                <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  ¿Te interesan estos ahorros? Agenda 20 min con WTA →
                </button>
              </a>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
