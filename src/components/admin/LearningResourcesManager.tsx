import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, BookOpen, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  url: string;
}

interface NewLearningResource {
  title: string;
  description: string;
  type: 'video' | 'article';
  url: string;
}

export const LearningResourcesManager = ({ initialResources }: { initialResources: LearningResource[] }) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<LearningResource[]>(initialResources);
  const [newResource, setNewResource] = useState<NewLearningResource>({
    title: '',
    description: '',
    type: 'video',
    url: ''
  });

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.type || !newResource.url) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("learning_resources")
        .insert(newResource)
        .select()
        .single();

      if (error) throw error;

      setResources([data, ...resources]);
      setNewResource({
        title: '',
        description: '',
        type: 'video',
        url: ''
      });
      
      toast({
        title: "המשאב נוסף בהצלחה",
        description: "המשאב החדש זמין כעת לכל המשתמשים",
      });
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשאב",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("learning_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setResources(resources.filter(resource => resource.id !== id));
      
      toast({
        title: "המשאב נמחק בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המשאב",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול משאבי למידה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="כותרת"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
            <Textarea
              placeholder="תיאור"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            />
            <Select
              value={newResource.type}
              onValueChange={(value: 'video' | 'article') => setNewResource({ ...newResource, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג משאב" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">סרטון</SelectItem>
                <SelectItem value="article">מאמר</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="קישור"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
            />
            <Button onClick={handleAddResource} className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              הוסף משאב
            </Button>
          </div>

          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  {resource.type === 'video' ? (
                    <Video className="h-5 w-5 ml-2" />
                  ) : (
                    <BookOpen className="h-5 w-5 ml-2" />
                  )}
                  <div>
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-gray-500">{resource.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};