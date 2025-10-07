import { Flame, Activity } from "lucide-react";
import { Card } from "./ui/card";

interface SummaryCardsProps {
  totalCalories: number;
  exerciseCalories: number;
  remainingCalories: number;
  carbs: { current: number; goal: number };
  protein: { current: number; goal: number };
  fat: { current: number; goal: number };
}

export const SummaryCards = ({
  totalCalories,
  exerciseCalories,
  remainingCalories,
  carbs,
  protein,
  fat,
}: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Calories</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold text-foreground">{totalCalories}</p>
            <p className="text-sm text-muted-foreground">Food</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-muted-foreground">{exerciseCalories}</p>
            <p className="text-sm text-muted-foreground">Exercise</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">{remainingCalories}</p>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Macros</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-lg font-bold text-foreground">
              {carbs.current}/{carbs.goal}g
            </p>
            <p className="text-sm text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {protein.current}/{protein.goal}g
            </p>
            <p className="text-sm text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {fat.current}/{fat.goal}g
            </p>
            <p className="text-sm text-muted-foreground">Fat</p>
          </div>
        </div>
      </Card>
    </div>
  );
};