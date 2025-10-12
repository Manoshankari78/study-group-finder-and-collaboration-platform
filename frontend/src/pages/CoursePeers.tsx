import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Mail, BookOpen, Loader, MessageCircle, ExternalLink } from 'lucide-react';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CoursePeersProps {
  onLogout: () => void;
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

const CoursePeers = ({ onLogout }: CoursePeersProps) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPeers, setFilteredPeers] = useState<Peer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursePeers();
  }, []);

  useEffect(() => {
    filterPeers();
  }, [peers, searchTerm, selectedCourse]);

  const fetchCoursePeers = async () => {
    try {
      const response = await coursesAPI.getCoursePeers();
      setPeers(response.peers || []);
    } catch (error) {
      console.error('Failed to fetch course peers:', error);
      alert('Failed to load course peers');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPeers = () => {
    let filtered = peers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(peer =>
        peer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.commonCourses.some(course =>
          course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by selected course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(peer =>
        peer.commonCourses.some(course => course.id.toString() === selectedCourse)
      );
    }

    setFilteredPeers(filtered);
  };

  const getAllCourses = () => {
    const allCourses = peers.flatMap(peer => peer.commonCourses);
    
    const uniqueCourses = allCourses.filter((course, index, self) =>
      index === self.findIndex(c => c.id === course.id)
    );
    return uniqueCourses.sort((a, b) => a.courseName.localeCompare(b.courseName));
  };

  const handleViewCoursePeers = (courseId: number, courseName: string) => {
    navigate(`/courses/${courseId}/peers`, { 
      state: { courseName } 
    });
  };

  const handleSendMessage = (peerId: number, peerName: string) => {
    // TODO: Implement message functionality
    alert(`Messaging feature for ${peerName} will be implemented soon!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Course Peers
          </h1>
          <p className="text-gray-600 font-roboto">
            Connect with students who are taking the same courses as you.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Peers
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {getAllCourses().map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 font-inter">
                  Students in Your Courses
                </h2>
                <p className="text-gray-600 text-sm">
                  Found {filteredPeers.length} peers sharing courses with you
                  {selectedCourse !== 'all' && ` in selected course`}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {peers.length} total peers
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredPeers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {peers.length === 0 ? 'No peers found' : 'No matching peers'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {peers.length === 0 
                    ? 'Enroll in some courses to find peers who are studying the same subjects.'
                    : 'Try adjusting your search criteria or course filter.'
                  }
                </p>
                {peers.length === 0 && (
                  <Link
                    to="/courses"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Browse Courses</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeers.map((peer, index) => (
                  <div key={peer.user.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
                    <div className="flex items-start space-x-4 mb-4">
                      {peer.user.avatarUrl ? (
                        <img
                          src={peer.user.avatarUrl}
                          alt={peer.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{peer.user.name}</h3>
                        <p className="text-gray-600 text-sm flex items-center space-x-1 mt-1">
                          <Mail className="h-3 w-3" />
                          <span>{peer.user.email}</span>
                        </p>
                        {peer.user.universityName && (
                          <p className="text-gray-500 text-xs mt-1">{peer.user.universityName}</p>
                        )}
                      </div>
                    </div>
                    
                    {peer.user.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{peer.user.bio}</p>
                    )}

                    {/* Common Courses */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Shared Courses ({peer.commonCourses.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {peer.commonCourses.slice(0, 3).map(course => (
                          <div key={course.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-800">{course.courseCode}</p>
                              <p className="text-xs text-gray-600 truncate">{course.courseName}</p>
                            </div>
                            <button
                              onClick={() => handleViewCoursePeers(course.id, course.courseName)}
                              className="text-blue-500 hover:text-blue-600 p-1"
                              title="View all peers in this course"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {peer.commonCourses.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{peer.commonCourses.length - 3} more courses
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSendMessage(peer.user.id, peer.user.name)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </button>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePeers;