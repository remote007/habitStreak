
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Habit } from '@/types';
import { Edit, Flame, Medal, Trash } from 'lucide-react';
import HeatmapView from './HeatmapView';
import { getBadgeById } from '@/utils/habitUtils';

interface HabitCardProps {
  habit: Habit;
  onStatusUpdate: (habitId: string, date: string, status: 'completed' | 'missed' | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit,
  onStatusUpdate,
  onEdit,
  onDelete
}) => {
  // Get the most significant badge
  const topBadge = habit.badges.length > 0 
    ? getBadgeById(habit.badges.sort((a, b) => {
        const badgeA = getBadgeById(a);
        const badgeB = getBadgeById(b);
        return (badgeB?.requiredStreak || 0) - (badgeA?.requiredStreak || 0);
      })[0])
    : undefined;

  // Calculate longest streak based on completed entries
  const calculateLongestStreak = () => {
    const completedDays = Object.entries(habit.history)
      .filter(([_, status]) => status === 'completed')
      .map(([date]) => date)
      .sort();

    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < completedDays.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const currentDate = new Date(completedDays[i]);
        const prevDate = new Date(completedDays[i - 1]);
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return maxStreak;
  };

  return (
    <Card className="h-full flex flex-col bg-custom-soft-peach/80 dark:bg-custom-muted-plum/20 border-custom-muted-mint dark:border-custom-lavender-fog/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-custom-vintage-teal dark:text-custom-muted-mint">{habit.name}</CardTitle>
          <div className="flex gap-1">
            <Button onClick={onEdit} size="icon" variant="ghost" className="hover:bg-custom-lavender-fog/20">
              <Edit className="h-4 w-4 text-custom-muted-plum dark:text-custom-lavender-fog" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="hover:bg-custom-dusty-rose/20">
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-custom-soft-peach dark:bg-custom-muted-plum/30 border-custom-muted-mint dark:border-custom-lavender-fog/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-custom-vintage-teal dark:text-custom-muted-mint">Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription className="text-custom-muted-plum dark:text-custom-lavender-fog">
                    Are you sure you want to delete this habit? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-custom-powder-blue/30 text-custom-vintage-teal hover:bg-custom-powder-blue/50 dark:bg-custom-powder-blue/20 dark:text-custom-muted-mint dark:hover:bg-custom-powder-blue/30">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-custom-dusty-rose hover:bg-custom-dusty-rose/80">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {habit.targetDays.includes('Daily') ? (
            <span className="text-xs bg-custom-muted-mint dark:bg-custom-muted-mint/30 text-custom-vintage-teal dark:text-custom-muted-mint px-2 py-1 rounded-full">Daily</span>
          ) : (
            habit.targetDays.map(day => (
              <span key={day} className="text-xs bg-custom-muted-mint dark:bg-custom-muted-mint/30 text-custom-vintage-teal dark:text-custom-muted-mint px-2 py-1 rounded-full">
                {day.substring(0, 3)}
              </span>
            ))
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <Flame className="h-5 w-5 text-custom-pale-mustard" />
            <span className="font-semibold text-custom-vintage-teal dark:text-custom-muted-mint">{habit.currentStreak} day streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Medal className="h-5 w-5 text-custom-pale-mustard" />
            <span className="font-semibold text-custom-vintage-teal dark:text-custom-muted-mint">Best: {calculateLongestStreak()}</span>
          </div>
        </div>
        
        {topBadge && (
          <div className="mb-4 p-2 bg-custom-lavender-fog/20 dark:bg-custom-lavender-fog/10 rounded-md flex items-center justify-center border border-custom-lavender-fog/30">
            <div className="flex flex-col items-center">
              <span className="badge-icon text-2xl">{topBadge.icon}</span>
              <span className="text-xs font-medium text-custom-muted-plum dark:text-custom-lavender-fog">{topBadge.name}</span>
            </div>
          </div>
        )}
        
        <HeatmapView 
          habit={habit}
          onStatusUpdate={onStatusUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default HabitCard;
