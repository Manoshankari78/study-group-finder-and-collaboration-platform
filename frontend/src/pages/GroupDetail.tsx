import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Calendar, MessageSquare, Settings, Crown, UserPlus, Globe, Lock, ArrowLeft, Loader } from 'lucide-react';
import { groupsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface GroupDetailProps {
  onLogout: () => void;
}

interface Group {
  id: number;
  name: string;
  description: string;
  course: {
    id: number;
    courseCode: string;
    courseName: string;
  };
  privacy: string;
  currentMembers: number;
  maxMembers: number;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface GroupMember {
  id: number;
  user: User;
  role: string;
  status: string;
  joinedAt: string;
}

const GroupDetail = ({ onLogout }: GroupDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (id) {
      fetchGroupData();
      fetchGroupMembers();
      checkUserMembership();
    }
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const response = await groupsAPI.getGroup(parseInt(id!));
      setGroup(response.group);
    } catch (error) {
      console.error('Failed to fetch group:', error);
      alert('Failed to load group details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const response = await groupsAPI.getGroupMembers(parseInt(id!));
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    }
  };

  const checkUserMembership = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      const myGroups = response.groups || [];
      const currentGroup = myGroups.find((g: Group) => g.id === parseInt(id!));
      
      if (currentGroup) {
        setIsJoined(true);
        // Check if current user is admin (you might need to enhance this logic)
        setIsAdmin(currentUser?.id === currentGroup.createdBy.id);
        
        if (isAdmin) {
          fetchPendingRequests();
        }
      }
    } catch (error) {
      console.error('Failed to check membership:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await groupsAPI.getPendingRequests(parseInt(id!));
      setPendingRequests(response.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await groupsAPI.joinGroup(parseInt(id!));
      setIsJoined(true);
      
      if (group?.privacy === 'PUBLIC') {
        alert('Successfully joined the group!');
        fetchGroupData(); // Refresh to update member count
        fetchGroupMembers();
      } else {
        alert('Join request sent! You will be notified when approved.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await groupsAPI.leaveGroup(parseInt(id!));
      setIsJoined(false);
      setIsAdmin(false);
      alert('Successfully left the group');
      navigate('/groups');
    } catch (error: any) {
      alert(error.message || 'Failed to leave group');
    }
  };

  const handleApproveRequest = async (userId: number) => {
    try {
      await groupsAPI.handleJoinRequest(parseInt(id!), userId, 'ACTIVE');
      alert('Request approved successfully');
      fetchPendingRequests();
      fetchGroupData();
      fetchGroupMembers();
    } catch (error: any) {
      alert(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId: number) => {
    try {
      await groupsAPI.handleJoinRequest(parseInt(id!), userId, 'REJECTED');
      alert('Request rejected successfully');
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    }
  };

  const handleScheduleEvent = () => {
    alert('Event scheduling feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Group not found</h3>
            <p className="text-gray-600 mb-6">The group you're looking for doesn't exist or you don't have access.</p>
            <Link
              to="/groups"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Groups</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/groups"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Groups</span>
          </Link>
        </div>

        {/* Group Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-inter text-gray-800 mb-2">{group.name}</h1>
                <p className="text-gray-600 font-roboto">{group.course.courseCode} - {group.course.courseName}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{group.currentMembers}/{group.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {group.privacy === 'PUBLIC' ? (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>Public Group</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-orange-500" />
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
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Join Group</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/chat/${group.id}`}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Open Chat</span>
                  </Link>
                  <button 
                    onClick={handleLeaveGroup}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    Leave Group
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-6">{group.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Created By</span>
              </h3>
              <p className="text-gray-600">{group.createdBy.name}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Created Date</h3>
              <p className="text-gray-600">{new Date(group.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Group Status</h3>
              <p className="text-gray-600">{group.currentMembers >= group.maxMembers ? 'Full' : 'Open for members'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Members */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 font-inter">Members ({members.length})</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-full">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-800 font-medium">{member.name}</p>
                          {member.id === group.createdBy.id && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Requests (Admin only) */}
            {isAdmin && pendingRequests.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 font-inter">Pending Join Requests</h2>
                </div>
                <div className="p-6 space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-500 p-2 rounded-full">
                          <UserPlus className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{request.user.name}</p>
                          <p className="text-gray-600 text-sm">{request.user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.user.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to={`/chat/${group.id}`}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Chat</span>
                </Link>
                <button 
                  onClick={handleScheduleEvent}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Event</span>
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite Members</span>
                  </button>
                )}
              </div>
            </div>

            {/* Group Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Group Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Privacy</h3>
                  <p className="text-gray-600 flex items-center space-x-2">
                    {group.privacy === 'PUBLIC' ? (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>Public - Anyone can join</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-orange-500" />
                        <span>Private - Approval required</span>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Membership</h3>
                  <p className="text-gray-600">{group.currentMembers} of {group.maxMembers} members</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Created</h3>
                  <p className="text-gray-600">{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-inter">Invite Member</h2>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Share this group link with others to invite them to join:
                </p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <code className="text-sm text-gray-800 break-all">
                    {window.location.origin}/groups/{group.id}
                  </code>
                </div>
                <p className="text-sm text-gray-500">
                  Users can request to join this group through the group discovery page.
                </p>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;