import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface DateNavigationProps {
  dates: Array<{ day: string; date: number; fullDate: Date }>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export const DateNavigation = ({ dates, selectedDate, onDateSelect, onPreviousWeek, onNextWeek }: DateNavigationProps) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={onPreviousWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-2">
        {dates.map((item, index) => {
          const selected = isSelected(item.fullDate);
          const today = isToday(item.fullDate);
          const past = isPast(item.fullDate);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(item.fullDate)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-[64px] rounded-2xl transition-all ${
                selected && today
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : selected && past
                  ? 'bg-secondary text-secondary-foreground shadow-md'
                  : selected
                  ? 'bg-muted text-foreground shadow-md'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <span className="text-xs font-medium opacity-70">{item.day}</span>
              <span className="text-lg font-semibold">{item.date}</span>
            </button>
          );
        })}
      </div>

      <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={onNextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};