import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video } from "lucide-react";

export const MediaGallery = () => {
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("player_media")
        .select("*")
        .eq("player_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setMedia(data);
      }
    };

    fetchMedia();
  }, []);

  const images = media.filter(item => item.media_type === "image");
  const videos = media.filter(item => item.media_type === "video");

  return (
    <Tabs defaultValue="images" dir="rtl">
      <TabsList className="w-full justify-start mb-4">
        <TabsTrigger value="images" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          תמונות
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          סרטונים
        </TabsTrigger>
      </TabsList>

      <TabsContent value="images">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-2">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded"
                />
                <div className="mt-2 text-sm font-medium">{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {images.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            לא נמצאו תמונות
          </div>
        )}
      </TabsContent>

      <TabsContent value="videos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-2">
                <video
                  src={item.url}
                  controls
                  className="w-full rounded"
                  poster={item.thumbnail_url}
                />
                <div className="mt-2 text-sm font-medium">{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {videos.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            לא נמצאו סרטונים
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};