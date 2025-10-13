import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Search, Plus, Lock, Globe, Filter, Loader } from 'lucide-react';
import { groupsAPI, coursesAPI } from '../services/api';

interface GroupDiscoveryProps {
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

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

const GroupDiscovery = ({ onLogout }: GroupDiscoveryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterPrivacy, setFilterPrivacy] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchCourses();
    fetchMyGroups();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGroups();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCourse, filterPrivacy]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await groupsAPI.getGroups(
        searchTerm || undefined,
        filterCourse ? parseInt(filterCourse) : undefined
      );
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      const myGroupIds = (response.groups || []).map((group: Group) => group.id);
      setJoinedGroups(myGroupIds);
    } catch (error) {
      console.error('Failed to fetch my groups:', error);
    }
  };

  const handleJoinGroup = async (groupId: number, privacy: string) => {
    try {
      const response = await groupsAPI.joinGroup(groupId);
      setJoinedGroups(prev => [...prev, groupId]);
      
      if (privacy === 'PUBLIC') {
        alert('Successfully joined the group!');
        fetchGroups(); // Refresh groups to update member count
      } else {
        alert('Join request sent! You will be notified when approved.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to join group');
    }
  };

  const getCourseName = (course: any) => {
    if (!course) return 'Unknown Course';
    return `${course.courseCode} - ${course.courseName}`;
  };

  const filteredGroups = groups.filter(group => {
    const matchesPrivacy = !filterPrivacy || group.privacy === filterPrivacy;
    return matchesPrivacy;
  });

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
                  placeholder="Search groups by name or description..."
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
                  <option key={course.id} value={course.id}>
                    {course.courseCode}
                  </option>
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
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
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
                      <p className="text-sm text-gray-600">{getCourseName(group.course)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {group.privacy === 'PRIVATE' ? (
                      <Lock className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{group.currentMembers}/{group.maxMembers} members</span>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${(group.currentMembers / group.maxMembers) * 100}%` }}
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
                        : group.privacy === 'PUBLIC'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {joinedGroups.includes(group.id) 
                      ? 'Joined' 
                      : group.privacy === 'PUBLIC' 
                      ? 'Join Group' 
                      : 'Request to Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredGroups.length === 0 && (
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