import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Bell, MessageSquare, Calendar, Users, UserPlus, ArrowLeft, Check, CheckCheck, Filter, Search, X } from 'lucide-react';

interface NotificationsPageProps {
  onLogout: () => void;
}

const NotificationsPage = ({ onLogout }: NotificationsPageProps) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New message in CS 101 Study Group', message: 'Sarah: "Hey everyone! Did anyone finish the problem set for Chapter 3?"', time: '5 min ago', type: 'message', unread: true, icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 2, title: 'Calculus study session tomorrow at 3 PM', message: 'Don\'t forget about our calculus review session in Library Room 201', time: '1 hour ago', type: 'event', unread: true, icon: Calendar, color: 'text-green-500', bgColor: 'bg-green-50' },
    { id: 3, title: 'Sarah joined Physics Lab Partners', message: 'Welcome Sarah to the Physics Lab Partners group!', time: '2 hours ago', type: 'join', unread: true, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { id: 4, title: 'Assignment reminder: Data Structures homework due Friday', message: 'Complete the binary tree implementation assignment', time: '1 day ago', type: 'reminder', unread: false, icon: Calendar, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: 5, title: 'Group invitation from Advanced Calculus Masters', message: 'You\'ve been invited to join the Advanced Calculus Masters study group', time: '2 days ago', type: 'invitation', unread: false, icon: UserPlus, color: 'text-teal-500', bgColor: 'bg-teal-50' },
    { id: 6, title: 'New study material shared in Physics Lab', message: 'Mike shared "Quantum Mechanics Notes" in the group', time: '3 days ago', type: 'message', unread: false, icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 7, title: 'Weekly study session scheduled', message: 'CS 101 weekly review session every Tuesday at 6 PM', time: '1 week ago', type: 'event', unread: false, icon: Calendar, color: 'text-green-500', bgColor: 'bg-green-50' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;
  const totalCount = notifications.length;
  const readCount = totalCount - unreadCount;

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && notification.unread) ||
                         (filterType === 'read' && !notification.unread) ||
                         notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: totalCount },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'read', label: 'Read', count: readCount },
    { value: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { value: 'event', label: 'Events', count: notifications.filter(n => n.type === 'event').length },
    { value: 'join', label: 'New Members', count: notifications.filter(n => n.type === 'join').length },
    { value: 'invitation', label: 'Invitations', count: notifications.filter(n => n.type === 'invitation').length }
  ];

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
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
              >
                <CheckCheck className="h-5 w-5" />
                <span>Mark All Read</span>
              </button>
            )}
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
                <p className="text-3xl font-bold text-gray-800">{totalCount}</p>
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
                <p className="text-3xl font-bold text-gray-800">{readCount}</p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filterType === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{option.count}</div>
                      <div className="text-xs">{option.label}</div>
                    </div>
                  </button>
                ))}
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
                 filterType === 'read' ? 'Read Notifications' :
                 filterOptions.find(f => f.value === filterType)?.label || 'Notifications'}
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
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No notifications found</h3>
                <p className="text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all duration-200 ${
                      notification.unread ? 'bg-gradient-to-r from-blue-50/50 to-teal-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-2xl ${notification.bgColor} flex-shrink-0 shadow-sm`}>
                        <Icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-semibold text-gray-800 ${
                            notification.unread ? 'font-bold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            {notification.unread && (
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse"></div>
                            )}
                            <span className="text-gray-400 text-sm whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {notification.unread && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
                          >
                            Mark as Read
                          </button>
                        )}
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