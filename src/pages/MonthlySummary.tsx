import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";

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
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = current month
  const [firstLogDate, setFirstLogDate] = useState<Date | null>(null);
  const [totalMonths, setTotalMonths] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchFirstLogDate();
  }, []);

  useEffect(() => {
    if (firstLogDate) {
      fetchMonthlyData();
    }
  }, [firstLogDate, currentMonthOffset]);

  const fetchFirstLogDate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('food_logs')
      .select('logged_at')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(1);

    if (!error && data && data.length > 0) {
      const firstDate = new Date(data[0].logged_at);
      const startOfFirstMonth = startOfMonth(firstDate);
      setFirstLogDate(startOfFirstMonth);

      // Calculate total months from first log to now
      const now = new Date();
      const monthsDiff = (now.getFullYear() - startOfFirstMonth.getFullYear()) * 12 + 
                        (now.getMonth() - startOfFirstMonth.getMonth()) + 1;
      setTotalMonths(monthsDiff);
    }
  };

  const getMonthBoundaries = () => {
    if (!firstLogDate) return { start: new Date(), end: new Date() };

    const targetMonth = subMonths(new Date(), currentMonthOffset);
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);

    return { start: monthStart, end: monthEnd };
  };

  const fetchMonthlyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { start: monthStart, end: monthEnd } = getMonthBoundaries();

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
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold text-foreground">Monthly Summary</h1>
        </div>

        {/* Month Navigation */}
        {firstLogDate && (
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonthOffset(prev => prev + 1)}
              disabled={currentMonthOffset >= totalMonths - 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Month
            </Button>
            
            <div className="text-sm font-medium">
              {format(getMonthBoundaries().start, "MMMM yyyy")}
              {currentMonthOffset === 0 && " (Current)"}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonthOffset(prev => Math.max(0, prev - 1))}
              disabled={currentMonthOffset === 0}
            >
              Next Month
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        <div className="grid gap-6">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-primary">Monthly Averages</CardTitle>
              <CardDescription>
                Average daily intake for {format(getMonthBoundaries().start, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{averages.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{averages.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{averages.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{averages.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-primary">Daily Breakdown</CardTitle>
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
                        className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
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
