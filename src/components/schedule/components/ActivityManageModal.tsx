import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

interface ActivityManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: {
    id?: string;
    title?: string;
    start_time: string;
    end_time: string;
  };
  onDelete: () => void;
  onEdit: (updatedActivity: { title?: string; start_time: string; end_time: string }) => void;
}

export const ActivityManageModal = ({
  isOpen,
  onClose,
  activity,
  onDelete,
  onEdit,
}: ActivityManageModalProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(activity.title || "");
  const [editedStartTime, setEditedStartTime] = useState(activity.start_time);
  const [editedEndTime, setEditedEndTime] = useState(activity.end_time);

  const handleEdit = () => {
    onEdit({
      title: editedTitle,
      start_time: editedStartTime,
      end_time: editedEndTime,
    });
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isEditing ? "ערוך פעילות" : "פרטי פעילות"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="כותרת"
                    className="text-right"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={editedStartTime}
                      onChange={(e) => setEditedStartTime(e.target.value)}
                      className="text-right"
                    />
                    <Input
                      type="time"
                      value={editedEndTime}
                      onChange={(e) => setEditedEndTime(e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <Button onClick={handleEdit}>שמור</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    ביטול
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 text-right">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.start_time} - {activity.end_time}
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setIsEditing(true)}>ערוך</Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    מחק
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הפעילות לצמיתות ולא ניתן יהיה לשחזר אותה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};