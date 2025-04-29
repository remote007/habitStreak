
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { isAuth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-[#FDF6EC] dark:bg-gray-900 border-b border-black">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#3E3E3E] flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <span>Habit Forge</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-[#3E3E3E] hover:bg-[#C5B9CD]/20 border-black"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          {isAuth ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="border-black hover:bg-[#AFCBFF]/20">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="border-black hover:bg-[#AFCBFF]/20">
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button onClick={logout} variant="ghost" className="hover:bg-[#F7C8D2]/20 text-[#3E3E3E] border-black">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="border-black hover:bg-[#AFCBFF]/20">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#F7C8D2] hover:bg-[#F7C8D2]/80 text-[#3E3E3E] border-black">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
