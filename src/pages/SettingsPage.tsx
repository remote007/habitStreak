
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProfile = () => {
    // In a real app, we would make an API call here
    setIsDeleting(true);
    try {
      // Remove user data from session storage
      const users = JSON.parse(sessionStorage.getItem('users') || '[]');
      const updatedUsers = users.filter((u: any) => u.id !== user?.id);
      sessionStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Log out the user
      logout();
      navigate('/register');
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6EC] dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-black">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3E3E3E]">Profile Settings</CardTitle>
              <CardDescription className="text-[#3E3E3E]/80">
                Manage your account settings and profile preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[#3E3E3E]">Email</h3>
                <p className="text-[#3E3E3E]/80">{user?.email}</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white border-black"
                      disabled={isDeleting}
                    >
                      Delete Profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#FDF6EC] border-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#3E3E3E]">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#3E3E3E]/80">
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-black text-[#3E3E3E]">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProfile}
                        className="bg-red-500 hover:bg-red-600 text-white border-black"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
