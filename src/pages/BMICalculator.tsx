import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");
  const [results, setResults] = useState<any>(null);

  const calculateBMI = () => {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    const bmi = weightKg / (heightM * heightM);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }

    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    // Adjust for goal
    let targetCalories = tdee;
    if (goal === "lose") targetCalories -= 500;
    if (goal === "gain") targetCalories += 500;

    setResults({
      bmi: bmi.toFixed(1),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      category: getBMICategory(bmi),
    });
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold">BMI Calculator</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculate Your Daily Calorie Needs</CardTitle>
            <CardDescription>
              Enter your information to calculate BMI and daily calorie requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
              />
            </div>

            <div>
              <Label>Gender</Label>
              <RadioGroup value={gender} onValueChange={setGender}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Activity Level</Label>
              <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (little or no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light (exercise 1-3 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate (exercise 3-5 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (exercise 6-7 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="veryActive" id="veryActive" />
                  <Label htmlFor="veryActive">Very Active (intense exercise daily)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Goal</Label>
              <RadioGroup value={goal} onValueChange={setGoal}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lose" id="lose" />
                  <Label htmlFor="lose">Lose Weight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintain" id="maintain" />
                  <Label htmlFor="maintain">Maintain Weight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gain" id="gain" />
                  <Label htmlFor="gain">Gain Weight</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={calculateBMI} className="w-full">
              Calculate
            </Button>

            {results && (
              <div className="mt-6 p-4 bg-accent rounded-lg space-y-2">
                <h3 className="font-semibold text-lg">Results</h3>
                <p>
                  <strong>BMI:</strong> {results.bmi} ({results.category})
                </p>
                <p>
                  <strong>BMR:</strong> {results.bmr} calories/day
                </p>
                <p>
                  <strong>TDEE:</strong> {results.tdee} calories/day
                </p>
                <p>
                  <strong>Target Calories:</strong> {results.targetCalories} calories/day
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BMICalculator;
