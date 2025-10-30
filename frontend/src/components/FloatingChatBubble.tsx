// FloatingChatBubble.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, X, Users, ArrowLeft, Send, Loader, User, Paperclip, File, Download, LinkIcon } from 'lucide-react';
import { groupsAPI, chatAPI } from '../services/api';
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

const FloatingChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // pages where the chat bubble should be hidden
  const hiddenPages = [
    '/login',
    '/register',
    '/reset-password',
    '/chat'
  ];

  const shouldHide = hiddenPages.some(page => location.pathname.startsWith(page));

  useEffect(() => {
    if (isOpen && user) {
      fetchUserGroups();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && activeGroup) {
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
  }, [isOpen, activeGroup]);

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

  const toggleChatBubble = () => {
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

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    group.course.courseCode.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  if (shouldHide || !user) {
    return null;
  }

  return (
    <>
      {/* Main Chat Bubble */}
      <button
        onClick={toggleChatBubble}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Expanded Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              {activeGroup ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBackToGroups}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Link
                    to={`/chat/${activeGroup.id}`}
                  >
                    <h3 className="font-semibold text-lg truncate">{activeGroup.name}</h3>
                  </Link>
                </div>
              ) : (
                <h3 className="font-semibold text-lg">Your Groups</h3>
              )}
              <button
                onClick={toggleChatBubble}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeGroup ? (
              // Chat View
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
            ) : (
              // Groups List View
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
                <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-2xl">
                  <Link
                    to="/groups"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                  >
                    Find More Groups
                  </Link>
                </div>
              </>
            )}
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
    </>
  );
};

export default FloatingChatBubble;