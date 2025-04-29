
import { Habit, BadgeInfo, HabitHistory, HabitStatus } from "@/types";
import { toast } from 'sonner';

// Badge definitions
export const BADGES: BadgeInfo[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: "🥉",
    description: "First successful streak!",
    requiredStreak: 3,
  },
  {
    id: "weekly-warrior",
    name: "Weekly Warrior",
    icon: "🥈",
    description: "A full week of consistency!",
    requiredStreak: 7,
  },
  {
    id: "fortnight-focus",
    name: "Fortnight Focus",
    icon: "🥇",
    description: "Two strong weeks!",
    requiredStreak: 14,
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    icon: "🏆",
    description: "A habit formed for real!",
    requiredStreak: 30,
  },
];

// Get all habits for the current user
export const getUserHabits = (userId: string): Habit[] => {
  const habits = JSON.parse(sessionStorage.getItem("habits") || "[]");
  return habits.filter((habit: Habit) => habit.userId === userId);
};

// Create a new habit
export const createHabit = (habit: Omit<Habit, "id" | "history" | "currentStreak" | "longestStreak" | "badges">): Habit => {
  const habits = JSON.parse(sessionStorage.getItem("habits") || "[]");
  
  const newHabit: Habit = {
    id: crypto.randomUUID(),
    history: {},
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    ...habit,
  };
  
  habits.push(newHabit);
  sessionStorage.setItem("habits", JSON.stringify(habits));
  
  return newHabit;
};

// Update an existing habit
export const updateHabit = (habitId: string, updates: Partial<Habit>): Habit => {
  const habits = JSON.parse(sessionStorage.getItem("habits") || "[]");
  const index = habits.findIndex((h: Habit) => h.id === habitId);
  
  if (index === -1) {
    throw new Error("Habit not found");
  }
  
  const updatedHabit = { ...habits[index], ...updates };
  habits[index] = updatedHabit;
  
  sessionStorage.setItem("habits", JSON.stringify(habits));
  return updatedHabit;
};

// Delete a habit
export const deleteHabit = (habitId: string): void => {
  let habits = JSON.parse(sessionStorage.getItem("habits") || "[]");
  habits = habits.filter((h: Habit) => h.id !== habitId);
  sessionStorage.setItem("habits", JSON.stringify(habits));
};

// Update habit status for today
export const updateHabitStatus = (
  habitId: string, 
  date: string, 
  status: HabitStatus
): Habit => {
  const habits = JSON.parse(sessionStorage.getItem("habits") || "[]");
  const index = habits.findIndex((h: Habit) => h.id === habitId);
  
  if (index === -1) {
    throw new Error("Habit not found");
  }
  
  const habit = habits[index];
  
  // Update history
  const updatedHistory = { ...habit.history, [date]: status };
  
  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(updatedHistory, habit.targetDays);
  
  // Check if new badges unlocked
  const newBadges = checkForNewBadges(currentStreak, habit.badges);
  
  if (newBadges.length > 0) {
    // Show notifications for each new badge
    newBadges.forEach(badgeId => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) {
        toast(`🎉 Badge Unlocked: ${badge.icon} ${badge.name}`, {
          description: badge.description
        });
      }
    });
  }
  
  // Update habit with new data
  const updatedHabit = {
    ...habit,
    history: updatedHistory,
    currentStreak,
    longestStreak,
    badges: [...habit.badges, ...newBadges]
  };
  
  habits[index] = updatedHabit;
  sessionStorage.setItem("habits", JSON.stringify(habits));
  
  return updatedHabit;
};

// Calculate current and longest streaks
export const calculateStreaks = (
  history: HabitHistory,
  targetDays: string[]
): { currentStreak: number; longestStreak: number } => {
  // Convert history to sorted array of entries [date, status]
  const entries = Object.entries(history).sort((a, b) => 
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let streakBroken = false;
  
  // Process history from newest to oldest
  for (let i = entries.length - 1; i >= 0; i--) {
    const [date, status] = entries[i];
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // If this is a target day
    if (targetDays.includes(dayOfWeek) || targetDays.includes('Daily')) {
      if (status === 'completed') {
        if (!streakBroken) currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (status === 'missed') {
        streakBroken = true;
      }
    }
  }
  
  return { currentStreak, longestStreak };
};

// Check for newly unlocked badges based on streak
export const checkForNewBadges = (currentStreak: number, existingBadges: string[]): string[] => {
  return BADGES
    .filter(badge => 
      currentStreak >= badge.requiredStreak && !existingBadges.includes(badge.id)
    )
    .map(badge => badge.id);
};

// Get today's habits (those that should be active today)
export const getTodayHabits = (habits: Habit[]): Habit[] => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  return habits.filter(habit => {
    // If habit is set for every day
    if (habit.targetDays.includes('Daily')) return true;
    
    // If today is one of the target days
    if (habit.targetDays.includes(dayOfWeek)) return true;
    
    return false;
  });
};

// Format date as YYYY-MM-DD
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get habit status for a specific date
export const getHabitStatusForDate = (habit: Habit, date: string): HabitStatus => {
  return habit.history[date] || null;
};

// Check if a specific date is a target day for the habit
export const isTargetDay = (habit: Habit, date: Date): boolean => {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  return habit.targetDays.includes('Daily') || habit.targetDays.includes(dayOfWeek);
};

// Generate dates for heatmap (from start date to current date)
export const generateHeatmapDates = (startDate: string, endDate: string = formatDateToString(new Date())): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// Get badge details by ID
export const getBadgeById = (badgeId: string): BadgeInfo | undefined => {
  return BADGES.find(badge => badge.id === badgeId);
};
