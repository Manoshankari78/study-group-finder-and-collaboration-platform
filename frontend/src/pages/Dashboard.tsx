import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, Calendar, MessageSquare, TrendingUp, User, Plus, BookOpen, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();

  const joinedGroups = [
    { id: 1, name: 'CS 101 Study Group', course: 'Introduction to Computer Science', members: 8, color: 'from-blue-500 to-blue-600', lastActivity: '2 hours ago' },
    { id: 2, name: 'Calculus Warriors', course: 'Calculus I', members: 12, color: 'from-green-500 to-green-600', lastActivity: '1 day ago' },
    { id: 3, name: 'Physics Lab Partners', course: 'Physics II', members: 6, color: 'from-purple-500 to-purple-600', lastActivity: '3 hours ago' },
  ];

  const suggestedPeers = [
    { id: 1, name: 'Alice Johnson', course: 'Computer Science', avatar: 'from-pink-500 to-pink-600', rating: 4.8 },
    { id: 2, name: 'Bob Smith', course: 'Mathematics', avatar: 'from-yellow-500 to-yellow-600', rating: 4.9 },
    { id: 3, name: 'Carol Davis', course: 'Physics', avatar: 'from-indigo-500 to-indigo-600', rating: 4.7 },
    { id: 4, name: 'David Wilson', course: 'Engineering', avatar: 'from-red-500 to-red-600', rating: 4.6 },
  ];

  const recentActivity = [
    { type: 'message', text: 'New message in CS 101 Study Group', time: '5 min ago', icon: MessageSquare, color: 'text-blue-500' },
    { type: 'event', text: 'Calculus study session tomorrow at 3 PM', time: '1 hour ago', icon: Calendar, color: 'text-green-500' },
    { type: 'join', text: 'Sarah joined Physics Lab Partners', time: '2 hours ago', icon: Users, color: 'text-purple-500' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'CS 101 Study Session', time: 'Today, 7:00 PM', group: 'CS 101 Study Group' },
    { id: 2, title: 'Calculus Review', time: 'Tomorrow, 3:00 PM', group: 'Calculus Warriors' },
    { id: 3, title: 'Physics Lab Prep', time: 'Friday, 2:00 PM', group: 'Physics Lab Partners' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-inter mb-3">
                  Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-blue-100 font-roboto text-lg">
                Ready to continue your learning journey? You have 3 active study groups and 5 upcoming events.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <BookOpen className="h-16 w-16 text-white mx-auto mb-2" />
                <p className="text-center text-sm">Keep Learning!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">3</p>
                <p className="text-gray-500 text-sm font-medium">Joined Groups</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">5</p>
                <p className="text-gray-500 text-sm font-medium">Upcoming Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">12</p>
                <p className="text-gray-500 text-sm font-medium">New Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">89%</p>
                <p className="text-gray-500 text-sm font-medium">Study Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Joined Groups */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 font-inter">Your Study Groups</h2>
                  <Link 
                    to="/groups"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Find Groups</span>
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {joinedGroups.map((group) => (
                  <Link 
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="block p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${group.color} shadow-lg`}>
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
                        <p className="text-gray-600 mb-2">{group.course}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{group.members} members</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{group.lastActivity}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Upcoming Events</h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-1">{event.time}</p>
                    <p className="text-gray-500 text-xs">{event.group}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Peers */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Suggested Peers</h2>
              </div>
              <div className="p-6 space-y-4">
                {suggestedPeers.map((peer) => (
                  <div key={peer.id} className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${peer.avatar} shadow-lg`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{peer.name}</p>
                      <p className="text-gray-500 text-sm">{peer.course}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{peer.rating}</span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl bg-gray-100`}>
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-medium">{activity.text}</p>
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;