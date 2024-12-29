import { Button } from "@/components/ui/button";
import { Share2, Facebook, Instagram } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SocialShareGoalsProps {
  goals: Array<{ name: string; goal?: string }>;
}

export const SocialShareGoals = ({ goals }: SocialShareGoalsProps) => {
  const { toast } = useToast();

  const generateShareText = () => {
    const goalsText = goals
      .filter(g => g.goal)
      .map(g => `${g.name}: ${g.goal}`)
      .join("\n");
    
    return `היעדים שלי למשחק הקרוב 🎯⚽️:\n\n${goalsText}\n\n#כדורגל #מטרות #ביצועים`;
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${text}`, '_blank');
  };

  const shareToInstagram = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      toast({
        title: "הטקסט הועתק",
        description: "עכשיו אפשר להדביק את זה באינסטגרם",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להעתיק את הטקסט",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-right">שתף את המטרות שלך</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/10 p-4 rounded-lg space-y-2 text-right">
          <h4 className="font-semibold text-lg">למה כדאי לשתף את המטרות?</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>הגברת המחויבות - כשמשתפים מטרות בפומבי, המוטיבציה להשיג אותן גדלה</li>
            <li>תמיכה מהסביבה - חברים ומשפחה יכולים לעודד ולתמוך בדרך להשגת המטרות</li>
            <li>השראה לאחרים - המטרות שלך יכולות להשפיע ולעודד שחקנים אחרים</li>
            <li>מעקב והתקדמות - שיתוף מטרות עוזר לעקוב אחר ההתקדמות לאורך זמן</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            onClick={shareToFacebook}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Facebook className="h-4 w-4" />
            שתף בפייסבוק
          </Button>
          <Button
            onClick={shareToInstagram}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            העתק לאינסטגרם
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};