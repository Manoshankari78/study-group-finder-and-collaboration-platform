import { useState } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Plus, Minus, Search } from 'lucide-react';

interface CourseManagementProps {
  onLogout: () => void;
}

const CourseManagement = ({ onLogout }: CourseManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([1, 3, 5]);

  const availableCourses = [
    { id: 1, code: 'CS 101', name: 'Introduction to Computer Science', credits: 3, department: 'Computer Science' },
    { id: 2, code: 'MATH 201', name: 'Calculus I', credits: 4, department: 'Mathematics' },
    { id: 3, code: 'PHYS 101', name: 'General Physics I', credits: 4, department: 'Physics' },
    { id: 4, code: 'CHEM 101', name: 'General Chemistry', credits: 3, department: 'Chemistry' },
    { id: 5, code: 'ENG 102', name: 'English Composition', credits: 3, department: 'English' },
    { id: 6, code: 'CS 201', name: 'Data Structures', credits: 3, department: 'Computer Science' },
    { id: 7, code: 'MATH 202', name: 'Calculus II', credits: 4, department: 'Mathematics' },
    { id: 8, code: 'PHYS 102', name: 'General Physics II', credits: 4, department: 'Physics' },
  ];

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCourse = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const mySelectedCourses = availableCourses.filter(course => selectedCourses.includes(course.id));

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
            <p className="text-gray-600 text-sm">Currently enrolled: {selectedCourses.length} courses</p>
          </div>
          <div className="p-6">
            {mySelectedCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses selected yet. Browse available courses below.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySelectedCourses.map((course) => (
                  <div key={course.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.code}</h3>
                        <p className="text-gray-600 text-sm">{course.name}</p>
                      </div>
                      <button
                        onClick={() => toggleCourse(course.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                      >
                        <Minus className="h-4 w-4" />
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const isSelected = selectedCourses.includes(course.id);
                return (
                  <div
                    key={course.id}
                    className={`rounded-xl p-4 border transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.code}</h3>
                        <p className="text-gray-600 text-sm">{course.name}</p>
                      </div>
                      <button
                        onClick={() => toggleCourse(course.id)}
                        className={`p-1 rounded transition-colors ${
                          isSelected
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                        }`}
                      >
                        {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
                <p className="text-gray-600">No courses found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;