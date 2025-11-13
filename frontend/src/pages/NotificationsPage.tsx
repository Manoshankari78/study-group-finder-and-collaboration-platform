import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Users, 
  UserPlus, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Filter, 
  Search, 
  X,
  Trash2,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { eventsAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationsPageProps {
  onLogout: () => void;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  group: {
    id: number;
    name: string;
  };
}

const NotificationsPage = ({ onLogout }: NotificationsPageProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return Calendar;
      case 'reminder':
        return Clock;
      case 'message':
        return MessageSquare;
      case 'join':
        return Users;
      case 'invitation':
        return UserPlus;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'text-blue-500 bg-blue-50';
      case 'reminder':
        return 'text-orange-500 bg-orange-50';
      case 'message':
        return 'text-green-500 bg-green-50';
      case 'join':
        return 'text-purple-500 bg-purple-50';
      case 'invitation':
        return 'text-teal-500 bg-teal-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'unread' && !notification.isRead) ||
      (filterType === 'read' && notification.isRead);
    
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleRemoveNotification = (notificationId: number) => {
    removeNotification(notificationId);
    toast.success('Notification removed');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('All notifications cleared');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent font-inter mb-3">
                Notifications Center
              </h1>
              <p className="text-gray-600 font-roboto text-lg">
                Stay updated with your study groups and activities
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{notifications.length}</p>
                <p className="text-gray-600 text-sm font-medium">Total Notifications</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{unreadCount}</p>
                <p className="text-gray-600 text-sm font-medium">Unread</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-2xl shadow-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{readNotifications.length}</p>
                <p className="text-gray-600 text-sm font-medium">Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterType('unread')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filterType === 'unread'
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Unread ({unreadNotifications.length})
                </button>
                <button
                  onClick={() => setFilterType('read')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filterType === 'read'
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Read ({readNotifications.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 font-inter">
                {filterType === 'all' ? 'All Notifications' : 
                 filterType === 'unread' ? 'Unread Notifications' :
                 'Read Notifications'}
              </h2>
              <span className="text-gray-500 text-sm">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  {searchTerm ? 'No notifications found' : 'No notifications yet'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Your notifications will appear here'}
                </p>
                {!searchTerm && (
                  <Link
                    to="/calendar"
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Check your calendar for upcoming events
                  </Link>
                )}
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-6 transition-all duration-200 group ${
                      notification.isRead 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-2xl ${getNotificationColor(notification.type)} flex-shrink-0 shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className={`font-semibold text-gray-800 ${
                              !notification.isRead ? 'font-bold' : ''
                            }`}>
                              {notification.title}
                            </h3>
                            
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse"></div>
                            )}
                            <span className="text-gray-400 text-sm whitespace-nowrap">
                              {(new Date(notification.createdAt)).toISOString().slice(0,16).split("T")[0] +" "+ (new Date(notification.createdAt)).toISOString().slice(0,16).split("T")[1]}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center space-x-1 hover:underline"
                            >
                              <Check className="h-4 w-4" />
                              <span>Mark as Read</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoveNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center space-x-1 hover:underline"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>

                          {notification && (
                            <Link
                              to={`/calendar`}
                              className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors flex items-center space-x-1 hover:underline"
                            >
                              <ArrowLeft className="h-4 w-4 transform rotate-180" />
                              <span>View</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;