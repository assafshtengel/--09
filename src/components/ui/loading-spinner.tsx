import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ text = "טוען..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
};