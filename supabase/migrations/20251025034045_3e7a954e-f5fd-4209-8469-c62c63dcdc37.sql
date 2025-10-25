-- Add micronutrient columns to food_logs table
ALTER TABLE public.food_logs
ADD COLUMN vitamin_a numeric DEFAULT 0,
ADD COLUMN vitamin_c numeric DEFAULT 0,
ADD COLUMN vitamin_d numeric DEFAULT 0,
ADD COLUMN calcium numeric DEFAULT 0,
ADD COLUMN iron numeric DEFAULT 0,
ADD COLUMN fiber numeric DEFAULT 0;