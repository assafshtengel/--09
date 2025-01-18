import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, MessageSquare, Search, Loader2, AlertCircle, Download, Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminDashboard = () => {
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showGamesDialog, setShowGamesDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Query to check data integrity between tables
  const { data: dataIntegrityCheck, isLoading: isCheckingIntegrity } = useQuery({
    queryKey: ['dataIntegrityCheck'],
    queryFn: async () => {
      console.log('Checking data integrity between tables...');
      
      // Get all matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, player_id, match_date, opponent, pre_match_report_id');
      
      if (matchesError) {
        console.error('Error checking matches:', matchesError);
        return { error: matchesError };
      }

      // Get all pre_match_reports
      const { data: reports } = await supabase
        .from('pre_match_reports')
        .select('id, player_id, match_date');

      // Get all match_actions
      const { data: actions } = await supabase
        .from('match_actions')
        .select('id, match_id');

      // Get all match_notes
      const { data: notes } = await supabase
        .from('match_notes')
        .select('id, match_id');

      // Check for orphaned records
      const matchIds = new Set(matches?.map(m => m.id) || []);
      
      const orphanedReports = reports?.filter(r => 
        !matches?.some(m => m.pre_match_report_id === r.id)
      ) || [];

      const orphanedActions = actions?.filter(a => !matchIds.has(a.match_id)) || [];
      const orphanedNotes = notes?.filter(n => !matchIds.has(n.match_id)) || [];

      return {
        matches: matches || [],
        orphanedReports,
        orphanedActions,
        orphanedNotes,
        hasIssues: orphanedReports.length > 0 || orphanedActions.length > 0 || orphanedNotes.length > 0
      };
    }
  });

  // Query to fetch all games with player names and related data
  const { data: games, isLoading: isLoadingAllGames } = useQuery({
    queryKey: ['adminGames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches_with_players')
        .select(`
          *,
          pre_match_report:pre_match_report_id (
            id,
            actions,
            questions_answers,
            havaya
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
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching games:', error);
        throw error;
      }

      return data || [];
    }
  });

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
      console.log('Fetching users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data;
    }
  });

  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameIds(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      for (const gameId of selectedGameIds) {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', gameId);

        if (error) throw error;
      }

      toast.success("המשחקים נמחקו בהצלחה");
      setSelectedGameIds([]);
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting games:', error);
      toast.error("שגיאה במחיקת המשחקים");
    }
  };

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

  const formatGameDate = (date: string, time?: string) => {
    const formattedDate = format(new Date(date), 'dd/MM/yyyy');
    return time ? `${formattedDate} ${time}` : formattedDate;
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      
      {dataIntegrityCheck?.hasIssues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            נמצאו בעיות בקשרים בין הטבלאות:
            {dataIntegrityCheck.orphanedReports.length > 0 && (
              <div>• {dataIntegrityCheck.orphanedReports.length} דוחות טרום משחק לא מקושרים</div>
            )}
            {dataIntegrityCheck.orphanedActions.length > 0 && (
              <div>• {dataIntegrityCheck.orphanedActions.length} פעולות משחק לא מקושרות</div>
            )}
            {dataIntegrityCheck.orphanedNotes.length > 0 && (
              <div>• {dataIntegrityCheck.orphanedNotes.length} הערות משחק לא מקושרות</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="users">משתמשים</TabsTrigger>
          <TabsTrigger value="games">רשימת משחקים</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer" onClick={() => setShowUsersDialog(true)}>
              <CardHeader>
                <CardTitle>סטטיסטיקות כלליות</CardTitle>
              </CardHeader>
              <CardContent>
                <p>מספר שחקנים רשומים: {playersCount || 0}</p>
                <p>מספר משחקים במערכת: {dataIntegrityCheck?.matches.length || 0}</p>
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
        </TabsContent>

        <TabsContent value="users">
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
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>רשימת משחקים</CardTitle>
              <div className="flex gap-2">
                {selectedGameIds.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirmDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    מחק משחקים ({selectedGameIds.length})
                  </Button>
                )}
                <Button variant="outline" onClick={handleExportGames}>
                  <Download className="h-4 w-4 ml-2" />
                  ייצוא לקובץ CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="חיפוש לפי שם שחקן או יריבה..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="סינון לפי סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="preview">טרום משחק</SelectItem>
                    <SelectItem value="playing">במהלך משחק</SelectItem>
                    <SelectItem value="ended">הסתיים</SelectItem>
                    <SelectItem value="missing_report">ללא דוח טרום משחק</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {isLoadingAllGames ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="mr-2">טוען משחקים...</span>
                    </div>
                  ) : filteredGames?.length ? (
                    filteredGames.map((game) => (
                      <Card 
                        key={game.id}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                          !game.pre_match_report ? 'border-yellow-400' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <Checkbox
                              checked={selectedGameIds.includes(game.id)}
                              onCheckedChange={() => handleGameSelect(game.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <div className="flex-1 mx-4">
                              <h3 className="font-semibold">{game.player_name}</h3>
                              <p className="text-sm text-gray-600">נגד {game.opponent || 'לא צוין'}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-sm">{format(new Date(game.match_date), 'dd/MM/yyyy')}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant={game.status === 'ended' ? 'default' : 'secondary'}>
                                  {game.status === 'preview' ? 'טרום משחק' :
                                   game.status === 'playing' ? 'במהלך משחק' : 'הסתיים'}
                                </Badge>
                                {!game.pre_match_report && (
                                  <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                                    חסר דוח טרום משחק
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {game.status === 'ended' && (
                            <div className="mt-2 flex justify-between text-sm">
                              <span>תוצאה סופית: {game.final_score || 'לא צוין'}</span>
                              <span>דקות משחק: {game.played_minutes || 'לא צוין'}</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => {
                              setSelectedGame(game);
                              setShowGamesDialog(true);
                            }}
                          >
                            הצג פרטים מלאים
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      לא נמצאו משחקים
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Details Dialog */}
      <Dialog open={showGamesDialog} onOpenChange={setShowGamesDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי משחק מלאים</DialogTitle>
            <DialogDescription>
              {selectedGame?.player_name} נגד {selectedGame?.opponent}
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">מידע כללי</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">תאריך:</p>
                    <p>{format(new Date(selectedGame.match_date), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">סטטוס:</p>
                    <p>{selectedGame.status === 'preview' ? 'טרום משחק' :
                        selectedGame.status === 'playing' ? 'במהלך משחק' : 'הסתיים'}</p>
                  </div>
                  {selectedGame.final_score && (
                    <div>
                      <p className="text-sm font-medium">תוצאה סופית:</p>
                      <p>{selectedGame.final_score}</p>
                    </div>
                  )}
                  {selectedGame.played_minutes && (
                    <div>
                      <p className="text-sm font-medium">דקות משחק:</p>
                      <p>{selectedGame.played_minutes}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedGame.pre_match_report && (
                <>
                  {selectedGame.pre_match_report.havaya && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">הוויות נבחרות</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGame.pre_match_report.havaya.split(',').map((havaya, index) => (
                          <Badge key={index} variant="secondary">
                            {havaya.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(selectedGame.pre_match_report.actions) && 
                   selectedGame.pre_match_report.actions.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">יעדים ומטרות</h3>
                      <div className="space-y-2">
                        {selectedGame.pre_match_report.actions.map((action: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-2">
                            <p className="font-medium">{action.name}</p>
                            {action.goal && (
                              <p className="text-sm text-gray-600">יעד: {action.goal}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(selectedGame.pre_match_report.questions_answers) && 
                   selectedGame.pre_match_report.questions_answers.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">תשובות לשאלות</h3>
                      <div className="space-y-4">
                        {selectedGame.pre_match_report.questions_answers.map((qa: any, index: number) => (
                          <div key={index}>
                            <p className="font-medium">{qa.question}</p>
                            <p className="text-sm text-gray-600 mt-1">{qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedGame.match_actions?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">פעולות במשחק</h3>
                  <div className="space-y-2">
                    {selectedGame.match_actions.map((action: any) => (
                      <div key={action.id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span>דקה {action.minute}</span>
                        <Badge variant={action.result === 'success' ? 'default' : 'destructive'}>
                          {action.result === 'success' ? 'הצלחה' : 'כישלון'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את המשחקים שנבחרו?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק {selectedGameIds.length} משחקים לצמיתות. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>
              מחק משחקים
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {isLoadingUserGames ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="mr-2">טוען משחקים...</span>
                </div>
              ) : userGames && userGames.length > 0 ? (
                userGames.map((game) => (
                  <Card key={game.id} className={`hover:bg-gray-50 transition-colors ${
                    game.hasIncompleteData ? 'border-yellow-400' : ''
                  }`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>נגד {game.opponent || 'לא צוין'}</span>
                          {game.status === 'completed' && (
                            <Badge variant="secondary">הושלם</Badge>
                          )}
                          {game.hasIncompleteData && (
                            <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                              חסרים נתונים
                            </Badge>
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

                        {!game.pre_match_report && !game.match_actions.length && !game.match_notes.length && (
                          <div className="text-center py-4 text-gray-500">
                            לא נמצאו נתונים נוספים למשחק זה
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  לא נמצאו משחקים לשחקן זה. ייתכן שהנתונים לא נשמרו כראוי או שחסר מידע.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};
