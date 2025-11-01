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
    vitamin_a?: number;
    vitamin_c?: number;
    vitamin_d?: number;
    calcium?: number;
    iron?: number;
    fiber?: number;
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
    vitamin_a: foodLog.vitamin_a || 0,
    vitamin_c: foodLog.vitamin_c || 0,
    vitamin_d: foodLog.vitamin_d || 0,
    calcium: foodLog.calcium || 0,
    iron: foodLog.iron || 0,
    fiber: foodLog.fiber || 0,
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
          vitamin_a: formData.vitamin_a,
          vitamin_c: formData.vitamin_c,
          vitamin_d: formData.vitamin_d,
          calcium: formData.calcium,
          iron: formData.iron,
          fiber: formData.fiber,
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vitamin_a">Vitamin A (mcg)</Label>
                <Input
                  id="vitamin_a"
                  type="number"
                  step="0.1"
                  value={formData.vitamin_a}
                  onChange={(e) => setFormData({ ...formData, vitamin_a: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vitamin_c">Vitamin C (mg)</Label>
                <Input
                  id="vitamin_c"
                  type="number"
                  step="0.1"
                  value={formData.vitamin_c}
                  onChange={(e) => setFormData({ ...formData, vitamin_c: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vitamin_d">Vitamin D (mcg)</Label>
                <Input
                  id="vitamin_d"
                  type="number"
                  step="0.1"
                  value={formData.vitamin_d}
                  onChange={(e) => setFormData({ ...formData, vitamin_d: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="calcium">Calcium (mg)</Label>
                <Input
                  id="calcium"
                  type="number"
                  step="0.1"
                  value={formData.calcium}
                  onChange={(e) => setFormData({ ...formData, calcium: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="iron">Iron (mg)</Label>
                <Input
                  id="iron"
                  type="number"
                  step="0.1"
                  value={formData.iron}
                  onChange={(e) => setFormData({ ...formData, iron: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) })}
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
