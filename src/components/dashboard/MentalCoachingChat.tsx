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

interface MentalCoachingChatProps {
  chatType?: string;
}

const getChatTitle = (type: string = 'mental') => {
  switch (type) {
    case 'nutrition':
      return 'שיחה עם יועץ תזונה';
    case 'strength':
      return 'שיחה עם מאמן כוח';
    case 'health':
      return 'שיחה עם יועץ בריאות';
    case 'fitness':
      return 'שיחה עם מאמן חדר כושר';
    case 'physical':
      return 'שיחה עם מאמן כושר';
    case 'technical':
      return 'שיחה עם מאמן טכני';
    case 'tactical':
      return 'שיחה עם מאמן טקטי';
    case 'sleep':
      return 'שיחה עם יועץ שינה';
    case 'motivation':
      return 'שיחה על מוטיבציה';
    default:
      return 'שיחה עם מאמן מנטאלי';
  }
};

export const MentalCoachingChat = ({ chatType = 'mental' }: MentalCoachingChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('mental-coaching-chat', {
        body: { message: userMessage, chatType }
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

  return (
    <Card className="w-full bg-gradient-to-br from-background to-background/95 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{getChatTitle(chatType)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            placeholder="שאל את המאמן..."
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
      </CardContent>
    </Card>
  );
};