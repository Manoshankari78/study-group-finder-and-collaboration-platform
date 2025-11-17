import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight, X, Loader } from 'lucide-react';
import { eventsAPI } from '../services/api';
import { Calendar, momentLocalizer, View, Event as RBCEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarProps {
  onLogout: () => void;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  group: {
    id: number;
    name: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
}


interface CalendarEvent extends RBCEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: EventData;
}

const localizer = momentLocalizer(moment);

const CalendarPage = ({ onLogout }: CalendarProps) => {
  const [currentView, setCurrentView] = useState<View>('month');
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAndRenderLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline hover:underline transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatEventsForCalendar = (): CalendarEvent[] => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event
    }));
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const now = new Date();
    const isPast = event.end < now;

    return {
      style: {
        backgroundColor: isPast ? '#6B7280' : '#2563EB',
        borderColor: isPast ? '#4B5563' : '#1D4ED8',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'white',
        cursor: 'pointer'
      }
    };
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[]; action: 'select' | 'click' | 'doubleClick' }) => {
    const dayStart = moment(slotInfo.start).startOf('day').toDate();
    const dayEnd = moment(slotInfo.start).endOf('day').toDate();

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });

    setSelectedDate(slotInfo.start);
    setSelectedEvents(dayEvents);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  };

  const handleNavigate = (newDate: Date) => {
    // navigation is handled by the calendar component
  };

  const handleView = (newView: View) => {
    setCurrentView(newView);
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const upcomingEvents = events
    .filter(event => new Date(event.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Calendar & Events
            </h1>
            <p className="text-gray-600 font-roboto">
              Manage your study sessions and group events.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
              <div className="p-6">
                <Calendar
                  localizer={localizer}
                  events={formatEventsForCalendar()}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  onNavigate={handleNavigate}
                  onView={handleView}
                  view={currentView}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  popup
                  messages={{
                    next: "Next",
                    previous: "Prev",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Time",
                    event: "Event",
                    noEventsInRange: "No events in this range"
                  }}
                />
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
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-blue-600 flex-shrink-0">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                        <p className="text-gray-600 text-xs mb-2">{event.group.name}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Day Events Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 font-inter">
                  Events on {selectedDate.toLocaleDateString()}
                </h2>
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedEvents([]);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-6">
                {selectedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvents.map((event) => {
                      const isPast = new Date(event.endTime) < new Date();

                      return (
                        <div
                          key={event.id}
                          className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isPast
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-blue-50 border-blue-200'
                            }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-semibold ${isPast ? 'text-gray-700' : 'text-blue-700'
                              }`}>
                              {event.title}
                            </h3>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${isPast
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-blue-200 text-blue-700'
                              }`}>
                              {event.group.name}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className={`h-4 w-4 ${isPast ? 'text-gray-500' : 'text-blue-500'
                                }`} />
                              <span className={isPast ? 'text-gray-600' : 'text-blue-600'}>
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className={`h-4 w-4 ${isPast ? 'text-gray-500' : 'text-blue-500'
                                  }`} />
                                <span className={isPast ? 'text-gray-600' : 'text-blue-600'}>
                                  {detectAndRenderLinks(event.location)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Users className={`h-4 w-4 ${isPast ? 'text-gray-500' : 'text-blue-500'
                                }`} />
                              <span className={isPast ? 'text-gray-600' : 'text-blue-600'}>
                                Created by {event.createdBy.name}
                              </span>
                            </div>

                            {event.description && (
                              <p className={`text-sm mt-2 ${isPast ? 'text-gray-600' : 'text-blue-600'
                                }`}>
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium mb-1">No events on this day</p>
                    <p className="text-sm">Click on the calendar to create a new event</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 font-inter">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{selectedEvent.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{selectedEvent.group.name}</p>
                </div>

                {selectedEvent.description && (
                  <div>
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-800">
                        {formatDate(selectedEvent.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-800">
                        {detectAndRenderLinks(selectedEvent.location)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-800">Created by {selectedEvent.createdBy.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;