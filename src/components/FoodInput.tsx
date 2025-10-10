import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FoodInputProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading?: boolean;
}

export const FoodInput = ({ onSubmit, isLoading }: FoodInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      await onSubmit(inputValue);
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background border-t border-border p-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="What did you eat or exercise?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-muted border-0 focus-visible:ring-primary"
        />
        <Button 
          type="submit" 
          disabled={!inputValue.trim() || isLoading}
          className="px-6"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </div>
    </form>
  );
};