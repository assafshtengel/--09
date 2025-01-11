import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type CoachType = 'mental' | 'nutrition' | 'fitness' | 'tactical' | 'technical' | 'strength';

const coachTypes: Record<CoachType, string> = {
  mental: "מאמן מנטאלי",
  nutrition: "מאמן תזונה",
  fitness: "מאמן כושר",
  tactical: "מאמן טקטי",
  technical: "מאמן טכני",
  strength: "מאמן כוח"
};

export const MentalCoachingChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachType | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedCoach) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('mental-coaching-chat', {
        body: { 
          message: userMessage,
          coachType: selectedCoach
        }
      });

      if (error) throw error;

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('שגיאה בשליחת ההודעה, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectCoach = async (type: CoachType) => {
    setSelectedCoach(type);
    setMessages([]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mental-coaching-chat', {
        body: { 
          message: "התחל שיחה",
          coachType: type
        }
      });

      if (error) throw error;

      // Add initial coach message
      setMessages([{ role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('שגיאה בהתחלת השיחה, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-background to-background/95 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">התייעצות עם מאמן</CardTitle>
        {!selectedCoach && (
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.entries(coachTypes) as [CoachType, string][]).map(([type, title]) => (
              <Button
                key={type}
                onClick={() => selectCoach(type)}
                variant="outline"
                className="flex-1"
              >
                {title}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedCoach && (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">{coachTypes[selectedCoach]}</span>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCoach(null);
                  setMessages([]);
                }}
              >
                החלף מאמן
              </Button>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2 rounded-lg bg-muted p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">המאמן מקליד...</span>
                  </div>
                </motion.div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`שאל את ${coachTypes[selectedCoach]}...`}
                className="min-h-[80px]"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};