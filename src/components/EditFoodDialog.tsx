import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodLog: {
    id: string;
    food_name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    quantity: string | null;
  };
  onSuccess: () => void;
}

export const EditFoodDialog = ({ open, onOpenChange, foodLog, onSuccess }: EditFoodDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    food_name: foodLog.food_name,
    calories: foodLog.calories,
    carbs: foodLog.carbs,
    protein: foodLog.protein,
    fat: foodLog.fat,
    quantity: foodLog.quantity || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("food_logs")
        .update({
          food_name: formData.food_name,
          calories: formData.calories,
          carbs: formData.carbs,
          protein: formData.protein,
          fat: formData.fat,
          quantity: formData.quantity || null,
        })
        .eq("id", foodLog.id);

      if (error) throw error;

      toast({
        title: "Food entry updated",
        description: "Your food log has been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating food log:", error);
      toast({
        title: "Error",
        description: "Failed to update food entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Food Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="food_name">Food Name</Label>
              <Input
                id="food_name"
                value={formData.food_name}
                onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 2 rotis, 100g"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
