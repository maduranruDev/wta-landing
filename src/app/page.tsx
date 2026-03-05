import { HeroSection } from "@/components/layout/HeroSection";
import { LandedCostCalculator } from "@/components/calculators/LandedCostCalculator";
import { ROICalculator } from "@/components/calculators/ROICalculator";
import { SupplierRiskAssessment } from "@/components/assessments/SupplierRiskAssessment";
import { KPIDashboard } from "@/components/calculators/KPIDashboard";
import { GatekeeperModal } from "@/components/layout/GatekeeperModal";

export default function Home() {
  return (
    <>
      <GatekeeperModal />
      <HeroSection />
      <section id="landed-cost" className="scroll-mt-20">
        <LandedCostCalculator />
      </section>
      <section id="roi-sourcing" className="scroll-mt-20">
        <ROICalculator />
      </section>
      <section id="risk-assessment" className="scroll-mt-20">
        <SupplierRiskAssessment />
      </section>
      <section id="kpi-dashboard" className="scroll-mt-20">
        <KPIDashboard />
      </section>
    </>
  );
}
