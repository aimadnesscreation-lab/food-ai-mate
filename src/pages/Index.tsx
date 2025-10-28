import { useState, useEffect, useRef } from "react";
import { Settings, BarChart3, Menu, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DateNavigation } from "@/components/DateNavigation";
import { SummaryCards } from "@/components/SummaryCards";
import { FoodLogItem } from "@/components/FoodLogItem";
import { DailyTotals } from "@/components/DailyTotals";
import { FoodInput } from "@/components/FoodInput";
import { GoalsDialog } from "@/components/GoalsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { exportFoodLogsToCSV, importFoodLogsFromCSV } from "@/lib/csvUtils";

interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  quantity: string | null;
  logged_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [userGoals, setUserGoals] = useState({
    daily_calories: 2000,
    daily_carbs: 250,
    daily_protein: 150,
    daily_fat: 70,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate dates for the week
  const generateWeekDates = (startOfWeek: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        fullDate: date,
      });
    }
    return dates;
  };

  const weekDates = generateWeekDates(currentWeekStart);

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  useEffect(() => {
    // Check auth status
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
      fetchFoodLogs();
    }
  }, [user, selectedDate]);

  const fetchUserGoals = async () => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching goals:', error);
      return;
    }

    if (data) {
      setUserGoals(data);
    } else {
      // Create default goals
      const { error: insertError } = await supabase
        .from('user_goals')
        .insert([{ user_id: user.id }]);
      
      if (insertError) {
        console.error('Error creating default goals:', insertError);
      }
    }
  };

  const fetchFoodLogs = async () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startOfDay.toISOString())
      .lte('logged_at', endOfDay.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching food logs:', error);
      return;
    }

    setFoodLogs(data || []);
  };

  const handleFoodInput = async (text: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to log food",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-food', {
        body: { prompt: text }
      });

      if (error) throw error;

      const { foodItems } = data;
      
      const logsToInsert = foodItems.map((item: any) => ({
        user_id: user.id,
        food_name: item.food_name,
        calories: item.calories,
        carbs: item.carbs,
        protein: item.protein,
        fat: item.fat,
        quantity: item.quantity,
        vitamin_a: item.vitamin_a || 0,
        vitamin_c: item.vitamin_c || 0,
        vitamin_d: item.vitamin_d || 0,
        calcium: item.calcium || 0,
        iron: item.iron || 0,
        fiber: item.fiber || 0,
        logged_at: selectedDate.toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('food_logs')
        .insert(logsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Food logged successfully!",
        description: `Added ${foodItems.length} item(s) to your log`,
      });

      fetchFoodLogs();
    } catch (error) {
      console.error('Error logging food:', error);
      toast({
        title: "Error logging food",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    return foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        carbs: acc.carbs + log.carbs,
        protein: acc.protein + log.protein,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();
  const remainingCalories = userGoals.daily_calories - totals.calories;

  const handleExportCSV = async () => {
    try {
      await exportFoodLogsToCSV(user.id);
      toast({
        title: "Export successful",
        description: "Your food logs have been exported to CSV",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export food logs",
        variant: "destructive",
      });
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await importFoodLogsFromCSV(file, user.id);
      toast({
        title: "Import successful",
        description: `Imported ${count} food log(s)`,
      });
      fetchFoodLogs();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import food logs",
        variant: "destructive",
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">AI Calorie Tracker</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Track your nutrition with AI-powered food logging
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/auth'}
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold">AI Calorie Tracker</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Export to CSV">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Import from CSV">
              <Upload className="h-5 w-5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button variant="ghost" size="icon" onClick={() => navigate('/weekly')}>
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setGoalsDialogOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="px-4 pb-4">
          <DateNavigation
            dates={weekDates}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {/* Summary Cards */}
        <SummaryCards
          totalCalories={totals.calories}
          exerciseCalories={0}
          remainingCalories={remainingCalories}
          carbs={{ current: totals.carbs, goal: userGoals.daily_carbs }}
          protein={{ current: totals.protein, goal: userGoals.daily_protein }}
          fat={{ current: totals.fat, goal: userGoals.daily_fat }}
        />

        {/* Food Log */}
        <Card className="mb-6 p-4">
          {foodLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No food logged yet for this day.</p>
              <p className="text-sm mt-2">Use the input below to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {foodLogs.map((log) => (
                <FoodLogItem
                  key={log.id}
                  foodLog={log}
                  onRefresh={fetchFoodLogs}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Daily Totals */}
        {foodLogs.length > 0 && (
          <DailyTotals
            totalCalories={totals.calories}
            goalCalories={userGoals.daily_calories}
            carbs={{ current: totals.carbs, goal: userGoals.daily_carbs }}
            protein={{ current: totals.protein, goal: userGoals.daily_protein }}
            fat={{ current: totals.fat, goal: userGoals.daily_fat }}
            timestamp={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          />
        )}
      </div>

      {/* Food Input */}
      <FoodInput onSubmit={handleFoodInput} isLoading={isLoading} />

      {/* Goals Dialog */}
      {user && (
        <GoalsDialog
          open={goalsDialogOpen}
          onOpenChange={setGoalsDialogOpen}
          currentGoals={userGoals}
          userId={user.id}
          onGoalsUpdated={fetchUserGoals}
        />
      )}
    </div>
  );
};

export default Index;