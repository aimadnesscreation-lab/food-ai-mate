import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface MicronutrientTotals {
  vitamin_a: number;
  vitamin_c: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  fiber: number;
}

interface RecommendedValues {
  vitamin_a: number; // mcg RAE
  vitamin_c: number; // mg
  vitamin_d: number; // mcg
  calcium: number; // mg
  iron: number; // mg
  fiber: number; // g
}

const Micronutrients = () => {
  const [totals, setTotals] = useState<MicronutrientTotals>({
    vitamin_a: 0,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 0,
    iron: 0,
    fiber: 0,
  });
  const [recommended, setRecommended] = useState<RecommendedValues>({
    vitamin_a: 900,
    vitamin_c: 90,
    vitamin_d: 15,
    calcium: 1000,
    iron: 8,
    fiber: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const calculateRecommendedValues = (age: number | null, weight: number | null, height: number | null) => {
    // Default values for adult male (adjust based on age, gender, BMI)
    let values: RecommendedValues = {
      vitamin_a: 900, // mcg RAE
      vitamin_c: 90, // mg
      vitamin_d: 15, // mcg
      calcium: 1000, // mg
      iron: 8, // mg
      fiber: 30, // g
    };

    if (age && weight && height) {
      // Calculate BMI
      const heightInMeters = Number(height) / 100;
      const bmi = Number(weight) / (heightInMeters * heightInMeters);

      // Adjust based on age
      if (age > 50) {
        values.calcium = 1200;
        values.vitamin_d = 20;
      }

      // Adjust fiber based on BMI (higher for overweight)
      if (bmi > 25) {
        values.fiber = 35;
      }

      // Adjust iron based on age and assumed gender patterns
      // (In a real app, you'd store gender in profile)
      if (age < 50) {
        values.iron = 18; // Higher for women of childbearing age
      }
    }

    return values;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile for BMI calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('age, current_weight, height')
        .eq('user_id', user.id)
        .maybeSingle();

      // Calculate recommended values based on profile
      const recommendedValues = calculateRecommendedValues(
        profile?.age || null,
        profile?.current_weight || null,
        profile?.height || null
      );
      setRecommended(recommendedValues);

      // Fetch today's food logs
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const { data: logs, error } = await supabase
        .from('food_logs')
        .select('vitamin_a, vitamin_c, vitamin_d, calcium, iron, fiber')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString());

      if (error) throw error;

      // Sum up micronutrients
      const dailyTotals = (logs || []).reduce(
        (acc, log) => ({
          vitamin_a: acc.vitamin_a + Number(log.vitamin_a || 0),
          vitamin_c: acc.vitamin_c + Number(log.vitamin_c || 0),
          vitamin_d: acc.vitamin_d + Number(log.vitamin_d || 0),
          calcium: acc.calcium + Number(log.calcium || 0),
          iron: acc.iron + Number(log.iron || 0),
          fiber: acc.fiber + Number(log.fiber || 0),
        }),
        { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, calcium: 0, iron: 0, fiber: 0 }
      );

      setTotals(dailyTotals);
    } catch (error) {
      console.error('Error fetching micronutrient data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch micronutrient data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderNutrientCard = (
    name: string,
    current: number,
    goal: number,
    unit: string
  ) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const isDeficient = percentage < 70;
    const isSufficient = percentage >= 70 && percentage < 100;
    const isExceeding = percentage >= 100;

    return (
      <Card key={name} className="border-primary/20">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="text-lg text-primary">{name}</CardTitle>
          <CardDescription>
            {current.toFixed(1)} / {goal} {unit}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Progress value={percentage} className="h-3 mb-2" />
          <div className="flex justify-between items-center text-sm">
            <span className={
              isDeficient ? "text-destructive" :
              isSufficient ? "text-yellow-500" :
              "text-green-500"
            }>
              {isDeficient && "⚠️ Deficient"}
              {isSufficient && "⚡ Good Progress"}
              {isExceeding && "✅ Goal Met"}
            </span>
            <span className="text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold text-foreground">Micronutrient Tracker</h1>
        </div>

        {isLoading ? (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading micronutrient data...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/20 mb-6">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary">Today's Micronutrient Intake</CardTitle>
                <CardDescription>
                  Daily recommendations are based on your age, weight, and BMI
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {renderNutrientCard("Vitamin A", totals.vitamin_a, recommended.vitamin_a, "mcg RAE")}
              {renderNutrientCard("Vitamin C", totals.vitamin_c, recommended.vitamin_c, "mg")}
              {renderNutrientCard("Vitamin D", totals.vitamin_d, recommended.vitamin_d, "mcg")}
              {renderNutrientCard("Calcium", totals.calcium, recommended.calcium, "mg")}
              {renderNutrientCard("Iron", totals.iron, recommended.iron, "mg")}
              {renderNutrientCard("Fiber", totals.fiber, recommended.fiber, "g")}
            </div>

            <Card className="border-primary/20 mt-6">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary">Note</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  These recommendations are estimates based on your profile. For personalized nutrition advice, 
                  please consult with a healthcare professional or registered dietitian.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Micronutrients;
