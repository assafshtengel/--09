import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading?: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full">
      {isLoading ? "שומר..." : "שמור סיכום אימון"}
    </Button>
  );
};