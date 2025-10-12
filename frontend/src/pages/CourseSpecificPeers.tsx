import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Mail, BookOpen, Loader, ArrowLeft, MessageCircle } from 'lucide-react';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CourseSpecificPeersProps {
  onLogout: () => void;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  description?: string;
}

interface Peer {
  id: number;
  name: string;
  email: string;
  universityName?: string;
  avatarUrl?: string;
  bio?: string;
}

const CourseSpecificPeers = ({ onLogout }: CourseSpecificPeersProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (courseId) {
      fetchCoursePeers(parseInt(courseId));
      fetchCourseDetails(parseInt(courseId));
    }
  }, [courseId]);

  const fetchCoursePeers = async (id: number) => {
    try {
      const response = await coursesAPI.getPeersInCourse(id);
      setPeers(response.peers || []);
    } catch (error) {
      console.error('Failed to fetch course peers:', error);
      alert('Failed to load course peers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseDetails = async (id: number) => {
    try {
      const response = await coursesAPI.getCourse(id);
      
      setCourse(response.course);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      // If course details fail, try to get course name from location state
      if (location.state?.courseName) {
        setCourse({
          id: id,
          courseCode: 'Unknown',
          courseName: location.state.courseName,
          credits: 0,
          department: 'Unknown'
        });
      }
    }
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Peers</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {course?.courseName || 'Course Peers'}
              </h1>
              <p className="text-gray-600 font-roboto">
                {course?.courseCode && `${course.courseCode} • `}
                Students enrolled in this course
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {peers.length} students
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 font-inter">
              Classmates in {course?.courseName || 'This Course'}
            </h2>
            {course?.description && (
              <p className="text-gray-600 text-sm mt-1">{course.description}</p>
            )}
          </div>

          <div className="p-6">
            {peers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No peers found</h3>
                <p className="text-gray-600 mb-4">
                  There are no other students enrolled in this course yet.
                </p>
                <Link
                  to="/courses"
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Browse Other Courses</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peers.map((peer) => (
                  <div key={peer.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
                    <div className="flex items-start space-x-4 mb-4">
                      {peer.avatarUrl ? (
                        <img
                          src={peer.avatarUrl}
                          alt={peer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{peer.name}</h3>
                        <p className="text-gray-600 text-sm flex items-center space-x-1 mt-1">
                          <Mail className="h-3 w-3" />
                          <span>{peer.email}</span>
                        </p>
                        {peer.universityName && (
                          <p className="text-gray-500 text-xs mt-1">{peer.universityName}</p>
                        )}
                      </div>
                    </div>
                    
                    {peer.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{peer.bio}</p>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSendMessage(peer.id, peer.name)}
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

export default CourseSpecificPeers;