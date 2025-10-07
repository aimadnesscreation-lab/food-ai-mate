import { Edit, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface DailyTotalsProps {
  totalCalories: number;
  goalCalories: number;
  carbs: { current: number; goal: number };
  protein: { current: number; goal: number };
  fat: { current: number; goal: number };
  timestamp: string;
}

export const DailyTotals = ({
  totalCalories,
  goalCalories,
  carbs,
  protein,
  fat,
  timestamp,
}: DailyTotalsProps) => {
  const calculatePercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const carbsPercent = calculatePercentage(carbs.current, carbs.goal);
  const proteinPercent = calculatePercentage(protein.current, protein.goal);
  const fatPercent = calculatePercentage(fat.current, fat.goal);
  const caloriesPercent = calculatePercentage(totalCalories, goalCalories);

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Carbs</p>
          <p className="text-lg font-bold text-foreground mb-2">
            {Math.round(carbs.current)}g
          </p>
          <Progress 
            value={carbsPercent} 
            className="h-2" 
            style={{ backgroundColor: 'hsl(var(--progress-bg))' }}
          />
          <p className="text-xs text-muted-foreground mt-1">{carbsPercent}%</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">Protein</p>
          <p className="text-lg font-bold text-foreground mb-2">
            {Math.round(protein.current)}g
          </p>
          <Progress 
            value={proteinPercent} 
            className="h-2"
            style={{ backgroundColor: 'hsl(var(--progress-bg))' }}
          />
          <p className="text-xs text-muted-foreground mt-1">{proteinPercent}%</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">Fat</p>
          <p className="text-lg font-bold text-foreground mb-2">
            {Math.round(fat.current)}g
          </p>
          <Progress 
            value={fatPercent} 
            className="h-2"
            style={{ backgroundColor: 'hsl(var(--progress-bg))' }}
          />
          <p className="text-xs text-muted-foreground mt-1">{fatPercent}%</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">Calories</p>
          <p className="text-lg font-bold text-foreground mb-2">{totalCalories}</p>
          <Progress 
            value={caloriesPercent} 
            className="h-2"
            style={{ backgroundColor: 'hsl(var(--progress-bg))' }}
          />
          <p className="text-xs text-muted-foreground mt-1">{caloriesPercent}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{timestamp}</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};