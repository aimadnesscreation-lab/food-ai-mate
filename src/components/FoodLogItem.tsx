interface FoodLogItemProps {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export const FoodLogItem = ({ foodName, calories, carbs, protein, fat }: FoodLogItemProps) => {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <h3 className="font-medium text-foreground mb-2">{foodName}</h3>
      <p className="text-sm text-muted-foreground">
        Calories: {calories} | Carbs: {carbs}g | Protein: {protein}g | Fat: {fat}g
      </p>
    </div>
  );
};