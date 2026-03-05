"use client";

import { useState } from "react";
import { Activity, TrendingDown, Package, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fmt = (v: number) =>
  v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ===== PPV Calculator =====
function PPVCalculator() {
  const [items, setItems] = useState([
    { name: "Componente A", standardPrice: 5.0, actualPrice: 4.7, quantity: 10000 },
    { name: "Componente B", standardPrice: 12.5, actualPrice: 13.1, quantity: 5000 },
    { name: "Componente C", standardPrice: 8.0, actualPrice: 7.2, quantity: 8000 },
  ]);

  const results = items.map((item) => {
    const ppv = (item.actualPrice - item.standardPrice) * item.quantity;
    const ppvPercent = ((item.actualPrice - item.standardPrice) / item.standardPrice) * 100;
    return { ...item, ppv, ppvPercent };
  });

  const totalPPV = results.reduce((sum, r) => sum + r.ppv, 0);

  const chartData = results.map((r) => ({
    name: r.name,
    "Precio Estándar": r.standardPrice,
    "Precio Real": r.actualPrice,
  }));

  function updateItem(index: number, field: string, value: string) {
    const newItems = [...items];
    if (field === "name") {
      newItems[index] = { ...newItems[index], name: value };
    } else {
      newItems[index] = { ...newItems[index], [field]: parseFloat(value) || 0 };
    }
    setItems(newItems);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 rounded-lg border p-3">
            <div>
              <Label className="text-xs">Componente</Label>
              <Input
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Precio Estándar (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={item.standardPrice}
                onChange={(e) => updateItem(i, "standardPrice", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Precio Real (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={item.actualPrice}
                onChange={(e) => updateItem(i, "actualPrice", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Cantidad</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className={`rounded-lg p-4 text-center ${
          totalPPV <= 0 ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <p className="text-sm text-muted-foreground">Varianza Total PPV</p>
        <p
          className={`text-3xl font-bold ${
            totalPPV <= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          {fmt(totalPPV)}
        </p>
        <p className="text-xs text-muted-foreground">
          {totalPPV <= 0 ? "Favorable: estás comprando por debajo del estándar" : "Desfavorable: estás pagando por encima del estándar"}
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `${v}€`} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} formatter={(v) => fmt(Number(v))} />
            <Legend />
            <Bar dataKey="Precio Estándar" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Precio Real" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{r.name}</span>
            <div className="flex items-center gap-3">
              <span className={r.ppv <= 0 ? "text-green-600" : "text-red-600"}>
                {r.ppvPercent > 0 ? "+" : ""}{r.ppvPercent.toFixed(1)}%
              </span>
              <span className="font-semibold">
                {fmt(r.ppv)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TCO Calculator =====
function TCOCalculator() {
  const [values, setValues] = useState({
    purchasePrice: 50000,
    orderingCosts: 3500,
    holdingCosts: 8000,
    qualityCosts: 4200,
    logisticsCosts: 12000,
  });

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  const chartData = [
    { name: "Precio Compra", value: values.purchasePrice, fill: "#1e40af" },
    { name: "Costes Pedido", value: values.orderingCosts, fill: "#047857" },
    { name: "Costes Almacén", value: values.holdingCosts, fill: "#d97706" },
    { name: "Costes Calidad", value: values.qualityCosts, fill: "#b91c1c" },
    { name: "Logística", value: values.logisticsCosts, fill: "#7c3aed" },
  ];

  function update(key: keyof typeof values, val: string) {
    setValues({ ...values, [key]: parseFloat(val) || 0 });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Precio de Compra (EUR)</Label>
          <Input
            type="number"
            value={values.purchasePrice}
            onChange={(e) => update("purchasePrice", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Costes de Pedido (EUR)</Label>
          <Input
            type="number"
            value={values.orderingCosts}
            onChange={(e) => update("orderingCosts", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Costes de Almacenamiento (EUR)</Label>
          <Input
            type="number"
            value={values.holdingCosts}
            onChange={(e) => update("holdingCosts", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Costes de Calidad (EUR)</Label>
          <Input
            type="number"
            value={values.qualityCosts}
            onChange={(e) => update("qualityCosts", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Costes Logísticos (EUR)</Label>
          <Input
            type="number"
            value={values.logisticsCosts}
            onChange={(e) => update("logisticsCosts", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">Coste Total de Propiedad (TCO)</p>
        <p className="text-4xl font-bold text-primary">{fmt(total)}</p>
      </div>

      <div className="h-[280px]">
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
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} formatter={(v) => fmt(Number(v))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
              <span className="font-semibold">{fmt(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== OTIF Calculator =====
function OTIFCalculator() {
  const [values, setValues] = useState({
    totalOrders: 500,
    onTimeOrders: 430,
    inFullOrders: 460,
    onTimeInFullOrders: 410,
  });

  const otRate = (values.onTimeOrders / values.totalOrders) * 100;
  const ifRate = (values.inFullOrders / values.totalOrders) * 100;
  const otifRate = (values.onTimeInFullOrders / values.totalOrders) * 100;

  const chartData = [
    { name: "On-Time", value: otRate, fill: "#1e40af" },
    { name: "In-Full", value: ifRate, fill: "#047857" },
    { name: "OTIF", value: otifRate, fill: "#d97706" },
  ];

  function update(key: keyof typeof values, val: string) {
    setValues({ ...values, [key]: parseInt(val) || 0 });
  }

  const getColor = (rate: number) => {
    if (rate >= 95) return "text-green-700";
    if (rate >= 85) return "text-yellow-700";
    return "text-red-700";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Total Pedidos</Label>
          <Input
            type="number"
            value={values.totalOrders}
            onChange={(e) => update("totalOrders", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pedidos a Tiempo (On-Time)</Label>
          <Input
            type="number"
            value={values.onTimeOrders}
            onChange={(e) => update("onTimeOrders", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pedidos Completos (In-Full)</Label>
          <Input
            type="number"
            value={values.inFullOrders}
            onChange={(e) => update("inFullOrders", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pedidos OTIF (ambos)</Label>
          <Input
            type="number"
            value={values.onTimeInFullOrders}
            onChange={(e) => update("onTimeInFullOrders", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <Clock className="mx-auto mb-1 h-5 w-5 text-blue-600" />
          <p className="text-xs text-muted-foreground">On-Time</p>
          <p className={`text-2xl font-bold ${getColor(otRate)}`}>
            {otRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <Package className="mx-auto mb-1 h-5 w-5 text-green-600" />
          <p className="text-xs text-muted-foreground">In-Full</p>
          <p className={`text-2xl font-bold ${getColor(ifRate)}`}>
            {ifRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 text-center">
          <Activity className="mx-auto mb-1 h-5 w-5 text-amber-600" />
          <p className="text-xs text-muted-foreground">OTIF</p>
          <p className={`text-2xl font-bold ${getColor(otifRate)}`}>
            {otifRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Bar dataKey="value" name="%" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {otifRate < 90 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Alerta: OTIF por debajo del benchmark del 90%</p>
          <p className="mt-1 text-xs">
            Un OTIF inferior al 90% indica problemas sistémicos en la cadena de suministro.
            Contacta con World Trade Asian para optimizar tu red de proveedores.
          </p>
        </div>
      )}
    </div>
  );
}

// ===== Main Dashboard =====
export function KPIDashboard() {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Activity className="mr-1.5 h-3 w-3" /> Módulo de KPIs
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dashboard de KPIs Logísticos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Herramientas interactivas para monitorizar las métricas clave de tu
            cadena de suministro en tiempo real.
          </p>
        </div>

        <Tabs defaultValue="ppv" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ppv" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              PPV
            </TabsTrigger>
            <TabsTrigger value="tco" className="gap-2">
              <Package className="h-4 w-4" />
              TCO
            </TabsTrigger>
            <TabsTrigger value="otif" className="gap-2">
              <Clock className="h-4 w-4" />
              OTIF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ppv">
            <Card>
              <CardHeader>
                <CardTitle>Varianza del Precio de Compra (PPV)</CardTitle>
                <CardDescription>
                  Compara precios estándar vs. reales para detectar desviaciones en costes de adquisición.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PPVCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tco">
            <Card>
              <CardHeader>
                <CardTitle>Coste Total de Propiedad (TCO)</CardTitle>
                <CardDescription>
                  Calcula el coste completo más allá del precio de compra: pedidos, almacén, calidad y logística.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TCOCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="otif">
            <Card>
              <CardHeader>
                <CardTitle>Entrega a Tiempo y Completa (OTIF)</CardTitle>
                <CardDescription>
                  Mide la fiabilidad de tus proveedores con el indicador más crítico de la cadena de suministro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OTIFCalculator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
