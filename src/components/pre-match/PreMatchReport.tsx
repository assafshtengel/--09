import { useState } from "react";
import { Action, ActionSelector } from "@/components/ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { SocialShareGoals } from "./SocialShareGoals";
import { HavayotTextInput } from "./HavayotTextInput";
import { ObserverLinkDialog } from "./ObserverLinkDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Link, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "dashboard" | "details" | "intro" | "havayot" | "actions" | "questions" | "summary"
  >("dashboard");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>({});
  const [havayot, setHavayot] = useState<Record<string, string>>({});
  const [reportId, setReportId] = useState<string | null>(null);
  const [showObserverLink, setShowObserverLink] = useState(false);
  const [observerToken, setObserverToken] = useState<string | null>(null);

  const steps = [
    { id: "dashboard", label: "התחלה" },
    { id: "details", label: "פרטי משחק" },
    { id: "intro", label: "הקדמה" },
    { id: "havayot", label: "הוויות" },
    { id: "actions", label: "יעדים" },
    { id: "questions", label: "שאלון" },
    { id: "summary", label: "סיכום" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleMatchDetailsSubmit = async (details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: report, error } = await supabase
        .from("pre_match_reports")
        .insert({
          player_id: user.id,
          match_date: details.date,
          match_time: details.time,
          opponent: details.opponent,
          status: "draft",
          actions: [],
          questions_answers: []
        })
        .select()
        .single();

      if (error) throw error;
      
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          player_id: user.id,
          match_date: details.date,
          opponent: details.opponent,
          pre_match_report_id: report.id,
          status: 'preview'
        })
        .select('observer_token')
        .single();

      if (matchError) throw matchError;
      
      setReportId(report.id);
      setMatchDetails(details);
      setObserverToken(match.observer_token);
      setCurrentStep("intro");
      
      toast.success("פרטי המשחק נשמרו");
    } catch (error) {
      console.error("Error saving match details:", error);
      toast.error("שגיאה בשמירת פרטי המשחק");
    }
  };

  const handleHavayotSubmit = async (havayotInputs: Record<string, string>) => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from("pre_match_reports")
        .update({
          havaya: JSON.stringify(havayotInputs)
        })
        .eq("id", reportId);

      if (error) throw error;

      setHavayot(havayotInputs);
      setCurrentStep("actions");
      toast.success("ההוויות נשמרו");
    } catch (error) {
      console.error("Error saving havayot:", error);
      toast.error("שגיאה בשמירת ההוויות");
    }
  };

  const handleActionsSubmit = async (actions: Action[]) => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from("pre_match_reports")
        .update({
          actions: JSON.stringify(actions)
        })
        .eq("id", reportId);

      if (error) throw error;

      setSelectedActions(actions);
      setCurrentStep("questions");
      toast.success("הפעולות נשמרו");
    } catch (error) {
      console.error("Error saving actions:", error);
      toast.error("שגיאה בשמירת הפעולות");
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from("pre_match_reports")
        .update({
          questions_answers: answers,
          status: "completed"
        })
        .eq("id", reportId);

      if (error) throw error;

      setQuestionsAnswers(answers);
      setCurrentStep("summary");
      toast.success("התשובות נשמרו");
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("שגיאה בשמירת התשובות");
    }
  };

  const handleFinalSubmit = async () => {
    await Promise.resolve();
    navigate("/dashboard");
  };

  const handleEditHavaya = (category: string) => {
    setCurrentStep("havayot");
  };

  const renderHavayotByCategory = () => {
    if (Object.entries(havayot).length === 0) return null;

    const categories = Object.entries(havayot).filter(([category]) => havayot[category]);
    const rows = [];
    
    for (let i = 0; i < categories.length; i += 2) {
      const row = categories.slice(i, i + 2);
      rows.push(row);
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-center mb-3">
          ההוויות שבחרת למשחק
        </h3>
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-3">
              {row.map(([category]) => (
                havayot[category] && (
                  <div key={category} className="flex items-center justify-between space-x-2 bg-gray-50/50 rounded-lg p-2">
                    <button
                      onClick={() => handleEditHavaya(category)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-gray-400" />
                    </button>
                    <div className="flex items-center justify-end flex-grow">
                      <div
                        className={`text-xs px-3 py-1 rounded-full border transition-colors`}
                      >
                        {havayot[category]}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderStep = () => {
    const commonProps = {
      className: "w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 }
    };

    return (
      <AnimatePresence mode="wait">
        {currentStep === "dashboard" && (
          <motion.div {...commonProps} key="dashboard">
            <PreMatchDashboard onCreateNew={() => setCurrentStep("details")} />
          </motion.div>
        )}

        {currentStep === "details" && (
          <motion.div {...commonProps} key="details">
            <MatchDetailsForm
              onSubmit={(details) => {
                handleMatchDetailsSubmit(details);
                setCurrentStep("intro");
              }}
              initialData={matchDetails}
            />
          </motion.div>
        )}

        {currentStep === "intro" && (
          <motion.div {...commonProps} key="intro">
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardContent className="p-8 space-y-8">
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-center text-primary"
                  >
                    חשיבות ההוויות למשחק שלך
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-700 text-center leading-relaxed"
                  >
                    הוויות הן הבסיס להכנה מנטלית ומקצועית מוצלחת. מחקרים מראים שכתיבת ההוויות מעלה את המחויבות והמוטיבציה, ומשפרת את הביצועים שלך על המגרש.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center"
                  >
                    <Button 
                      onClick={() => setCurrentStep("havayot")}
                      size="lg"
                      className="text-lg px-8 py-6"
                    >
                      הבנתי, בוא נתחיל
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {currentStep === "havayot" && (
          <motion.div {...commonProps} key="havayot">
            <div className="space-y-8">
              {observerToken && (
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowObserverLink(true)}
                    className="flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Link className="h-4 w-4" />
                    קישור למשקיף
                  </Button>
                </div>
              )}
              <HavayotTextInput onSubmit={handleHavayotSubmit} />
            </div>
          </motion.div>
        )}

        {currentStep === "actions" && (
          <motion.div {...commonProps} key="actions">
            <div className="space-y-8">
              {renderHavayotByCategory()}
              <ActionSelector
                position={matchDetails.position || "forward"}
                onSubmit={handleActionsSubmit}
              />
              <SocialShareGoals goals={selectedActions} />
            </div>
          </motion.div>
        )}

        {currentStep === "questions" && (
          <motion.div {...commonProps} key="questions">
            <PreMatchQuestionnaire 
              onSubmit={handleQuestionsSubmit}
              onNext={() => setCurrentStep("summary")}
            />
          </motion.div>
        )}

        {currentStep === "summary" && (
          <motion.div {...commonProps} key="summary">
            <PreMatchSummary
              matchDetails={matchDetails}
              actions={selectedActions}
              answers={questionsAnswers}
              havaya={Object.values(havayot)}
              aiInsights={[]}
              onFinish={handleFinalSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {currentStep !== "dashboard" && (
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-right">
                {steps.find(step => step.id === currentStep)?.label}
              </h1>
              <div className="text-sm text-gray-500">
                שלב {currentStepIndex + 1} מתוך {steps.length}
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-4">
              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex - 1].id as any)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                  חזור
                </button>
              )}
              
              {currentStep !== "summary" && currentStepIndex < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex + 1].id as any)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mr-auto"
                >
                  המשך
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {renderStep()}

        <ObserverLinkDialog
          open={showObserverLink}
          onOpenChange={setShowObserverLink}
          observerToken={observerToken}
        />
      </div>
    </div>
  );
};
