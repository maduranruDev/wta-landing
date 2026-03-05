"use client";

import { useState } from "react";
import { ShieldCheck, ChevronRight, ChevronLeft, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLead } from "@/context/LeadContext";
import type { RiskAssessmentResult } from "@/lib/types";

interface Question {
  id: string;
  category: string;
  text: string;
  description: string;
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: "geo_dependency",
    category: "Dependencia Geográfica",
    text: "¿Cuál es tu nivel de concentración geográfica de proveedores?",
    description: "Evalúa si existe riesgo de punto único de fallo en una sola región o provincia.",
    options: [
      { label: "100% en una sola provincia/región", value: 0 },
      { label: "Concentrado en 2-3 provincias del mismo país", value: 25 },
      { label: "Diversificado en un solo país", value: 50 },
      { label: "Multi-país dentro de Asia", value: 75 },
      { label: "Diversificación global (Asia + nearshoring)", value: 100 },
    ],
  },
  {
    id: "single_source",
    category: "Dependencia Geográfica",
    text: "¿Cuántos proveedores tienes para tus componentes críticos?",
    description: "Un proveedor único para componentes clave es un riesgo severo.",
    options: [
      { label: "1 solo proveedor (single source)", value: 0 },
      { label: "2 proveedores, uno dominante (>70%)", value: 25 },
      { label: "2-3 proveedores equilibrados", value: 60 },
      { label: "4+ proveedores con backup validado", value: 85 },
      { label: "Estrategia dual-sourcing formalizada", value: 100 },
    ],
  },
  {
    id: "tier2_visibility",
    category: "Visibilidad Sub-proveedores",
    text: "¿Tienes visibilidad sobre tus proveedores Tier 2 (sub-proveedores)?",
    description: "Conocer quién suministra a tus proveedores es crucial para gestionar riesgos.",
    options: [
      { label: "Sin visibilidad alguna", value: 0 },
      { label: "Conocemos nombres pero no auditamos", value: 20 },
      { label: "Auditorías esporádicas a Tier 2", value: 50 },
      { label: "Programa formal de gestión Tier 2", value: 80 },
      { label: "Visibilidad completa Tier 2 y Tier 3", value: 100 },
    ],
  },
  {
    id: "tier3_mapping",
    category: "Visibilidad Sub-proveedores",
    text: "¿Tienes mapeada la cadena completa hasta materias primas (Tier 3)?",
    description: "Los riesgos ocultos suelen estar en los eslabones más profundos.",
    options: [
      { label: "No, desconocemos la cadena profunda", value: 0 },
      { label: "Conocemos parcialmente algunos Tier 3", value: 30 },
      { label: "Mapeo parcial con herramientas digitales", value: 60 },
      { label: "Mapeo completo con trazabilidad activa", value: 100 },
    ],
  },
  {
    id: "epr_compliance",
    category: "Cumplimiento Normativo",
    text: "¿Tus proveedores cumplen con la normativa EPR (Responsabilidad Ampliada del Productor) en España?",
    description: "El EPR en España exige que productores e importadores gestionen el ciclo de vida completo de sus productos.",
    options: [
      { label: "No estamos al tanto del EPR", value: 0 },
      { label: "Conscientes pero sin implementar", value: 20 },
      { label: "Parcialmente implementado", value: 50 },
      { label: "Cumplimiento total con documentación", value: 85 },
      { label: "Adelantados a la normativa con plan proactivo", value: 100 },
    ],
  },
  {
    id: "env_compliance",
    category: "Cumplimiento Normativo",
    text: "¿Tus proveedores tienen certificaciones medioambientales verificadas?",
    description: "ISO 14001, REACH, RoHS y similares reducen riesgos regulatorios.",
    options: [
      { label: "Sin certificaciones ambientales", value: 0 },
      { label: "Algunas autocertificaciones", value: 20 },
      { label: "ISO 14001 en proveedores principales", value: 55 },
      { label: "Certificaciones múltiples auditadas", value: 80 },
      { label: "Programa ESG completo con reporting", value: 100 },
    ],
  },
  {
    id: "contingency",
    category: "Resiliencia Operativa",
    text: "¿Dispones de un plan de contingencia ante disrupciones de suministro?",
    description: "Pandemias, conflictos geopolíticos, bloqueos portuarios... ¿estás preparado?",
    options: [
      { label: "Sin plan de contingencia", value: 0 },
      { label: "Plan informal sin testear", value: 20 },
      { label: "Plan documentado pero no probado", value: 45 },
      { label: "Plan probado con simulacros anuales", value: 75 },
      { label: "Resiliencia integrada con IA predictiva", value: 100 },
    ],
  },
];

