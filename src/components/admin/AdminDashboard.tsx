import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, MessageSquare, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AdminDashboard = () => {
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: playersCount } = useQuery({
    queryKey: ['playersCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count;
    }
  });

  const { data: recentActions } = useQuery({
    queryKey: ['recentActions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: userGames, isLoading: isLoadingGames } = useQuery({
    queryKey: ['userGames', selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data: games } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          opponent,
          final_score,
          status,
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya,
            match_date,
            match_time
          ),
          match_actions (
            id,
            action_id,
            minute,
            result,
            note
          ),
          match_notes (
            id,
            minute,
            note
          )
        `)
        .eq('player_id', selectedUser.id)
        .order('match_date', { ascending: false });

      return games;
    }
  });

  const handleSendEmail = async (email: string) => {
    try {
      console.log('Attempting to send email to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          to: [email],
          subject: "הודעה מהמערכת",
          html: "<p>תוכן ההודעה כאן</p>"
        }
      });

      console.log('Email send response:', { data, error });

      if (error) {
        console.error('Detailed email error:', error);
        throw error;
      }

      toast.success("המייל נשלח בהצלחה");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל: " + (error.message || 'Unknown error'));
    }
  };

  const handleSendWhatsApp = async (phoneNumber: string) => {
    try {
      console.log('Attempting to send WhatsApp message to:', phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          recipientId: selectedUser.id,
          message: "הודעה מהמערכת",
          notificationId: "manual-admin"
        }
      });

      console.log('WhatsApp send response:', { data, error });

      if (error) {
        console.error('Detailed WhatsApp error:', error);
        throw error;
      }
      
      toast.success("ההודעה נשלחה בהצלחה");
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error("שגיאה בשליחת ההודעה: " + (error.message || 'Unknown error'));
    }
  };

  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchQuery)
    );
  });

  const formatGameDate = (date: string, time?: string) => {
    const formattedDate = format(new Date(date), 'dd/MM/yyyy');
    return time ? `${formattedDate} ${time}` : formattedDate;
  };

  // Add this query to find Liam specifically
  const { data: liamData } = useQuery({
    queryKey: ['liamProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%ליאם אורצקי%');
      
      if (error) {
        console.error('Error finding Liam:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log('Found Liam\'s profile:', data[0]);
        
        // Now fetch his games
        const { data: games, error: gamesError } = await supabase
          .from('matches')
          .select(`
            *,
            pre_match_report:pre_match_report_id (
              actions,
              questions_answers,
              havaya,
              match_date,
              match_time
            ),
            match_actions (
              id,
              action_id,
              minute,
              result,
              note
            ),
            match_notes (
              id,
              minute,
              note
            )
          `)
          .eq('player_id', data[0].id)
          .order('match_date', { ascending: false });
          
        if (gamesError) {
          console.error('Error finding Liam\'s games:', gamesError);
        } else {
          console.log('Liam\'s games:', games);
        }
      }
      
      return data;
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer" onClick={() => setShowUsersDialog(true)}>
          <CardHeader>
            <CardTitle>סטטיסטיקות כלליות</CardTitle>
          </CardHeader>
          <CardContent>
            <p>מספר שחקנים רשומים: {playersCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פעולות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions?.map((action) => (
                <div key={action.id} className="text-sm">
                  <p>{action.action} - {action.entity_type}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(action.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>רשימת משתמשים</DialogTitle>
            <DialogDescription>
              חיפוש וניהול משתמשים במערכת
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם, מייל או טלפון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filteredUsers?.map((user) => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setSelectedUser(user);
                  setShowActionsDialog(true);
                }}
              >
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold">שם מלא:</p>
                      <p>{user.full_name || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">אימייל:</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold">מועדון:</p>
                      <p>{user.club || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">טלפון:</p>
                      <p>{user.phone_number || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">תפקיד:</p>
                      <p>{user.role || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">קטגוריית גיל:</p>
                      <p>{user.age_category || 'לא צוין'}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendEmail(user.email);
                      }}
                    >
                      <Mail className="h-4 w-4 ml-2" />
                      שלח מייל
                    </Button>
                    {user.phone_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsApp(user.phone_number);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 ml-2" />
                        שלח הודעת וואטסאפ
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>משחקים של {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>
              רשימת כל המשחקים והפעילויות של השחקן
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-4">
              {isLoadingGames ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="mr-2">טוען משחקים...</span>
                </div>
              ) : userGames && userGames.length > 0 ? (
                userGames.map((game) => (
                  <Card key={game.id} className="hover:bg-gray-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>נגד {game.opponent || 'לא צוין'}</span>
                          {game.status === 'completed' && (
                            <Badge variant="secondary">הושלם</Badge>
                          )}
                        </div>
                        <span className="text-sm">
                          {formatGameDate(game.match_date, game.pre_match_report?.match_time)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {game.final_score && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium">תוצאה סופית: {game.final_score}</p>
                          </div>
                        )}
                        
                        {game.pre_match_report && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">דוח טרום משחק</h4>
                            {game.pre_match_report.havaya && (
                              <div className="mb-2">
                                <p className="text-sm font-medium mb-1">הוויות:</p>
                                <div className="flex flex-wrap gap-2">
                                  {game.pre_match_report.havaya.split(',').map((havaya, index) => (
                                    <Badge key={index} variant="outline">
                                      {havaya.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {game.pre_match_report.actions && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">יעדים:</p>
                                <div className="space-y-1">
                                  {Array.isArray(game.pre_match_report.actions) && 
                                    game.pre_match_report.actions.map((action: any, index: number) => (
                                      <p key={index} className="text-sm">
                                        {action.name}: {action.goal || 'לא הוגדר יעד'}
                                      </p>
                                    ))
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {game.match_actions && game.match_actions.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">פעולות במשחק</h4>
                            <div className="space-y-2">
                              {game.match_actions.map((action) => (
                                <div key={action.id} className="border-b border-gray-200 pb-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">דקה {action.minute}</span>
                                    <Badge variant={action.result === 'success' ? 'default' : 'destructive'}>
                                      {action.result === 'success' ? 'הצלחה' : 'כישלון'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm mt-1">{action.action_id}</p>
                                  {action.note && (
                                    <p className="text-sm text-gray-600 mt-1">{action.note}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {game.match_notes && game.match_notes.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">הערות משחק</h4>
                            <div className="space-y-2">
                              {game.match_notes.map((note) => (
                                <div key={note.id} className="text-sm">
                                  <span className="font-medium">דקה {note.minute}: </span>
                                  <span>{note.note}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין משחקים לשחקן זה
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
