import { useState, useEffect } from "react";
import { ArrowLeft, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DailySummary {
  date: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

const WeeklySummary = () => {
  const navigate = useNavigate();
  const [weeklySummary, setWeeklySummary] = useState<DailySummary[]>([]);
  const [userGoals, setUserGoals] = useState({
    daily_calories: 2000,
    daily_carbs: 250,
    daily_protein: 150,
    daily_fat: 70,
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = previous week, etc.
  const [firstLogDate, setFirstLogDate] = useState<Date | null>(null);
  const [totalWeeks, setTotalWeeks] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserGoals();
      fetchFirstLogDate();
    }
  }, [user]);

  useEffect(() => {
    if (user && firstLogDate) {
      fetchWeeklySummary();
    }
  }, [user, firstLogDate, currentWeekOffset]);

  const fetchUserGoals = async () => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setUserGoals(data);
    }
  };

  const fetchFirstLogDate = async () => {
    const { data, error } = await supabase
      .from('food_logs')
      .select('logged_at')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(1);

    if (!error && data && data.length > 0) {
      const firstDate = new Date(data[0].logged_at);
      // Set to start of week (Sunday)
      const dayOfWeek = firstDate.getDay();
      const startOfWeek = new Date(firstDate);
      startOfWeek.setDate(firstDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      setFirstLogDate(startOfWeek);

      // Calculate total weeks from first log to now
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startOfWeek.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      setTotalWeeks(diffWeeks);
    }
  };

  const getWeekBoundaries = () => {
    if (!firstLogDate) return { start: new Date(), end: new Date() };

    const weeksFromStart = totalWeeks - currentWeekOffset - 1;
    const weekStart = new Date(firstLogDate);
    weekStart.setDate(firstLogDate.getDate() + (weeksFromStart * 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { start: weekStart, end: weekEnd };
  };

  const fetchWeeklySummary = async () => {
    setIsLoading(true);
    const { start, end } = getWeekBoundaries();

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', start.toISOString())
      .lte('logged_at', end.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly data:', error);
      setIsLoading(false);
      return;
    }

    // Group by date
    const dailyData = new Map<string, DailySummary>();
    
    data?.forEach((log) => {
      const date = new Date(log.logged_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          calories: 0,
          carbs: 0,
          protein: 0,
          fat: 0,
        });
      }

      const day = dailyData.get(date)!;
      day.calories += log.calories;
      day.carbs += Number(log.carbs);
      day.protein += Number(log.protein);
      day.fat += Number(log.fat);
    });

    setWeeklySummary(Array.from(dailyData.values()));
    setIsLoading(false);
  };

  const calculateWeeklyTotals = () => {
    return weeklySummary.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        carbs: acc.carbs + day.carbs,
        protein: acc.protein + day.protein,
        fat: acc.fat + day.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const weeklyTotals = calculateWeeklyTotals();
  const weeklyGoals = {
    calories: userGoals.daily_calories * 7,
    carbs: userGoals.daily_carbs * 7,
    protein: userGoals.daily_protein * 7,
    fat: userGoals.daily_fat * 7,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">Weekly Summary</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Please sign in to view your weekly summary
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Weekly Summary</h1>
        </div>
        
        {/* Week Navigation */}
        {firstLogDate && (
          <div className="flex items-center justify-between px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              disabled={currentWeekOffset >= totalWeeks - 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            
            <div className="text-sm font-medium">
              Week {totalWeeks - currentWeekOffset}
              {currentWeekOffset === 0 && " (Current)"}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={currentWeekOffset === 0}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Weekly Totals */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Totals</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Calories</span>
                <span className="font-medium">
                  {weeklyTotals.calories} / {weeklyGoals.calories}
                </span>
              </div>
              <Progress 
                value={(weeklyTotals.calories / weeklyGoals.calories) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Carbs</span>
                <span className="font-medium">
                  {weeklyTotals.carbs.toFixed(1)}g / {weeklyGoals.carbs}g
                </span>
              </div>
              <Progress 
                value={(weeklyTotals.carbs / weeklyGoals.carbs) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Protein</span>
                <span className="font-medium">
                  {weeklyTotals.protein.toFixed(1)}g / {weeklyGoals.protein}g
                </span>
              </div>
              <Progress 
                value={(weeklyTotals.protein / weeklyGoals.protein) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Fat</span>
                <span className="font-medium">
                  {weeklyTotals.fat.toFixed(1)}g / {weeklyGoals.fat}g
                </span>
              </div>
              <Progress 
                value={(weeklyTotals.fat / weeklyGoals.fat) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </Card>

        {/* Daily Breakdown */}
        <h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading...
          </Card>
        ) : weeklySummary.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No data available for the past 7 days
          </Card>
        ) : (
          <div className="space-y-3">
            {weeklySummary.map((day) => (
              <Card key={day.date} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{day.date}</h3>
                  <span className="text-sm font-medium">
                    {day.calories} cal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="block font-medium text-foreground">
                      {day.carbs.toFixed(1)}g
                    </span>
                    <span className="text-xs">Carbs</span>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      {day.protein.toFixed(1)}g
                    </span>
                    <span className="text-xs">Protein</span>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      {day.fat.toFixed(1)}g
                    </span>
                    <span className="text-xs">Fat</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress 
                    value={(day.calories / userGoals.daily_calories) * 100} 
                    className="h-1"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySummary;