// Critical questions have disproportionate weight in the risk calculation.
// A "0" on a critical question (e.g. no Tier 2 visibility, single source)
// should penalize the score far more than a "0" on a minor question.
const QUESTION_WEIGHTS: Record<string, number> = {
  geo_dependency:  1.0,   // Important but partially mitigated by single_source
  single_source:   2.0,   // CRITICAL: single point of failure
  tier2_visibility: 2.5,  // CRITICAL: hidden risk in sub-suppliers
  tier3_mapping:   1.5,   // Important for deep-chain risks
  epr_compliance:  1.0,   // Regulatory but not immediately catastrophic
  env_compliance:  0.8,   // Desirable, lower urgency
  contingency:     2.0,   // CRITICAL: resilience against black-swan events
};

function calculateRisk(answers: Record<string, number>): RiskAssessmentResult {
  const categories: Record<string, { weightedTotal: number; weightSum: number }> = {};

  QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? 0;
    const weight = QUESTION_WEIGHTS[q.id] ?? 1.0;
    if (!categories[q.category]) categories[q.category] = { weightedTotal: 0, weightSum: 0 };
    categories[q.category].weightedTotal += val * weight;
    categories[q.category].weightSum += weight;
  });

  const breakdown = Object.entries(categories).map(([category, data]) => ({
    category,
    score: Math.round(data.weightedTotal / data.weightSum),
    maxScore: 100,
  }));

  // Overall score also uses category weights (sum of question weights per category)
  const totalWeight = Object.values(categories).reduce((s, c) => s + c.weightSum, 0);
  const weightedSum = Object.values(categories).reduce((s, c) => s + c.weightedTotal, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  const invertedScore = 100 - overallScore;

  let level: RiskAssessmentResult["level"];
  if (invertedScore <= 20) level = "LOW";
  else if (invertedScore <= 45) level = "MEDIUM";
  else if (invertedScore <= 70) level = "HIGH";
  else level = "CRITICAL";

  const recommendations: string[] = [];

  if ((answers["geo_dependency"] ?? 0) < 50) {
    recommendations.push(
      "RIESGO GEOGRÁFICO ALTO: Tu concentración en una sola región te expone a disrupciones regionales. Considera diversificar entre China y Vietnam."
    );
  }
  if ((answers["single_source"] ?? 0) < 50) {
    recommendations.push(
      "SINGLE SOURCE RISK: Implementa una estrategia de dual-sourcing para componentes críticos. World Trade Asian puede validar proveedores alternativos."
    );
  }
  if ((answers["tier2_visibility"] ?? 0) < 50) {
    recommendations.push(
      "VISIBILIDAD TIER 2 INSUFICIENTE: Sin conocer tus sub-proveedores, no puedes gestionar riesgos ocultos. Recomendamos auditorías de cadena completa."
    );
  }
  if ((answers["tier3_mapping"] ?? 0) < 50) {
    recommendations.push(
      "MAPEO TIER 3 CRÍTICO: Las materias primas son el eslabón más vulnerable. Implementa trazabilidad digital hasta origen."
    );
  }
  if ((answers["epr_compliance"] ?? 0) < 50) {
    recommendations.push(
      "CUMPLIMIENTO EPR: La normativa española exige gestión del ciclo de vida. Riesgo de sanciones si no se implementa correctamente."
    );
  }
  if ((answers["env_compliance"] ?? 0) < 50) {
    recommendations.push(
      "CERTIFICACIONES AMBIENTALES: CBAM y regulaciones EU endurecen requisitos. Asegura certificaciones ISO 14001 y REACH en toda la cadena."
    );
  }
  if ((answers["contingency"] ?? 0) < 50) {
    recommendations.push(
      "PLAN DE CONTINGENCIA DÉBIL: Sin resiliencia planificada, cualquier disrupción puede paralizar operaciones durante semanas."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Tu cadena de suministro muestra buena madurez. Considera optimizar costes con World Trade Asian manteniendo tu nivel de resiliencia."
    );
  }

  return { score: invertedScore, level, recommendations, breakdown };
}

