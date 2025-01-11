import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedCoach) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('mental-coaching-chat', {
        body: { 
          message: userMessage,
          coachType: selectedCoach
        }
      });

      if (error) throw error;

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
    setIsDialogOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('mental-coaching-chat', {
        body: { 
          message: "התחל שיחה",
          coachType: type
        }
      });

      if (error) throw error;

      setMessages([{ role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('שגיאה בהתחלת השיחה, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const closeChat = () => {
    setIsDialogOpen(false);
    setSelectedCoach(null);
    setMessages([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">התייעצות עם מאמן</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.entries(coachTypes) as [CoachType, string][]).map(([type, title]) => (
            <Button
              key={type}
              onClick={() => selectCoach(type)}
              variant="outline"
              className="h-16 relative overflow-hidden group bg-white hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span className="relative z-10">{title}</span>
              <motion.div
                className="absolute inset-0 bg-primary/10 group-hover:bg-primary/100 transition-all duration-300"
                initial={false}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              />
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCoach && coachTypes[selectedCoach]}</span>
              <Button variant="ghost" size="sm" onClick={closeChat}>
                סגור
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full p-4">
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
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`שאל את ${selectedCoach ? coachTypes[selectedCoach] : 'המאמן'}...`}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};