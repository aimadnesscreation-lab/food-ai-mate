import { supabase } from "@/integrations/supabase/client";

export interface FoodLogCSV {
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  quantity: string;
  logged_at: string;
  vitamin_a?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  calcium?: number;
  iron?: number;
  fiber?: number;
}

export const exportFoodLogsToCSV = async (userId: string) => {
  // Fetch all food logs for the user
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No food logs to export');

  // Create CSV content
  const headers = ['food_name', 'calories', 'carbs', 'protein', 'fat', 'quantity', 'logged_at', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'calcium', 'iron', 'fiber'];
  const csvRows = [headers.join(',')];

  data.forEach((log) => {
    const row = [
      `"${log.food_name}"`,
      log.calories,
      log.carbs,
      log.protein,
      log.fat,
      `"${log.quantity || ''}"`,
      log.logged_at,
      log.vitamin_a || 0,
      log.vitamin_c || 0,
      log.vitamin_d || 0,
      log.calcium || 0,
      log.iron || 0,
      log.fiber || 0,
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `food_logs_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFoodLogsFromCSV = async (file: File, userId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid');
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const foodLogs: any[] = [];

        dataLines.forEach((line) => {
          // Parse CSV line respecting quoted values
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          if (values.length >= 7) {
            foodLogs.push({
              user_id: userId,
              food_name: values[0].replace(/^"|"$/g, ''),
              calories: parseInt(values[1]) || 0,
              carbs: parseFloat(values[2]) || 0,
              protein: parseFloat(values[3]) || 0,
              fat: parseFloat(values[4]) || 0,
              quantity: values[5].replace(/^"|"$/g, '') || null,
              logged_at: values[6],
              vitamin_a: parseFloat(values[7]) || 0,
              vitamin_c: parseFloat(values[8]) || 0,
              vitamin_d: parseFloat(values[9]) || 0,
              calcium: parseFloat(values[10]) || 0,
              iron: parseFloat(values[11]) || 0,
              fiber: parseFloat(values[12]) || 0,
            });
          }
        });

        if (foodLogs.length === 0) {
          throw new Error('No valid food logs found in CSV');
        }

        // Insert into database
        const { error } = await supabase
          .from('food_logs')
          .insert(foodLogs);

        if (error) throw error;

        resolve(foodLogs.length);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
