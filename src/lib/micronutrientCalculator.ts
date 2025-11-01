interface UserProfile {
  age: number | null;
  height: number | null;
  current_weight: number | null;
}

export interface MicronutrientGoals {
  vitamin_a: number; // mcg RAE
  vitamin_c: number; // mg
  vitamin_d: number; // mcg
  calcium: number;   // mg
  iron: number;      // mg
  fiber: number;     // g
}

export const calculateMicronutrientGoals = (profile: UserProfile): MicronutrientGoals => {
  // Default values if profile is incomplete
  const age = profile.age || 30;
  const weight = profile.current_weight || 70;
  
  // Base calculations on age and weight
  // These are general RDA (Recommended Dietary Allowance) values
  
  // Vitamin A (mcg RAE): 700-900 for adults
  const vitamin_a = age < 50 ? 800 : 700;
  
  // Vitamin C (mg): 75-90 for adults, increases with age
  const vitamin_c = age < 50 ? 80 : 90;
  
  // Vitamin D (mcg): 15-20, increases with age
  const vitamin_d = age < 70 ? 15 : 20;
  
  // Calcium (mg): 1000-1200, increases with age
  const calcium = age < 50 ? 1000 : 1200;
  
  // Iron (mg): 8-18, varies by age and gender (using moderate value)
  const iron = age < 50 ? 14 : 10;
  
  // Fiber (g): Based on weight and age, 14g per 1000 calories (approx 25-38g)
  const fiber = Math.max(25, Math.min(38, Math.round((weight / 70) * 30)));
  
  return {
    vitamin_a,
    vitamin_c,
    vitamin_d,
    calcium,
    iron,
    fiber
  };
};