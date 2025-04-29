import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Habit } from '@/types';
import { createHabit, deleteHabit, formatDateToString, getTodayHabits, getUserHabits, updateHabit, updateHabitStatus } from '@/utils/habitUtils';
import HabitForm from '@/components/habits/HabitForm';
import HabitList from '@/components/habits/HabitList';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    if (user) {
      const userHabits = getUserHabits(user.id);
      setHabits(userHabits);
      setTodayHabits(getTodayHabits(userHabits));
    }
  }, [user]);

  const handleCreateHabit = (formValues: { name: string; targetDays: string[]; startDate: string }) => {
    if (!user) return;

    try {
      const newHabit = createHabit({
        userId: user.id,
        ...formValues,
      });
      
      setHabits([...habits, newHabit]);
      
      if (getTodayHabits([newHabit]).length > 0) {
        setTodayHabits([...todayHabits, newHabit]);
      }
      
      setDialogOpen(false);
      toast.success('Habit created successfully!');
    } catch (error) {
      toast.error('Failed to create habit');
      console.error(error);
    }
  };

  const handleUpdateHabit = (formValues: { name: string; targetDays: string[]; startDate: string }) => {
    if (!editingHabit || !user) return;

    try {
      const updatedHabit = updateHabit(editingHabit.id, {
        ...formValues,
      });
      
      setHabits(habits.map(habit => habit.id === updatedHabit.id ? updatedHabit : habit));
      
      setTodayHabits(getTodayHabits(
        habits.map(habit => habit.id === updatedHabit.id ? updatedHabit : habit)
      ));
      
      setEditingHabit(null);
      setDialogOpen(false);
      toast.success('Habit updated successfully!');
    } catch (error) {
      toast.error('Failed to update habit');
      console.error(error);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    try {
      deleteHabit(habitId);
      
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      setHabits(updatedHabits);
      setTodayHabits(getTodayHabits(updatedHabits));
      
      toast.success('Habit deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete habit');
      console.error(error);
    }
  };

  const handleStatusUpdate = (habitId: string, date: string, status: 'completed' | 'missed' | null) => {
    try {
      const updatedHabit = updateHabitStatus(habitId, date, status);
      
      setHabits(habits.map(habit => habit.id === habitId ? updatedHabit : habit));
      
      if (date === formatDateToString(new Date())) {
        setTodayHabits(todayHabits.map(habit => habit.id === habitId ? updatedHabit : habit));
      }
    } catch (error) {
      toast.error('Failed to update habit status');
      console.error(error);
    }
  };

  const handleEditHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setEditingHabit(habit);
      setDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Habits</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingHabit(null)}>
                  Add New Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
                </DialogHeader>
                <HabitForm 
                  initialValues={editingHabit || undefined} 
                  onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
                  submitLabel={editingHabit ? 'Update' : 'Create'}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="today">Today's Habits</TabsTrigger>
              <TabsTrigger value="all">All Habits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-0">
              <HabitList
                habits={todayHabits}
                onStatusUpdate={handleStatusUpdate}
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
              />
              
              {todayHabits.length === 0 && (
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <p className="text-lg mb-4">No habits scheduled for today!</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Create Your First Habit
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="mt-0">
              <HabitList
                habits={habits}
                onStatusUpdate={handleStatusUpdate}
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
              />
              
              {habits.length === 0 && (
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <p className="text-lg mb-4">You don't have any habits yet</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Create Your First Habit
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
