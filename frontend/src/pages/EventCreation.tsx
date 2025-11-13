import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, ArrowLeft, Loader } from 'lucide-react';
import { eventsAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface EventCreationProps {
  onLogout: () => void;
}

const EventCreation = ({ onLogout }: EventCreationProps) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // function to format date as YYYY-MM-DDTHH:mm for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // current date and time for minimum attributes, using local time
  const now = new Date();
  const currentDateTime = formatDateForInput(now);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    group: { id: parseInt(groupId!) }
  });

  // get end of the same day as start time, using local time
  const getMaxEndTime = () => {
    if (!formData.startTime) {
      // If no start time selected, default to end of today
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 0, 0);
      return formatDateForInput(endOfToday);
    }

    // get the same date as start time with time to 23:59
    const startDate = new Date(formData.startTime);
    const maxEndDate = new Date(startDate);
    maxEndDate.setHours(23, 59, 0, 0);
    return formatDateForInput(maxEndDate);
  };

  // get min end time, start time or current time
  const getMinEndTime = () => {
    if (formData.startTime) {
      return formData.startTime;
    }
    return currentDateTime;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startTime) < now) {
      toast.error('Start time cannot be in the past');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error('End time must be after start time');
      return;
    }

    // check if end time is on the same day as start time
    const startDate = new Date(formData.startTime).toDateString();
    const endDate = new Date(formData.endTime).toDateString();
    if (startDate !== endDate) {
      toast.error('End time must be on the same day as start time');
      return;
    }

    setIsLoading(true);

    try {
      await eventsAPI.createEvent(formData);
      toast('Event Created!', {
        icon: '🗓️',
      });
      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // update end time min when start time changes and clear end time if it becomes invalid
    if (name === 'startTime' && value) {
      setFormData(prev => {
        const newStartTime = value;
        let newEndTime = prev.endTime;
        
        // If end time exists and is before new start time or on a different day, clear it
        if (prev.endTime) {
          const startDate = new Date(newStartTime).toDateString();
          const endDate = new Date(prev.endTime).toDateString();
          if (new Date(prev.endTime) <= new Date(newStartTime) || startDate !== endDate) {
            newEndTime = '';
          }
        }
        
        return {
          ...prev,
          startTime: newStartTime,
          endTime: newEndTime
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Group</span>
          </button>
          <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Create Study Session
          </h1>
          <p className="text-gray-600 font-roboto">
            Schedule a new study session for your group.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Session Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter session title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Describe what you'll be studying..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                required
                min={currentDateTime}
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                required
                min={getMinEndTime()}
                max={getMaxEndTime()}
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be on the same day as start time
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Library Room 201, Zoom, etc."
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-medium transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default EventCreation;