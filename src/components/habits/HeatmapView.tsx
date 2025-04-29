
import { useState, useEffect } from 'react';
import { Habit, HabitStatus } from '@/types';
import { formatDateToString, generateHeatmapDates, getHabitStatusForDate, isTargetDay } from '@/utils/habitUtils';

interface HeatmapViewProps {
  habit: Habit;
  onStatusUpdate: (habitId: string, date: string, status: HabitStatus) => void;
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ habit, onStatusUpdate }) => {
  const [heatmapDates, setHeatmapDates] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate dates from habit start to today (or last 35 days if it's a long-running habit)
    const allDates = generateHeatmapDates(habit.startDate);
    // Limit to most recent 35 days (5 weeks) for display purposes
    const recentDates = allDates.length > 35 ? allDates.slice(-35) : allDates;
    setHeatmapDates(recentDates);
  }, [habit.startDate]);

  const getColorForDate = (date: string): string => {
    const status = getHabitStatusForDate(habit, date);
    const dateObj = new Date(date);
    
    // Check if this is a target day
    const isTarget = isTargetDay(habit, dateObj);
    
    // If it's not a target day, show as inactive
    if (!isTarget) return "bg-streak-inactive/30";
    
    // If it's a target day, show status
    if (status === 'completed') return "bg-streak-completed";
    if (status === 'missed') return "bg-streak-missed";
    
    // Future target dates or target dates without status
    return "bg-streak-inactive";
  };
  
  // Toggle status on click
  const handleCellClick = (date: string) => {
    const currentDate = new Date();
    const clickedDate = new Date(date);
    
    // Don't allow marking future dates
    if (clickedDate > currentDate) return;
    
    // Only allow marking target days
    if (!isTargetDay(habit, clickedDate)) return;
    
    const currentStatus = getHabitStatusForDate(habit, date);
    
    // Cycle through statuses: null -> completed -> missed -> null
    let newStatus: HabitStatus = null;
    if (currentStatus === null) newStatus = 'completed';
    else if (currentStatus === 'completed') newStatus = 'missed';
    
    onStatusUpdate(habit.id, date, newStatus);
  };
  
  // Group dates by week for the heatmap display
  const weekRows = [];
  for (let i = 0; i < heatmapDates.length; i += 7) {
    weekRows.push(heatmapDates.slice(i, i + 7));
  }
  
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2">Progress Heatmap</h3>
      <div className="overflow-auto pb-1" style={{ maxHeight: '180px' }}>
        <div className="flex flex-col gap-1">
          {weekRows.map((week, weekIndex) => (
            <div key={weekIndex} className="flex">
              {week.map((date, dayIndex) => (
                <div 
                  key={`${date}-${dayIndex}`}
                  className={`heatmap-cell ${getColorForDate(date)}`}
                  onClick={() => handleCellClick(date)}
                  title={`${formatDateLabel(date)}: ${getHabitStatusForDate(habit, date) || 'No data'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-2 gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-completed mr-1"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-missed mr-1"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-inactive mr-1"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
