import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Crown, UserPlus, Mail, Loader } from 'lucide-react';
import { groupsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface GroupMembersProps {
  onLogout: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

const GroupMembers = ({ onLogout }: GroupMembersProps) => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupMembers();
      checkUserRole();
    }
  }, [id]);

  const fetchGroupMembers = async () => {
    try {
      const response = await groupsAPI.getGroupMembers(parseInt(id!));
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      const myGroups = response.groups || [];
      const currentGroup = myGroups.find((group: any) => group.id === parseInt(id!));
      
      if (currentGroup) {
        setIsAdmin(currentUser?.id === currentGroup.createdBy.id);
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      // Note: You might need to implement a remove member endpoint
      alert('Remove member functionality to be implemented');
    } catch (error: any) {
      alert(error.message || 'Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Group Members
          </h1>
          <p className="text-gray-600">
            Manage group members and permissions
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 font-inter">
                Members ({members.length})
              </h2>
              {isAdmin && (
                <button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Member</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-xl">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800">{member.name}</h3>
                        {isAdmin && member.id === currentUser?.id && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </p>
                    </div>
                  </div>

                  {isAdmin && member.id !== currentUser?.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {members.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No members yet</h3>
                <p className="text-gray-600">Start inviting members to your study group.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;