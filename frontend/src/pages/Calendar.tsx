import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onLogout: () => void;
}

const Calendar = ({ onLogout }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    group: ''
  });

  const events = [
    {
      id: 1,
      title: 'CS 101 Study Session',
      group: 'CS 101 Study Warriors',
      date: '2024-02-15',
      time: '7:00 PM',
      location: 'Library Room 201',
      color: 'bg-blue-600'
    },
    {
      id: 2,
      title: 'Calculus Problem Review',
      group: 'Calculus Masters',
      date: '2024-02-16',
      time: '6:30 PM',
      location: 'Math Building 305',
      color: 'bg-green-600'
    },
    {
      id: 3,
      title: 'Physics Lab Prep',
      group: 'Physics Lab Partners',
      date: '2024-02-18',
      time: '3:00 PM',
      location: 'Physics Lab 1',
      color: 'bg-purple-600'
    },
    {
      id: 4,
      title: 'Algorithm Study Group',
      group: 'Data Structures Deep Dive',
      date: '2024-02-20',
      time: '8:00 PM',
      location: 'Online (Zoom)',
      color: 'bg-orange-600'
    }
  ];

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const notifications = [
    {
      id: 1,
      title: 'CS 101 Study Session',
      time: 'Starting in 30 minutes',
      type: 'reminder',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Assignment Due Tomorrow',
      time: 'Physics Lab Report',
      type: 'deadline',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'New Group Invitation',
      time: 'Chemistry Study Circle',
      type: 'invitation',
      priority: 'low'
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Event created successfully!');
    setShowEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      group: ''
    });
  };

  const handleNotificationClick = (notificationId: number) => {
    alert(`Notification ${notificationId} clicked!`);
  };

  const getEventsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const groups = ['CS 101 Study Warriors', 'Calculus Masters', 'Physics Lab Partners', 'Data Structures Deep Dive'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Calendar & Events
            </h1>
            <p className="text-gray-600 font-roboto">
              Manage your study sessions and group events.
            </p>
          </div>
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              {/* Calendar Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 font-inter">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-2 text-gray-600 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the month starts */}
                  {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDate(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    
                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 border border-gray-200 rounded-xl hover:border-blue-500 transition-colors cursor-pointer ${
                          isToday ? 'bg-blue-50 border-blue-500' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`${event.color} text-white text-xs px-1 py-0.5 rounded truncate`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Upcoming Events</h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${event.color} flex-shrink-0`}>
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                        <p className="text-gray-600 text-xs mb-2">{event.group}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 font-inter">Notifications</h2>
              </div>
              <div className="p-6 space-y-4">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="w-full flex items-start space-x-3 text-left hover:bg-gray-50 p-2 rounded-xl transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      notification.priority === 'high' ? 'bg-red-500' :
                      notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm">{notification.title}</h3>
                      <p className="text-gray-600 text-xs">{notification.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event Creation Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-inter">Create New Event</h2>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group
                  </label>
                  <select
                    value={newEvent.group}
                    onChange={(e) => setNewEvent({...newEvent, group: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select group</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-2 px-4 rounded-xl font-medium transition-colors transform hover:scale-105 shadow-lg"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;