import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePictureUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export const ProfilePictureUpload = ({ onUploadComplete, onUploadError }: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (error) {
      onUploadError(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleUpload(e.target.files[0]);
        }
      }}
      disabled={isUploading}
    />
  );
};