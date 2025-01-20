import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Target, Send, Printer, Mail } from "lucide-react";
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
    const { data, error } = await supabase
      .from('player_goals')
      .upsert([goal])
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

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    try {
      const response = await fetch('/api/send-goals-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longTermGoal,
          shortTermGoal,
        }),
      });

      if (response.ok) {
        toast({
          title: "היעדים נשלחו בהצלחה",
          description: "בדוק את תיבת הדואר שלך",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בשליחת הדואר",
        description: "אנא נסה שנית מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 ml-2" />
          הדפס יעדים
        </Button>
        <Button variant="outline" onClick={handleEmail}>
          <Mail className="h-4 w-4 ml-2" />
          שלח במייל
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Long Term Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                יעד ארוך טווח
              </CardTitle>
            </CardHeader>
            <CardContent>
              {longTermGoal ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">תפקיד מבוקש</h4>
                    <p>{longTermGoal.target_position}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">קבוצת יעד</h4>
                    <p>{longTermGoal.target_team}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">השראה</h4>
                    <p>{longTermGoal.inspiration}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">כישורים נדרשים</h4>
                    <p>{longTermGoal.required_skills}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">מוטיבציה</h4>
                    <p>{longTermGoal.motivation}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLongTermDialogOpen(true)}
                  >
                    ערוך יעד
                  </Button>
                </div>
              ) : (
                <Dialog open={isLongTermDialogOpen} onOpenChange={setIsLongTermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>הגדר יעד ארוך טווח</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>הגדרת יעד ארוך טווח</DialogTitle>
                    </DialogHeader>
                    <LongTermGoalForm onSave={handleSaveGoal} />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-6 w-6" />
                יעד קצר טווח
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shortTermGoal ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">פעולה לשיפור</h4>
                    <p>{shortTermGoal.short_term_action}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsShortTermDialogOpen(true)}
                  >
                    ערוך יעד
                  </Button>
                </div>
              ) : (
                <Dialog open={isShortTermDialogOpen} onOpenChange={setIsShortTermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>הגדר יעד קצר טווח</Button>
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

const LongTermGoalForm = ({ onSave }: { onSave: (goal: Goal) => void }) => {
  const [formData, setFormData] = useState<Goal>({
    goal_type: 'long_term',
    target_position: '',
    target_team: '',
    inspiration: '',
    required_skills: '',
    motivation: '',
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