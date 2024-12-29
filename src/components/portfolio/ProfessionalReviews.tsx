import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export const ProfessionalReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("professional_reviews")
        .select("*")
        .eq("player_id", user.id)
        .order("review_date", { ascending: false });

      if (data) {
        setReviews(data);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <UserCircle className="h-10 w-10 text-blue-500" />
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{review.reviewer_name}</h3>
                    <p className="text-sm text-muted-foreground">{review.reviewer_role}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.review_date).toLocaleDateString("he-IL")}
                  </span>
                </div>
                <p className="mt-2">{review.review_text}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {reviews.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          לא נמצאו חוות דעת
        </div>
      )}
    </div>
  );
};