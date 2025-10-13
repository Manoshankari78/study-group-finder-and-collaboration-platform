import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, ArrowLeft, Globe, Lock, Loader } from 'lucide-react';
import { groupsAPI, coursesAPI } from '../services/api';

interface GroupCreationProps {
  onLogout: () => void;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

const GroupCreation = ({ onLogout }: GroupCreationProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    course: { id: 0 },
    description: '',
    privacy: 'PUBLIC',
    maxMembers: 10
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course.id) {
      alert('Please select a course');
      return;
    }

    setIsLoading(true);

    try {
      await groupsAPI.createGroup(formData);
      alert('Group created successfully!');
      navigate('/groups');
    } catch (error: any) {
      alert(error.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      course: { id: courseId }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Groups</span>
          </button>
          <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Create Study Group
          </h1>
          <p className="text-gray-600 font-roboto">
            Start a new study group and connect with fellow learners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 font-inter">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    {isCoursesLoading ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Loading courses...</span>
                      </div>
                    ) : (
                      <select
                        id="course"
                        name="course"
                        required
                        value={formData.course.id}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.courseCode} - {course.courseName}
                          </option>
                        ))}
                      </select>
                    )}
                    {courses.length === 0 && !isCoursesLoading && (
                      <p className="text-sm text-orange-600 mt-1">
                        You need to be enrolled in courses to create groups. <a href="/courses" className="text-blue-500 hover:underline">Enroll in courses first</a>.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Describe your study group's goals and approach..."
                    />
                  </div>
                </div>
              </div>

              {/* Group Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 font-inter">Group Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Privacy Setting *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.privacy === 'PUBLIC'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'PUBLIC' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-gray-800 font-medium">Public</p>
                            <p className="text-gray-600 text-xs">Anyone can join</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.privacy === 'PRIVATE'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'PRIVATE' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-gray-800 font-medium">Private</p>
                            <p className="text-gray-600 text-xs">Approval required</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      id="maxMembers"
                      name="maxMembers"
                      min="2"
                      value={formData.maxMembers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/groups')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || courses.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-medium transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview/Tips */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-inter">Tips for Success</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Choose a clear, descriptive name that reflects your group's focus</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Write a detailed description of your study goals and methods</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Set appropriate privacy settings based on your needs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Start with a reasonable member limit and adjust as needed</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-inter">Group Preview</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-medium">
                      {formData.name || 'Your Group Name'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {courses.find(c => c.id === formData.course.id)?.courseCode || 'Selected Course'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {formData.description || 'Your group description will appear here...'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>1/{formData.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {formData.privacy === 'PUBLIC' ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-gray-500 capitalize">{formData.privacy.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreation;