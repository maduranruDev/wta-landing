// ===== Lead & OTP Types =====
export interface LeadData {
  email: string;
  name: string;
  company: string;
  jobTitle: string;
  verifiedAt?: Date;
}

export interface OTPRequest {
  email: string;
  name: string;
  company: string;
  jobTitle: string;
}

export interface OTPVerifyRequest {
  email: string;
  code: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

// ===== Landed Cost Calculator Types =====
export interface LandedCostInput {
  merchandiseValue: number;
  cifCosts: number;
  hsCode: string;
  originPort: string;
  destinationPort: string;
  shippingVolume: number;
  shippingMethod: "FCL20" | "FCL40" | "LCL" | "AIR";
}

export interface LandedCostBreakdown {
  merchandiseValue: number;
  cifCosts: number;
  customsDuty: number;
  customsDutyRate: number;
  importVAT: number;
  portFees: number;
  handlingFees: number;
  totalLandedCost: number;
}

// ===== ROI Calculator Types =====
export interface ROIInput {
  currentProductionCost: number;
  productionVolume: number;
  currentLogisticsCost: number;
  sourcingCountry: "china" | "vietnam";
}

export interface ROIResult {
  currentTotalCost: number;
  optimizedProductionCost: number;
  optimizedLogisticsCost: number;
  wtaFees: number;
  optimizedTotalCost: number;
  totalSavings: number;
  roiPercentage: number;
  paybackMonths: number;
}

// ===== Supplier Risk Assessment Types =====
export interface RiskAssessmentAnswer {
  questionId: string;
  value: number;
  label: string;
}

export interface RiskAssessmentResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
  breakdown: {
    category: string;
    score: number;
    maxScore: number;
  }[];
}

// ===== KPI Dashboard Types =====
export interface PPVData {
  standardPrice: number;
  actualPrice: number;
  quantity: number;
}

export interface TCOData {
  purchasePrice: number;
  orderingCosts: number;
  holdingCosts: number;
  qualityCosts: number;
  logisticsCosts: number;
}

export interface OTIFData {
  totalOrders: number;
  onTimeOrders: number;
  inFullOrders: number;
  onTimeInFullOrders: number;
}

// ===== CRM Types =====
export interface QualifiedLead {
  lead: LeadData;
  source: "landed_cost" | "roi_calculator" | "risk_assessment" | "kpi_dashboard";
  calculatedData: Record<string, unknown>;
  timestamp: Date;
  score: number;
}

export interface CRMSyncResult {
  success: boolean;
  provider: "zoho" | "hubspot";
  externalId?: string;
  message: string;
}
