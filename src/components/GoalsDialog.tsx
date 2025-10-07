import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: {
    daily_calories: number;
    daily_carbs: number;
    daily_protein: number;
    daily_fat: number;
  };
  userId: string;
  onGoalsUpdated: () => void;
}

export const GoalsDialog = ({ open, onOpenChange, currentGoals, userId, onGoalsUpdated }: GoalsDialogProps) => {
  const [calories, setCalories] = useState(currentGoals.daily_calories);
  const [carbs, setCarbs] = useState(currentGoals.daily_carbs);
  const [protein, setProtein] = useState(currentGoals.daily_protein);
  const [fat, setFat] = useState(currentGoals.daily_fat);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({
          daily_calories: calories,
          daily_carbs: carbs,
          daily_protein: protein,
          daily_fat: fat,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Goals updated!",
        description: "Your daily nutrition goals have been saved.",
      });

      onGoalsUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goals:', error);
      toast({
        title: "Error updating goals",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily Nutrition Goals</DialogTitle>
          <DialogDescription>
            Set your daily calorie and macronutrient targets
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Daily Calories</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Daily Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Daily Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Daily Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Goals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
