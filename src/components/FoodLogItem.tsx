import { Trash2, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditFoodDialog } from "./EditFoodDialog";
import { useState } from "react";

interface FoodLogItemProps {
  foodLog: {
    id: string;
    food_name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    quantity: string | null;
    vitamin_a?: number;
    vitamin_c?: number;
    vitamin_d?: number;
    calcium?: number;
    iron?: number;
    fiber?: number;
  };
  onRefresh: () => void;
}

export const FoodLogItem = ({ foodLog, onRefresh }: FoodLogItemProps) => {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", foodLog.id);

      if (error) throw error;

      toast({
        title: "Food entry deleted",
        description: "Your food log has been removed.",
      });

      onRefresh();
    } catch (error) {
      console.error("Error deleting food log:", error);
      toast({
        title: "Error",
        description: "Failed to delete food entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
        <div className="flex-1">
          <div className="font-medium text-foreground">{foodLog.food_name}</div>
          {foodLog.quantity && (
            <div className="text-sm text-muted-foreground">{foodLog.quantity}</div>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            {foodLog.calories} cal • C: {foodLog.carbs}g • P: {foodLog.protein}g • F: {foodLog.fat}g
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditDialogOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditFoodDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        foodLog={foodLog}
        onSuccess={onRefresh}
      />
    </>
  );
};