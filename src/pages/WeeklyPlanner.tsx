import { WeeklyPlannerLayout } from "@/components/schedule/WeeklyPlannerLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const WeeklyPlanner = () => {
  return (
    <ProtectedRoute>
      <WeeklyPlannerLayout />
    </ProtectedRoute>
  );
};

export default WeeklyPlanner;