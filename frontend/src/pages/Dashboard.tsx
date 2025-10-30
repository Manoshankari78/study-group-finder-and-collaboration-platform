import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Users, Calendar, MessageSquare, TrendingUp, User, Plus, BookOpen, Clock, Star, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, groupsAPI } from '../services/api';

interface DashboardProps {
  onLogout: () => void;
}

interface Group {
  id: number;
  name: string;
  description: string;
  course?: {
    courseCode: string;
    courseName: string;
  };
  currentMembers: number;
  maxMembers?: number;
  privacy: string;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
}

interface Peer {
  user: {
    id: number;
    name: string;
    email: string;
    universityName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  commonCourses: Course[];
}

interface Activity {
  type: string;
  text: string;
  time: string;
  icon: any;
  color: string;
}

interface Event {
  id: number;
  title: string;
  time: string;
  group: string;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [coursePeers, setCoursePeers] = useState<Peer[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    joinedGroups: 0,
    upcomingEvents: 0,
    newMessages: 0,
    studyProgress: 0
  });

  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const coursesResponse = await coursesAPI.getMyCourses();
        const enrolledCourses = coursesResponse.courses || [];
        
        const peersResponse = await coursesAPI.getCoursePeers();
        const peers = peersResponse.peers || [];
        setCoursePeers(peers.slice(0, 4)); // Show only 4 peers in dashboard
        
        const groupsResponse = await groupsAPI.getMyGroups();
        const groups = groupsResponse.groups || [];
        setJoinedGroups(groups.slice(0, 3)); 
        
        // Calculate stats
        setStats({
          joinedGroups: groups.length,
          upcomingEvents: 5, // yet to implement events API
          newMessages: 0, // yet to implement messages API
          studyProgress: calculateStudyProgress(enrolledCourses)
        });

        
        generateRecentActivity(peers, groups, enrolledCourses);
        
        generateUpcomingEvents();

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateStudyProgress = (courses: any[]) => {
    if (courses.length === 0) return 0;
    
    const baseProgress = Math.min(courses.length * 15, 89);
    return baseProgress;
  };

  const generateRecentActivity = (peers: Peer[], groups: Group[], courses: any[]) => {
    const activities: Activity[] = [];
    
    if (peers.length > 0) {
      activities.push({
        type: 'peer',
        text: `${peers[0].user.name} is taking the same courses as you`,
        time: '1 hour ago',
        icon: Users,
        color: 'text-blue-500'
      });
    }
    
    if (groups.length > 0) {
      activities.push({
        type: 'group',
        text: `New discussion started in ${groups[0].name}`,
        time: '2 hours ago',
        icon: MessageSquare,
        color: 'text-green-500'
      });
    }
    
    if (courses.length > 0) {
      activities.push({
        type: 'course',
        text: `You enrolled in ${courses[0].courseName}`,
        time: '1 day ago',
        icon: BookOpen,
        color: 'text-purple-500'
      });
    }

    setRecentActivity(activities);
  };

  const generateUpcomingEvents = () => {
    const events: Event[] = [
      { id: 1, title: 'Study Session', time: 'Today, 7:00 PM', group: 'Study Group' },
      { id: 2, title: 'Group Meeting', time: 'Tomorrow, 3:00 PM', group: 'Course Discussion' },
      { id: 3, title: 'Project Review', time: 'Friday, 2:00 PM', group: 'Project Team' },
    ];
    setUpcomingEvents(events);
  };

  const getGroupColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600'
    ];
    return colors[index % colors.length];
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-pink-500 to-pink-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

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
                {stats.joinedGroups > 0 
                  ? `Ready to continue your learning journey? You have ${stats.joinedGroups} active study groups and ${stats.upcomingEvents} upcoming events.`
                  : 'Get started by enrolling in courses and joining study groups!'}
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
                <p className="text-3xl font-bold text-gray-800">{stats.joinedGroups}</p>
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
                <p className="text-3xl font-bold text-gray-800">{stats.upcomingEvents}</p>
                <p className="text-gray-500 text-sm font-medium">Upcoming Events</p>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{stats.newMessages}</p>
                <p className="text-gray-500 text-sm font-medium">New Messages</p>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{stats.studyProgress}%</p>
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
                {joinedGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No groups joined yet</h3>
                    <p className="text-gray-600 mb-4">
                      Join study groups to collaborate with peers and enhance your learning experience.
                    </p>
                    <Link
                      to="/groups"
                      className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Explore Groups</span>
                    </Link>
                  </div>
                ) : (
                  joinedGroups.map((group, index) => (
                    <Link 
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="block p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${getGroupColor(index)} shadow-lg`}>
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-base">{group.name}</h3>
                          <p className="text-gray-600 mb-2 text-sm">{group.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{group.currentMembers} members</span>
                            </span>
                            {group.course && (
                              <span className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{group.course.courseCode}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Course Peers */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800 font-inter">Course Peers</h2>
                  <Link 
                    to="/peers"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {coursePeers.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Enroll in courses to find peers</p>
                    <Link 
                      to="/courses"
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-2 inline-block"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  coursePeers.map((peer, index) => (
                    <div key={peer.user.id} className="flex items-center space-x-3">
                      {peer.user.avatarUrl ? (
                        <img
                          src={peer.user.avatarUrl}
                          alt={peer.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`p-3 rounded-full bg-gradient-to-r ${getAvatarColor(index)} shadow-lg`}>
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{peer.user.name}</p>
                        <p className="text-gray-500 text-sm">{peer.user.universityName || 'Student'}</p>
                        {peer.commonCourses && peer.commonCourses.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            <BookOpen className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {peer.commonCourses.length} shared courses
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105">
                        Connect
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => {
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
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;