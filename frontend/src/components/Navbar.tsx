import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, BookOpen, Users, MessageSquare, Calendar, LogOut, User, Settings, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar = ({ onLogout }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Mock unread count - in real app this would come from props or context
  const unreadCount = 3;

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="font-inter font-bold text-xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                StudyConnect
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Profile */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 p-0.5 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Profile" 
                    className="h-7 w-7 rounded-xl object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-white" />
                )}
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
    </nav>
  );
};

export default Navbar;