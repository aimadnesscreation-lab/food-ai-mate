import { Pill } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface MicronutrientSummaryProps {
  totals: {
    vitamin_a: number;
    vitamin_c: number;
    vitamin_d: number;
    calcium: number;
    iron: number;
    fiber: number;
  };
  goals: {
    vitamin_a: number;
    vitamin_c: number;
    vitamin_d: number;
    calcium: number;
    iron: number;
    fiber: number;
  };
}

export const MicronutrientSummary = ({ totals, goals }: MicronutrientSummaryProps) => {
  const calculatePercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const nutrients = [
    { name: "Vitamin A", current: totals.vitamin_a, goal: goals.vitamin_a, unit: "mcg" },
    { name: "Vitamin C", current: totals.vitamin_c, goal: goals.vitamin_c, unit: "mg" },
    { name: "Vitamin D", current: totals.vitamin_d, goal: goals.vitamin_d, unit: "mcg" },
    { name: "Calcium", current: totals.calcium, goal: goals.calcium, unit: "mg" },
    { name: "Iron", current: totals.iron, goal: goals.iron, unit: "mg" },
    { name: "Fiber", current: totals.fiber, goal: goals.fiber, unit: "g" },
  ];

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Pill className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Micronutrients</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nutrients.map((nutrient) => {
          const percentage = calculatePercentage(nutrient.current, nutrient.goal);
          return (
            <div key={nutrient.name}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-medium text-foreground">{nutrient.name}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {Math.round(nutrient.current)}/{nutrient.goal}{nutrient.unit}
              </p>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{ backgroundColor: 'hsl(var(--progress-bg))' }}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};