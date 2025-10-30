import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Plus, Minus, Search, Loader } from 'lucide-react';
import { coursesAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface CourseManagementProps {
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

const CourseManagement = ({ onLogout }: CourseManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<number | null>(null);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchCourses = async (search?: string) => {
    try {
      const response = await coursesAPI.getCourses(search);
      setAvailableCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert('Failed to load courses');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setEnrolledCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchCourses(value);
  };

  const enrollInCourse = async (courseId: number) => {
    setIsEnrolling(courseId);
    try {
      
      await coursesAPI.enrollInCourse(courseId);
      await fetchCourses(searchTerm);
      await fetchEnrolledCourses();
      toast.success("Enrolled Successfully!");
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(null);
    }
  };

  const unenrollFromCourse = async (courseId: number) => {
    setIsEnrolling(courseId);
    try {
      await coursesAPI.unenrollFromCourse(courseId);
      toast.success("Unenrolled Successfully!");
      await fetchCourses(searchTerm);
      await fetchEnrolledCourses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unenroll from course');
    } finally {
      setIsEnrolling(null);
    }
  };

  const isCourseEnrolled = (courseId: number) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  const filteredCourses = availableCourses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Course Management
          </h1>
          <p className="text-gray-600 font-roboto">
            Manage your enrolled courses and discover new subjects to study.
          </p>
        </div>

        {/* My Courses Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 font-inter">My Courses</h2>
            <p className="text-gray-600 text-sm">Currently enrolled: {enrolledCourses.length} courses</p>
          </div>
          <div className="p-6">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses enrolled yet. Browse available courses below.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                        <p className="text-gray-600 text-sm">{course.courseName}</p>
                      </div>
                      <button
                        onClick={() => unenrollFromCourse(course.id)}
                        disabled={isEnrolling === course.id}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors disabled:opacity-50"
                      >
                        {isEnrolling === course.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{course.department}</span>
                      <span>{course.credits} credits</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Courses Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 font-inter">Available Courses</h2>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses by name, code, or department..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const isEnrolled = isCourseEnrolled(course.id);
                const isProcessing = isEnrolling === course.id;
                
                return (
                  <div
                    key={course.id}
                    className={`rounded-xl p-4 border transition-all duration-200 ${
                      isEnrolled
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                        <p className="text-gray-600 text-sm">{course.courseName}</p>
                        {course.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => isEnrolled ? unenrollFromCourse(course.id) : enrollInCourse(course.id)}
                        disabled={isProcessing}
                        className={`p-1 rounded transition-colors disabled:opacity-50 ${
                          isEnrolled
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                        }`}
                      >
                        {isProcessing ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : isEnrolled ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{course.department}</span>
                      <span>{course.credits} credits</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster/>
    </div>
  );
};

export default CourseManagement;