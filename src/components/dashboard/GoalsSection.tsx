import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Target, Send, Edit } from "lucide-react";
import { motion } from "framer-motion";

interface Goal {
  id?: string;
  goal_type: 'long_term' | 'short_term';
  target_position?: string;
  target_team?: string;
  inspiration?: string;
  required_skills?: string;
  motivation?: string;
  short_term_action?: string;
}

export const GoalsSection = () => {
  const [longTermGoal, setLongTermGoal] = useState<Goal | null>(null);
  const [shortTermGoal, setShortTermGoal] = useState<Goal | null>(null);
  const [isLongTermDialogOpen, setIsLongTermDialogOpen] = useState(false);
  const [isShortTermDialogOpen, setIsShortTermDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: goals, error } = await supabase
      .from('player_goals')
      .select('*');

    if (error) {
      console.error('Error fetching goals:', error);
      return;
    }

    const longTerm = goals?.find(g => g.goal_type === 'long_term');
    const shortTerm = goals?.find(g => g.goal_type === 'short_term');

    if (longTerm) setLongTermGoal(longTerm);
    if (shortTerm) setShortTermGoal(shortTerm);
  };

  const handleSaveGoal = async (goal: Goal) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "שגיאה",
        description: "משתמש לא מחובר",
        variant: "destructive",
      });
      return;
    }

    const goalWithUserId = {
      ...goal,
      player_id: user.id,
    };

    const { data, error } = await supabase
      .from('player_goals')
      .upsert(goalWithUserId)
      .select()
      .single();

    if (error) {
      toast({
        title: "שגיאה בשמירת היעד",
        description: "אנא נסה שנית מאוחר יותר",
        variant: "destructive",
      });
      return;
    }

    if (goal.goal_type === 'long_term') {
      setLongTermGoal(data);
      setIsLongTermDialogOpen(false);
    } else {
      setShortTermGoal(data);
      setIsShortTermDialogOpen(false);
    }

    toast({
      title: "היעד נשמר בהצלחה",
      description: "המשך כך!",
    });
  };

  const handleEditLongTermGoal = () => {
    setIsLongTermDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div id="goals-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Long Term Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="h-6 w-6" />
                יעד ארוך טווח
              </CardTitle>
            </CardHeader>
            <CardContent>
              {longTermGoal ? (
                <div className="space-y-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-primary">תפקיד מבוקש</h4>
                    <p>{longTermGoal.target_position}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-primary">קבוצת יעד</h4>
                    <p>{longTermGoal.target_team}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-primary">השראה</h4>
                    <p>{longTermGoal.inspiration}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-primary">כישורים נדרשים</h4>
                    <p>{longTermGoal.required_skills}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-primary">מוטיבציה</h4>
                    <p>{longTermGoal.motivation}</p>
                  </div>
                  <Button 
                    onClick={handleEditLongTermGoal}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    ערוך יעד
                  </Button>
                </div>
              ) : (
                <Dialog open={isLongTermDialogOpen} onOpenChange={setIsLongTermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">הגדר יעד ארוך טווח</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>הגדרת יעד ארוך טווח</DialogTitle>
                    </DialogHeader>
                    <LongTermGoalForm onSave={handleSaveGoal} initialData={longTermGoal} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Short Term Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Send className="h-6 w-6" />
                יעד קצר טווח
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shortTermGoal ? (
                <div className="space-y-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1 text-secondary">פעולה לשיפור</h4>
                    <p>{shortTermGoal.short_term_action}</p>
                  </div>
                </div>
              ) : (
                <Dialog open={isShortTermDialogOpen} onOpenChange={setIsShortTermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">הגדר יעד קצר טווח</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>הגדרת יעד קצר טווח</DialogTitle>
                    </DialogHeader>
                    <ShortTermGoalForm onSave={handleSaveGoal} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const LongTermGoalForm = ({ onSave, initialData }: { onSave: (goal: Goal) => void, initialData?: Goal | null }) => {
  const [formData, setFormData] = useState<Goal>({
    goal_type: 'long_term',
    target_position: initialData?.target_position || '',
    target_team: initialData?.target_team || '',
    inspiration: initialData?.inspiration || '',
    required_skills: initialData?.required_skills || '',
    motivation: initialData?.motivation || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">באיזה תפקיד תרצה לשחק?</label>
        <Input
          value={formData.target_position}
          onChange={(e) => setFormData({ ...formData, target_position: e.target.value })}
          placeholder="למשל: חלוץ מרכזי"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">באיזו קבוצה/ליגה אתה חולם לשחק?</label>
        <Input
          value={formData.target_team}
          onChange={(e) => setFormData({ ...formData, target_team: e.target.value })}
          placeholder="למשל: מנצ'סטר יונייטד"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">מה מעורר בך השראה לגבי היעד הזה?</label>
        <Textarea
          value={formData.inspiration}
          onChange={(e) => setFormData({ ...formData, inspiration: e.target.value })}
          placeholder="ספר לנו מה מושך אותך ליעד הזה"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">אילו כישורים תצטרך כדי להגיע ליעד?</label>
        <Textarea
          value={formData.required_skills}
          onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
          placeholder="חשוב על היכולות שתצטרך לפתח"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">מה יעזור לך להמשיך גם כשקשה?</label>
        <Textarea
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          placeholder="מה נותן לך כוח להמשיך?"
        />
      </div>
      <Button type="submit" className="w-full">שמור יעד</Button>
    </form>
  );
};

const ShortTermGoalForm = ({ onSave }: { onSave: (goal: Goal) => void }) => {
  const [formData, setFormData] = useState<Goal>({
    goal_type: 'short_term',
    short_term_action: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          איזו פעולה, הרגל או התנהגות תרצה לשפר ב-1-3 החודשים הקרובים?
        </label>
        <Textarea
          value={formData.short_term_action}
          onChange={(e) => setFormData({ ...formData, short_term_action: e.target.value })}
          placeholder="למשל: לתרגל בעיטות חופשיות 30 דקות כל יום"
          className="h-32"
        />
      </div>
      <div className="text-sm text-muted-foreground">
        <p>זכור: הצבת יעדים קצרי טווח היא חשובה כדי להתקדם צעד אחר צעד לקראת החלום הגדול שלך.</p>
        <p>בחר משהו שאתה יכול להתחיל לעבוד עליו כבר עכשיו!</p>
      </div>
      <Button type="submit" className="w-full">שמור יעד</Button>
    </form>
  );
};