export function SupplierRiskAssessment() {
  const { isVerified, setShowGatekeeper, setPendingTool } = useLead();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [started, setStarted] = useState(false);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  function selectOption(value: number) {
    setSelectedValue(value);
  }

  function handleNext() {
    if (selectedValue === null) return;
    const newAnswers = { ...answers, [question.id]: selectedValue };
    setAnswers(newAnswers);
    setSelectedValue(null);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const riskResult = calculateRisk(newAnswers);
      setResult(riskResult);
      setHasCalculated(true);
      if (!isVerified) {
        setPendingTool("Supplier Risk Assessment");
        setShowGatekeeper(true);
      }
    }
  }

  function handlePrev() {
    if (currentQuestion > 0) {
      const prevQ = QUESTIONS[currentQuestion - 1];
      setSelectedValue(answers[prevQ.id] ?? null);
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  // Derived: only show when BOTH calculated AND OTP verified
  const showResults = hasCalculated && isVerified && result !== null;

  const levelColors: Record<string, string> = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
  };

  const levelLabels: Record<string, string> = {
    LOW: "Bajo", MEDIUM: "Medio", HIGH: "Alto", CRITICAL: "Crítico",
  };

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <ShieldCheck className="mr-1.5 h-3 w-3" /> Evaluación de Riesgos
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Evaluación de Riesgos de Proveedores
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Evalúa la resiliencia de tu cadena de suministro con nuestro cuestionario
            especializado para directivos C-Level.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {!started && !result ? (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Supplier Risk Scorecard</CardTitle>
                <CardDescription className="text-base">
                  7 preguntas estratégicas · 3 minutos · Score de 0 a 100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="font-semibold">Dependencia</p>
                    <p className="text-xs text-muted-foreground">Geográfica</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="font-semibold">Visibilidad</p>
                    <p className="text-xs text-muted-foreground">Tier 2 & 3</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="font-semibold">Normativa</p>
                    <p className="text-xs text-muted-foreground">EPR & ESG</p>
                  </div>
                </div>
                <Button size="lg" onClick={() => setStarted(true)} className="w-full">
                  Iniciar Evaluación
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : result ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Resultado del Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {!showResults ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Lock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="mb-2 font-semibold text-gray-900">
                      Risk Score calculado
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Verifica tu email para ver las recomendaciones detalladas
                    </p>
                    <Button
                      onClick={() => {
                        setPendingTool("Supplier Risk Assessment");
                        setShowGatekeeper(true);
                      }}
                    >
                      Desbloquear resultados
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Score display */}
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/20">
                        <span className="text-4xl font-bold text-primary">
                          {result.score}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-sm px-4 py-1 ${levelColors[result.level]}`}
                      >
                        Riesgo {levelLabels[result.level]}
                      </Badge>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Desglose por categoría
                      </p>
                      {result.breakdown.map((b) => (
                        <div key={b.category} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{b.category}</span>
                            <span className="font-medium">{b.score}/100</span>
                          </div>
                          <Progress value={b.score} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Recomendaciones automatizadas
                      </p>
                      {result.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="flex gap-3 rounded-lg border bg-gray-50 p-4"
                        >
                          {result.level === "LOW" ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          ) : (
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          )}
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setResult(null);
                        setAnswers({});
                        setCurrentQuestion(0);
                        setSelectedValue(null);
                        setHasCalculated(false);
                        setStarted(false);
                      }}
                    >
                      Repetir evaluación
                    </Button>
                  <a href="https://calendly.com/worldtradeasian/llamada" target="_blank" rel="noopener noreferrer" className="block w-full mb-4">
                    <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                      Habla con un experto WTA sobre tu riesgo → Agenda 20 min
                    </button>
                  </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Pregunta {currentQuestion + 1} de {QUESTIONS.length}</span>
                    <span className="font-medium text-primary">{question.category}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <CardTitle className="mt-4 text-xl">{question.text}</CardTitle>
                <CardDescription>{question.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => selectOption(opt.value)}
                      className={`w-full rounded-lg border p-4 text-left text-sm transition-all hover:border-primary/50 hover:bg-primary/5 ${
                        selectedValue === opt.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={selectedValue === null}
                    className="flex-1"
                  >
                    {currentQuestion < QUESTIONS.length - 1 ? (
                      <>
                        Siguiente
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      "Ver resultado"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
