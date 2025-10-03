import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Calendar, MessageSquare, Settings, Crown, UserPlus, Globe, Lock, ArrowLeft } from 'lucide-react';

interface GroupDetailProps {
  onLogout: () => void;
}

const GroupDetail = ({ onLogout }: GroupDetailProps) => {
  const { id } = useParams();
  const [isJoined, setIsJoined] = useState(true); // Assume user is viewing a joined group
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock data - in real app, fetch based on id
  const group = {
    id: parseInt(id || '1'),
    name: 'CS 101 Study Warriors',
    description: 'Focused study group for mastering computer science fundamentals. We meet twice weekly and work through problem sets together. Our approach combines collaborative learning with individual preparation to ensure everyone succeeds.',
    course: 'CS 101 - Introduction to Computer Science',
    privacy: 'public',
    members: 12,
    maxMembers: 15,
    tags: ['Beginner Friendly', 'Problem Solving', 'Weekly Meetings'],
    meetingTime: 'Tuesdays & Thursdays 7:00 PM',
    meetingLocation: 'Library Room 201',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-01-15'
  };

  const members = [
    { id: 1, name: 'Sarah Johnson', role: 'admin', avatar: 'bg-pink-600', joinDate: '2024-01-15' },
    { id: 2, name: 'Mike Chen', role: 'member', avatar: 'bg-blue-600', joinDate: '2024-01-16' },
    { id: 3, name: 'Emily Davis', role: 'member', avatar: 'bg-green-600', joinDate: '2024-01-17' },
    { id: 4, name: 'Alex Rodriguez', role: 'member', avatar: 'bg-purple-600', joinDate: '2024-01-18' },
    { id: 5, name: 'Jessica Wong', role: 'member', avatar: 'bg-yellow-600', joinDate: '2024-01-19' },
    { id: 6, name: 'David Kim', role: 'member', avatar: 'bg-red-600', joinDate: '2024-01-20' },
    { id: 7, name: 'Lisa Thompson', role: 'member', avatar: 'bg-indigo-600', joinDate: '2024-01-21' },
    { id: 8, name: 'Ryan Park', role: 'member', avatar: 'bg-teal-600', joinDate: '2024-01-22' },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Chapter 3 Problem Set Review',
      date: '2024-02-15',
      time: '7:00 PM',
      location: 'Library Room 201'
    },
    {
      id: 2,
      title: 'Midterm Prep Session',
      date: '2024-02-18',
      time: '6:30 PM',
      location: 'Online (Zoom)'
    },
    {
      id: 3,
      title: 'Algorithm Study Session',
      date: '2024-02-20',
      time: '7:00 PM',
      location: 'Library Room 201'
    }
  ];

  const recentActivity = [
    { type: 'message', user: 'Sarah Johnson', action: 'shared lecture notes for Chapter 3', time: '2 hours ago' },
    { type: 'join', user: 'Ryan Park', action: 'joined the group', time: '1 day ago' },
    { type: 'event', user: 'Mike Chen', action: 'created "Midterm Prep Session" event', time: '2 days ago' },
    { type: 'message', user: 'Emily Davis', action: 'posted a question about recursion', time: '3 days ago' }
  ];

  const handleJoinGroup = () => {
    setIsJoined(true);
    alert('Successfully joined the group!');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleScheduleEvent = () => {
    alert('Event scheduling feature coming soon!');
  };
  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/groups"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Groups</span>
          </Link>
        </div>

        {/* Group Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-4 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-inter text-white mb-2">{group.name}</h1>
                <p className="text-gray-400 font-roboto">{group.course}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{group.members}/{group.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {group.privacy === 'public' ? (
                      <>
                        <Globe className="h-4 w-4 text-green-400" />
                        <span>Public Group</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-orange-400" />
                        <span>Private Group</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isJoined ? (
                <button
                  onClick={handleJoinGroup}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 transform hover:scale-105"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Join Group</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/chat/${group.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Open Chat</span>
                  </Link>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed mb-6">{group.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span>Meeting Time</span>
              </h3>
              <p className="text-gray-300">{group.meetingTime}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Meeting Location</h3>
              <p className="text-gray-300">{group.meetingLocation}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Created By</h3>
              <p className="text-gray-300">{group.createdBy}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag, index) => (
              <span key={index} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Members */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white font-inter">Members ({members.length})</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <div className={`p-2 rounded-full ${member.avatar}`}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium">{member.name}</p>
                          {member.role === 'admin' && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">Joined {member.joinDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white font-inter">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white font-inter">Upcoming Events</h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date} at {event.time}</span>
                      </p>
                      <p>{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white font-inter">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to={`/chat/${group.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Chat</span>
                </Link>
                <button 
                  onClick={handleScheduleEvent}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Event</span>
                </button>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Members</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-inter">Invite Member</h2>
              
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter member's email"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;