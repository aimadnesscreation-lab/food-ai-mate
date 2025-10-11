import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

interface DailyTotal {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MonthlySummary = () => {
  const [monthlyData, setMonthlyData] = useState<DailyTotal[]>([]);
  const [averages, setAverages] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", monthStart.toISOString())
      .lte("logged_at", monthEnd.toISOString());

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch monthly data",
        variant: "destructive",
      });
      return;
    }

    // Group by date
    const dailyTotals: { [key: string]: DailyTotal } = {};
    
    data.forEach((log) => {
      const date = format(new Date(log.logged_at), "yyyy-MM-dd");
      if (!dailyTotals[date]) {
        dailyTotals[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyTotals[date].calories += log.calories;
      dailyTotals[date].protein += Number(log.protein);
      dailyTotals[date].carbs += Number(log.carbs);
      dailyTotals[date].fat += Number(log.fat);
    });

    const dailyArray = Object.values(dailyTotals);
    setMonthlyData(dailyArray);

    // Calculate averages
    if (dailyArray.length > 0) {
      const totals = dailyArray.reduce(
        (acc, day) => ({
          calories: acc.calories + day.calories,
          protein: acc.protein + day.protein,
          carbs: acc.carbs + day.carbs,
          fat: acc.fat + day.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setAverages({
        calories: Math.round(totals.calories / dailyArray.length),
        protein: Math.round(totals.protein / dailyArray.length),
        carbs: Math.round(totals.carbs / dailyArray.length),
        fat: Math.round(totals.fat / dailyArray.length),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold">Monthly Summary</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Averages</CardTitle>
              <CardDescription>
                Average daily intake for {format(new Date(), "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{averages.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{averages.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{averages.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{averages.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
              <CardDescription>Days with logged food this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monthlyData.length === 0 ? (
                  <p className="text-muted-foreground">No data for this month</p>
                ) : (
                  monthlyData
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((day) => (
                      <div
                        key={day.date}
                        className="p-3 bg-accent rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">
                            {format(new Date(day.date), "MMMM d, yyyy")}
                          </p>
                          <p className="text-sm font-bold">{day.calories} cal</p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>P: {Math.round(day.protein)}g</span>
                          <span>C: {Math.round(day.carbs)}g</span>
                          <span>F: {Math.round(day.fat)}g</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
