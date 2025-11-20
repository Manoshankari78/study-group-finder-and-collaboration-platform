import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Calendar, MessageSquare, Settings, Crown, UserPlus, Globe, Lock, ArrowLeft, Loader, User, Mail, NotebookPen, FileText } from 'lucide-react';
import { groupsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

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
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

const GroupDetail = ({ onLogout }: GroupDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<GroupMember[]>([]);
  const [userMembershipStatus, setUserMembershipStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchPendingRequests();
    }
  }, [isAdmin, id]);

  const fetchGroupData = async () => {
    try {
      const response = await groupsAPI.getGroup(parseInt(id!));
      setGroup(response.group);

      await checkUserMembership(response.group);

      await fetchGroupMembers();
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

  const checkUserMembership = async (groupData?: Group) => {
    try {
      const response = await groupsAPI.getMyMembership(parseInt(id!));

      if (response.membership) {
        setIsJoined(true);
        setUserMembershipStatus(response.membership.status);

        // Check if user is admin
        const userIsAdmin = response.membership.role === 'ADMIN';
        setIsAdmin(userIsAdmin);
      } else {
        setIsJoined(false);
        setUserMembershipStatus('');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to check membership:', error);
      setIsJoined(false);
      setUserMembershipStatus('');
      setIsAdmin(false);
    }
  };


  const fetchPendingRequests = async () => {
    try {
      const response = await groupsAPI.getPendingRequests(parseInt(id!));
      setPendingRequests(response.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setIsAdmin(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await groupsAPI.joinGroup(parseInt(id!));

      // Refresh membership status after joining
      await checkUserMembership();

      if (group?.privacy === 'PUBLIC') {
        toast.success("Successfully joined the group!");
        fetchGroupData();
        fetchGroupMembers();
      } else {
        toast.success('Join request sent!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = await new Promise((resolve) => {
      toast(t => (
        <div className='flex flex-col gap-2 justify-between'>
          Leave group?
          <div className='flex items-center justify-evenly'>
            <button onClick={() => { resolve(true); toast.dismiss(t.id); }} className="text-red-600">Yes</button>
            <button onClick={() => { resolve(false); toast.dismiss(t.id); }}>No</button>
          </div>

        </div>
      ), { duration: Infinity });
    });

    if (!confirmed) return;

    try {
      await groupsAPI.leaveGroup(parseInt(id!));
      setIsJoined(false);
      setIsAdmin(false);
      setUserMembershipStatus('');
      // alert('Successfully left the group');
      toast.success("Successfully left the group");
      navigate('/groups');
    } catch (error: any) {
      alert(error.message || 'Failed to leave group');
    }
  };

  const handleApproveRequest = async (userId: number) => {
    try {
      await groupsAPI.handleJoinRequest(parseInt(id!), userId, 'ACTIVE');
      toast.success('Request approved successfully');
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
      toast.success('Request rejected successfully');
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    }
  };

  const handleScheduleEvent = () => {
    toast.error('Event scheduling feature coming soon!');
  };

  const renderJoinButton = () => {
    if (isJoined) {
      if (userMembershipStatus === 'PENDING') {
        return (
          <button
            disabled
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 opacity-75 cursor-not-allowed"
          >
            <UserPlus className="h-5 w-5" />
            <span>Request Pending</span>
          </button>
        );
      }

      return (
        <div className="w-full md:w-auto md:py-0 py-3 flex items-center md:flex-row flex-col gap-2 md:space-x-3">
          <div className='flex space-x-5 justify-evenly w-full md:w-auto'>
            <Link
              to={`/chat/${group?.id}`}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 w-full md:w-auto justify-center rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Open Chat</span>
            </Link>
            {
              isAdmin && (
                <Link
                  to={`/groups/${group?.id}/edit`}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 w-full md:w-auto hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex justify-center items-center space-x-2 shadow-lg"
                >
                  <Settings className="h-5 w-5" />
                  <span>Edit Group</span>
                </Link>
              )
            }</div>
          <div className='w-full md:w-auto flex justify-center'>
            {!isAdmin && (
              <button
                onClick={handleLeaveGroup}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl w-full font-medium transition-colors duration-200"
              >
                Leave Group
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleLeaveGroup}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 w-full rounded-xl font-medium transition-colors duration-200"
              >
                Leave Group
              </button>
            )}</div>
        </div>
      );
    }

    return (
      <button
        onClick={handleJoinGroup}
        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium md:mt-0 mt-2 md:w-auto w-full transition-colors duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
      >
        <UserPlus className="h-5 w-5" />
        <span>{group?.privacy === 'PUBLIC' ? 'Join Group' : 'Request to Join'}</span>
      </button>
    );
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
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Groups</span>
          </Link>
        </div>

        {/* Group Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between flex-col md:flex-row mb-6">
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
                  {userMembershipStatus === 'PENDING' && (
                    <div className="flex items-center space-x-2 text-sm text-yellow-600">
                      <UserPlus className="h-4 w-4" />
                      <span>Join Request Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {renderJoinButton()}
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 font-inter">Members ({members.length})</h2>
                  <Link
                    to={`/groups/${group.id}/members`}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    View All Members
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.slice(0, 6).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full">
                        {member.avatarUrl ?
                          <div className='h-10 w-10'>
                            <img src={member.avatarUrl} className='h-full w-full rounded-full object-cover' />
                          </div>
                          :
                          <div className='p-2'>
                            <User className='h-5 w-5 text-white' />
                          </div>
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-800 font-medium">{member.name}</p>
                          {member.role === 'ADMIN' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {members.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link
                      to={`/groups/${group.id}/members`}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      View all {members.length} members
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Requests (Admin only) */}
            {isAdmin && pendingRequests.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 font-inter">
                    Pending Join Requests ({pendingRequests.length})
                  </h2>
                </div>
                <div className="p-6">
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="flex flex-col md:flex-row md:gap-0 gap-2 md:items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <div className="flex items-center space-x-3">
                            {request.avatarUrl ?
                              <div className='h-10 w-10'>
                                <img src={request.avatarUrl} className='h-full w-full rounded-full object-cover' />
                              </div>
                              :
                              <div className='p-2 bg-orange-500'>
                                <UserPlus className='h-5 w-5 text-white' />
                              </div>
                            }
                            <div>
                              <p className="text-gray-800 font-medium">{request.name}</p>
                              <div className="text-gray-600 text-sm flex items-center space-x-1 mt-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <p className='md:max-w-[300px] max-w-[175px] overflow-clip'>{request.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request.userId)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.userId)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No pending join requests</p>
                    </div>
                  )}
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
                {
                  isJoined && (
                    <Link
                      to={`/groups/${group.id}/files`}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Files</span>
                    </Link>
                  )
                }
                {isAdmin && (
                  <Link
                    to={`/groups/${group.id}/create-event`}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Event</span>
                  </Link>
                )}


                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 justify-center"
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
      <Toaster />
    </div>
  );
};

export default GroupDetail;
