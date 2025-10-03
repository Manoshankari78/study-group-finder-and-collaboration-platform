import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Search, Plus, Lock, Globe, Filter } from 'lucide-react';

interface GroupDiscoveryProps {
  onLogout: () => void;
}

const GroupDiscovery = ({ onLogout }: GroupDiscoveryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterPrivacy, setFilterPrivacy] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);

  const groups = [
    {
      id: 1,
      name: 'CS 101 Study Warriors',
      description: 'Focused study group for mastering computer science fundamentals. We meet twice weekly and work through problem sets together.',
      course: 'CS 101',
      privacy: 'public',
      members: 12,
      maxMembers: 15,
      tags: ['Beginner Friendly', 'Problem Solving', 'Weekly Meetings']
    },
    {
      id: 2,
      name: 'Advanced Calculus Masters',
      description: 'For students who want to excel in calculus. We tackle challenging problems and prepare for exams together.',
      course: 'MATH 201',
      privacy: 'private',
      members: 8,
      maxMembers: 10,
      tags: ['Advanced', 'Exam Prep', 'Problem Sets']
    },
    {
      id: 3,
      name: 'Physics Lab Partners',
      description: 'Study group focused on physics lab work and theoretical understanding. Perfect for hands-on learners.',
      course: 'PHYS 101',
      privacy: 'public',
      members: 6,
      maxMembers: 12,
      tags: ['Lab Work', 'Theory', 'Hands-on']
    },
    {
      id: 4,
      name: 'Data Structures Deep Dive',
      description: 'Advanced study group for CS 201. We focus on algorithm optimization and complex data structure implementations.',
      course: 'CS 201',
      privacy: 'private',
      members: 5,
      maxMembers: 8,
      tags: ['Advanced', 'Algorithms', 'Implementation']
    },
    {
      id: 5,
      name: 'Chemistry Study Circle',
      description: 'Collaborative learning group for general chemistry. We share notes, discuss concepts, and prepare for labs.',
      course: 'CHEM 101',
      privacy: 'public',
      members: 10,
      maxMembers: 15,
      tags: ['Lab Prep', 'Note Sharing', 'Concept Review']
    },
    {
      id: 6,
      name: 'English Composition Collective',
      description: 'Writing-focused group where we peer review essays, discuss literature, and improve our writing skills.',
      course: 'ENG 102',
      privacy: 'public',
      members: 7,
      maxMembers: 10,
      tags: ['Writing', 'Peer Review', 'Literature']
    }
  ];

  const courses = ['CS 101', 'MATH 201', 'PHYS 101', 'CS 201', 'CHEM 101', 'ENG 102'];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !filterCourse || group.course === filterCourse;
    const matchesPrivacy = !filterPrivacy || group.privacy === filterPrivacy;
    
    return matchesSearch && matchesCourse && matchesPrivacy;
  });

  const handleJoinGroup = (groupId: number, privacy: string) => {
    if (privacy === 'public') {
      setJoinedGroups(prev => [...prev, groupId]);
      alert('Successfully joined the group!');
    } else {
      alert('Join request sent! You will be notified when approved.');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Discover Study Groups
            </h1>
            <p className="text-gray-600 font-roboto">
              Find and join study groups that match your learning goals.
            </p>
          </div>
          <Link
            to="/groups/create"
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Privacy Filter */}
            <div>
              <select
                value={filterPrivacy}
                onChange={(e) => setFilterPrivacy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">All Groups</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 hover:border-blue-500 transition-all duration-200 transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.course}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {group.privacy === 'private' ? (
                    <Lock className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{group.members}/{group.maxMembers} members</span>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                    style={{ width: `${(group.members / group.maxMembers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  to={`/groups/${group.id}`}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium transition-colors text-center"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleJoinGroup(group.id, group.privacy)}
                  disabled={joinedGroups.includes(group.id)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    joinedGroups.includes(group.id)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : group.privacy === 'public'
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {joinedGroups.includes(group.id) 
                    ? 'Joined' 
                    : group.privacy === 'public' 
                    ? 'Join Group' 
                    : 'Request to Join'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or create a new group.</p>
            <Link
              to="/groups/create"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Group</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDiscovery;