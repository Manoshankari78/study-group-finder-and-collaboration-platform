import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, ArrowLeft, Globe, Lock } from 'lucide-react';

interface GroupCreationProps {
  onLogout: () => void;
}

const GroupCreation = ({ onLogout }: GroupCreationProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    description: '',
    privacy: 'public',
    maxMembers: 10,
    tags: '',
    meetingTime: '',
    meetingLocation: ''
  });

  const courses = [
    'CS 101 - Introduction to Computer Science',
    'MATH 201 - Calculus I',
    'PHYS 101 - General Physics I',
    'CHEM 101 - General Chemistry',
    'ENG 102 - English Composition',
    'CS 201 - Data Structures'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate group creation
    console.log('Creating group:', formData);
    navigate('/groups');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Groups</span>
          </button>
          <h1 className="text-3xl font-bold font-inter text-white mb-2">
            Create Study Group
          </h1>
          <p className="text-gray-400 font-roboto">
            Start a new study group and connect with fellow learners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 font-inter">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-300 mb-2">
                      Course *
                    </label>
                    <select
                      id="course"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Describe your study group's goals and approach..."
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Beginner Friendly, Exam Prep, Weekly Meetings"
                    />
                    <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                  </div>
                </div>
              </div>

              {/* Group Settings */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 font-inter">Group Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Privacy Setting *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.privacy === 'public'
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'public' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Public</p>
                            <p className="text-gray-400 text-xs">Anyone can join</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.privacy === 'private'
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'private' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-orange-400" />
                          <div>
                            <p className="text-white font-medium">Private</p>
                            <p className="text-gray-400 text-xs">Approval required</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      id="maxMembers"
                      name="maxMembers"
                      min="2"
                      max="50"
                      value={formData.maxMembers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Details */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 font-inter">Optional Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-300 mb-2">
                      Regular Meeting Time
                    </label>
                    <input
                      type="text"
                      id="meetingTime"
                      name="meetingTime"
                      value={formData.meetingTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Tuesdays 7:00 PM"
                    />
                  </div>

                  <div>
                    <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-300 mb-2">
                      Meeting Location
                    </label>
                    <input
                      type="text"
                      id="meetingLocation"
                      name="meetingLocation"
                      value={formData.meetingLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Library Room 201 or Online"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/groups')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors transform hover:scale-105"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>

          {/* Preview/Tips */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-inter">Tips for Success</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Choose a clear, descriptive name that reflects your group's focus</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Write a detailed description of your study goals and methods</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Set appropriate privacy settings based on your needs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <span>Include regular meeting times to attract committed members</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-inter">Group Preview</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {formData.name || 'Your Group Name'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {formData.course || 'Selected Course'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  {formData.description || 'Your group description will appear here...'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>1/{formData.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {formData.privacy === 'public' ? (
                      <Globe className="h-4 w-4 text-green-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-400" />
                    )}
                    <span className="text-gray-400 capitalize">{formData.privacy}</span>
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