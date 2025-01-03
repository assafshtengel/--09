import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Attribute {
  id: string;
  name: string;
  description: string;
}

export const PreMatchExperience = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const { data, error } = await supabase
          .from('pre_match_attributes')
          .select('*');

        if (error) throw error;
        setAttributes(data || []);
      } catch (error) {
        console.error('Error loading attributes:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את רשימת התכונות",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAttributes();
  }, [toast]);

  const handleAttributeSelect = (attributeId: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      }
      if (prev.length >= 4) {
        toast({
          title: "הגבלת בחירה",
          description: "ניתן לבחור עד 4 תכונות",
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, attributeId];
    });
  };

  const handleNext = async () => {
    if (selectedAttributes.length < 3) {
      toast({
        title: "בחירה לא מספקת",
        description: "יש לבחור לפחות 3 תכונות",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { error } = await supabase
        .from('pre_match_attribute_selections')
        .insert(
          selectedAttributes.map(attributeId => ({
            player_id: user.id,
            match_id: matchId,
            attribute_id: attributeId
          }))
        );

      if (error) throw error;

      navigate(`/match/${matchId}/actions`);
    } catch (error) {
      console.error('Error saving selections:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הבחירות",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-right mb-6">בחר תכונות למשחק</h1>
      <p className="text-right text-gray-600 mb-4">
        בחר 3-4 תכונות שברצונך להתמקד בהן במשחק הקרוב
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {attributes.map((attribute) => (
          <motion.div
            key={attribute.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-4 rounded-lg border cursor-pointer transition-colors
              ${selectedAttributes.includes(attribute.id)
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-gray-50 border-gray-200'}
            `}
            onClick={() => handleAttributeSelect(attribute.id)}
          >
            <div className="flex items-start justify-between">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${selectedAttributes.includes(attribute.id)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'}
              `}>
                {selectedAttributes.includes(attribute.id) && <Check className="w-4 h-4" />}
              </div>
              <div className="flex-grow text-right mr-4">
                <h3 className="font-semibold">{attribute.name}</h3>
                <p className="text-sm text-gray-600">{attribute.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={handleNext}
          disabled={selectedAttributes.length < 3}
          className="ml-auto"
        >
          המשך
        </Button>
      </div>
    </div>
  );
};