import { TrainingSummaryForm } from "./TrainingSummaryForm";
import { TrainingSummaryList } from "./TrainingSummaryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TrainingSummaryDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-right mb-6">סיכום אימון</h1>
      
      <Tabs defaultValue="new" dir="rtl">
        <TabsList className="w-full justify-end mb-6">
          <TabsTrigger value="new">סיכום חדש</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <TrainingSummaryForm />
        </TabsContent>

        <TabsContent value="history">
          <TrainingSummaryList />
        </TabsContent>
      </Tabs>
    </div>
  );
};