import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SocialShareGoalsProps {
  goals: Array<{ name: string; goal?: string }>;
}

export const SocialShareGoals = ({ goals }: SocialShareGoalsProps) => {
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
      </CardContent>
    </Card>
  );
};