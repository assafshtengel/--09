import { PreMatchReport as PreMatchReportComponent } from "@/components/pre-match/PreMatchReport";

export const PreMatchReport = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">דוח טרום משחק</h1>
      <PreMatchReportComponent />
    </div>
  );
};