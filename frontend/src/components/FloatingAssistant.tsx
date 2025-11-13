import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, X, Users, ArrowLeft, Send, Loader, User, Calendar, Clock, MapPin, Paperclip, File, Download, LinkIcon } from 'lucide-react';
import { groupsAPI, chatAPI, eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { connectWebSocket, subscribeToGroup, sendMessage, disconnectWebSocket } from '../services/websocket';
import toast from 'react-hot-toast';
import { downloadFile } from '../services/api';

interface Group {
    id: number;
    name: string;
    course: {
        courseCode: string;
        courseName: string;
    };
    currentMembers: number;
}

interface ChatMessage {
    id: number;
    group: {
        id: number;
        name: string;
    };
    sender: {
        id: number;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    content: string;
    type: 'TEXT' | 'IMAGE' | 'PDF' | 'DOCUMENT' | 'EXCEL' | 'POWERPOINT' | 'LINK';
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    timestamp: string;
}

interface Event {
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

const FloatingAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'calendar'>('chat');
    const [groups, setGroups] = useState<Group[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const location = useLocation();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
     const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Pages where the assistant should be hidden
    const hiddenPages = [
        '/login',
        '/register',
        '/reset-password',
        '/chat'
    ];

    const shouldHide = hiddenPages.some(page => location.pathname.startsWith(page));

    useEffect(() => {
        if (isOpen && user) {
            if (activeTab === 'chat') {
                fetchUserGroups();
            } else {
                fetchUpcomingEvents();
            }
        }
    }, [isOpen, user, activeTab]);

    useEffect(() => {
        if (isOpen && activeTab === 'chat' && activeGroup) {
            connectWebSocket(
                () => {
                    setIsWebSocketConnected(true);
                    subscribeToGroup(activeGroup.id, handleIncomingMessage);
                    fetchMessages(activeGroup.id);
                },
                (error) => {
                    console.error('WebSocket error:', error);
                    toast.error('Connection error');
                    setIsWebSocketConnected(false);
                }
            );
        }

        return () => {
            if (activeGroup) {
                disconnectWebSocket();
            }
        };
    }, [isOpen, activeTab, activeGroup]);

    const fetchUserGroups = async () => {
        try {
            setIsLoading(true);
            const response = await groupsAPI.getMyGroups();
            setGroups(response.groups || []);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUpcomingEvents = async () => {
        try {
            setIsLoading(true);
            const response = await eventsAPI.getMyEvents();
            const upcoming = (response.events || [])
                .filter((event: Event) => new Date(event.startTime) >= new Date())
                .sort((a: Event, b: Event) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 5);
            setEvents(upcoming);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (groupId: number) => {
        try {
            const response = await chatAPI.getMessages(groupId);
            setMessages(response.messages.reverse() || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleIncomingMessage = (newMessage: ChatMessage) => {
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeGroup || !user || isSending) return;

        setIsSending(true);
        try {
            const messageData = {
                senderId: user.id,
                content: messageInput.trim(),
                type: 'TEXT' as const
            };

            const sent = sendMessage(activeGroup.id, messageData);
            if (!sent) {
                toast.error('Failed to send message - not connected');
                return;
            }

            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleGroupClick = (group: Group) => {
        setActiveGroup(group);
        setMessages([]);
    };

    const handleBackToGroups = () => {
        setActiveGroup(null);
        setMessages([]);
        disconnectWebSocket();
    };

    const toggleAssistant = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setActiveGroup(null);
            setMessages([]);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const handleFileDownload = async (fileUrl: string, fileName: string) => {
        try {
            setIsSending(true);
            await downloadFile(fileUrl, fileName);
            toast.success('File downloaded successfully');
        } catch (error) {
            console.error('Failed to download file:', error);
            toast.error('Failed to download file');
        } finally {
            setIsSending(false);
        }
    };

    const formatEventTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatEventDate = (dateTime: string) => {
        return new Date(dateTime).toLocaleDateString();
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
        group.course.courseCode.toLowerCase().includes(groupSearchTerm.toLowerCase())
    );

    const renderChatTab = () => {
        if (activeGroup) {
            // Chat View
            return (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.sender.id === user?.id ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        {msg.sender.id !== user?.id && (
                                            <span className="text-xs font-extrabold text-gray-700">{msg.sender.name}</span>
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-xs rounded-xl px-3 py-2 ${msg.sender.id === user?.id
                                            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {msg.type === 'LINK' ? (
                                            <a
                                                href={msg.content}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-inherit hover:underline"
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                                <span className="text-sm">{msg.fileName || msg.content}</span>
                                            </a>
                                        ) : msg.type !== 'TEXT' ? (
                                            <div className="flex items-center space-x-2">
                                                <File className="h-4 w-4" />
                                                <span className="text-sm">{msg.fileName || msg.content}</span>
                                                {msg.fileUrl && (
                                                    <button
                                                        onClick={() => handleFileDownload(msg.fileUrl!, msg.fileName || `file_${msg.id}`)}
                                                        disabled={isSending}
                                                        className="hover:opacity-70 disabled:opacity-50"
                                                        title="Download file"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm">{msg.content}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={!messageInput.trim() || isSending}
                                className={`p-2 rounded-lg transition-colors ${messageInput.trim() && !isSending
                                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSending ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </form>
                    </div>
                </>
            );
        } else {
            // Groups List View
            return (
                <>
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={groupSearchTerm}
                            onChange={(e) => setGroupSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Groups List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="text-center p-6 text-gray-500">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p>No groups found</p>
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => handleGroupClick(group)}
                                    className="w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                                            <Users className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {group.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {group.course.courseCode} • {group.currentMembers} members
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                        <Link
                            to="/groups"
                            onClick={() => setIsOpen(false)}
                            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                        >
                            Find More Groups
                        </Link>
                    </div>
                </>
            );
        }
    };

    const renderCalendarTab = () => (
        <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Upcoming Sessions</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No upcoming sessions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <h4 className="font-medium text-gray-800 text-sm mb-1">{event.title}</h4>
                <p className="text-gray-600 text-xs mb-2">{event.group.name}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatEventDate(event.startTime)} at {formatEventTime(event.startTime)}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

            <div className="p-3 rounded-b-2xl bg-gray-50 border-t border-gray-200">
                <Link
                    to="/calendar"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                    Open Full Calendar
                </Link>
            </div>
        </div>
    );

    if (shouldHide || !user) {
        return null;
    }

    return (
        <>
            {/* Main Assistant Bubble */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
                {/* Calendar Bubble */}
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setActiveTab('calendar');
                    }}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                >
                    <Calendar className="h-6 w-6" />
                </button>

                {/* Chat Bubble */}
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setActiveTab('chat');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            </div>

            {/* Expanded Panel */}
            {isOpen && (
                <div className="fixed bottom-32 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
                    {/* Header with Tabs */}
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-t-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                                {activeTab === 'chat' ? (
                                    activeGroup ? (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handleBackToGroups}
                                                className="text-white hover:text-gray-200 transition-colors"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </button>
                                            <Link
                                                to={`/chat/${activeGroup.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="hover:underline truncate"
                                            >
                                                {activeGroup.name}
                                            </Link>
                                        </div>
                                    ) : (
                                        'Group Chats'
                                    )
                                ) : (
                                    'Upcoming Sessions'
                                )}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-white/20 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-1 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-white text-blue-600' : 'text-white'
                                    }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('calendar')}
                                className={`flex-1 py-1 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-white text-blue-600' : 'text-white'
                                    }`}
                            >
                                Calendar
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'chat' ? renderChatTab() : renderCalendarTab()}
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
        {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
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
                <p className="text-gray-700">{selectedEvent.description}</p>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatEventDate(selectedEvent.startTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatEventTime(selectedEvent.startTime)} -{' '}
                      {formatEventTime(selectedEvent.endTime)}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-800">{selectedEvent.location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </>
    );
}



export default FloatingAssistant;