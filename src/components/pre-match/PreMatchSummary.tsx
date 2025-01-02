import { useState } from "react";
import html2canvas from "html2canvas";
import { SummaryContent } from "./summary/SummaryContent";
import { SummaryButtons } from "./summary/SummaryButtons";
import type { Action } from "@/components/ActionSelector";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string[];
  aiInsights: string[];
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
}: PreMatchSummaryProps) => {
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const element = document.getElementById('pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>דוח טרום משחק</title>
            <style>
              body { 
                margin: 0; 
                display: flex; 
                justify-content: center;
                padding: 20px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              img { 
                max-width: 100%; 
                height: auto; 
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL()}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SummaryContent
        matchDetails={matchDetails}
        actions={actions}
        answers={answers}
        havaya={havaya}
        aiInsights={aiInsights}
      />
      
      <SummaryButtons
        onPrint={handlePrint}
        isEmailSending={isEmailSending}
        isPrinting={isPrinting}
      />
    </div>
  );
};