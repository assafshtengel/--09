import { Navigation } from "@/components/Navigation";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";

const TrainingSummaryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TrainingSummaryDashboard />
    </div>
  );
};

export default TrainingSummaryPage;