import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Send, Paperclip, Users, MessageSquare, File, X, Loader, User, Download, Search, LinkIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI, chatAPI } from '../services/api';
import { connectWebSocket, subscribeToGroup, sendMessage, disconnectWebSocket } from '../services/websocket';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { downloadFile } from '../services/api';

interface ChatProps {
  onLogout: () => void;
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

interface Group {
  id: number;
  name: string;
  description: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  currentMembers: number;
  privacy: string;
}

const Chat = ({ onLogout }: ChatProps) => {
  const { groupId } = useParams();
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCaption, setFileCaption] = useState(' ');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchUserGroups();
    if (groupId) {
      fetchGroupData(parseInt(groupId));
      fetchMessages(parseInt(groupId));
    }
  }, [groupId]);

  useEffect(() => {
    connectWebSocket(
      () => {
        setIsWebSocketConnected(true);
        // console.log('WebSocket connected');
        // subscribe to current group when connection is established
        if (groupId) {
          subscribeToGroup(parseInt(groupId), handleIncomingMessage);
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        // toast.error('Connection error');
        setIsWebSocketConnected(false);
      }
    );

    return () => {
      // disconnect when unmounts
      disconnectWebSocket();
      setIsWebSocketConnected(false);
    };
  }, []);

  // handle group changes
  useEffect(() => {
    if (isWebSocketConnected && groupId) {
      const groupIdNum = parseInt(groupId);

      // fetch messages for the new group
      fetchMessages(groupIdNum);

      // subscribe to the new group
      const subscribed = subscribeToGroup(groupIdNum, handleIncomingMessage);

      if (!subscribed) {
        toast.error('Failed to subscribe to group messages');
      }
    }
  }, [groupId, isWebSocketConnected]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !groupId || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        senderId: currentUser.id,
        content: message.trim(),
        type: 'TEXT' as const
      };

      const sent = sendMessage(parseInt(groupId), messageData);
      if (!sent) {
        toast.error('Failed to send message - not connected');
        return;
      }

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const fetchGroupData = async (groupId: number) => {
    try {
      const response = await groupsAPI.getGroup(groupId);
      setActiveGroup(response.group);
    } catch (error) {
      console.error('Failed to fetch group data:', error);
      toast.error('Failed to load group data');
    }
  };

  const fetchMessages = async (groupId: number) => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getMessages(groupId);
      setMessages(response.messages.reverse() || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncomingMessage = (newMessage: ChatMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowFileUpload(true);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !groupId) return;

    try {
      setIsSending(true);
      const uploadResponse = await chatAPI.uploadFile(parseInt(groupId), selectedFile, fileCaption);

      const getMessageTypeFromFile = (fileType: string): string => {
        if (fileType.startsWith('image/')) return 'IMAGE';
        if (fileType === 'application/pdf') return 'PDF';
        if (fileType.includes('word') || fileType.includes('document')) return 'DOCUMENT';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'EXCEL';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'POWERPOINT';
        return 'TEXT';
      };

      const messageData = {
        senderId: currentUser?.id,
        content: fileCaption || ' ',
        type: getMessageTypeFromFile(uploadResponse.fileType),
        fileUrl: uploadResponse.fileUrl,
        fileName: uploadResponse.fileName,
        fileType: uploadResponse.fileType,
        fileSize: uploadResponse.fileSize
      };

      sendMessage(parseInt(groupId), messageData);

      setShowFileUpload(false);
      setSelectedFile(null);
      setFileCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsSending(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeWithDate = (timestamp: string) => {
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

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    group.course.courseCode.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  if (!groupId && groups.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 font-inter">Study Groups</h2>
            </div>
            <div className="overflow-y-auto">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/chat/${group.id}`}
                  className="block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{group.name}</p>
                      <p className="text-gray-600 text-sm">{group.course.courseCode}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a group to start chatting</h3>
              <p className="text-gray-600">Choose a study group from the sidebar to view messages</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 lg:block hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 font-inter">Study Groups</h2>
            {/* Search Bar */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/chat/${group.id}`}
                className={`block p-4 border-b border-gray-200 transition-colors ${group.id === activeGroup?.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">{group.name}</p>
                    <p className="text-gray-600 text-sm truncate">{group.course.courseCode}</p>
                    <p className="text-gray-500 text-xs">{group.currentMembers} members</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div id="mobile-sidebar" className="lg:hidden fixed inset-0 z-30 bg-white transform transition-transform duration-300 hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Study Groups</h2>
              <button
                onClick={() => document.getElementById('mobile-sidebar')?.classList.add('hidden')}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/chat/${group.id}`}
                onClick={() => document.getElementById('mobile-sidebar')?.classList.add('hidden')}
                className={`block p-4 border-b border-gray-200 ${group.id === activeGroup?.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">{group.name}</p>
                    <p className="text-gray-600 text-sm truncate">{group.course.courseCode}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white lg:ml-0 ml-0">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => document.getElementById('mobile-sidebar')?.classList.toggle('hidden')}
                  className="lg:hidden block text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link to={`/groups/${activeGroup?.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-800">{activeGroup?.name}</h1>
                      <p className="text-sm text-gray-600">{activeGroup?.course.courseCode}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
                <p className="text-gray-600">Start the conversation by sending a message!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender.id === currentUser?.id ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className="flex-shrink-0">
                    {msg.sender.avatarUrl ? (
                      <img
                        src={msg.sender.avatarUrl}
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`max-w-xs lg:max-w-md ${msg.sender.id === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender name - only show for others' messages */}
                    {msg.sender.id !== currentUser?.id && (
                      <span className="text-sm font-medium text-gray-700 mb-1">{msg.sender.name}</span>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-xl px-3 py-2 w-full ${msg.sender.id === currentUser?.id
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
                        <div className="flex items-center space-x-3">
                          <File className="h-4 w-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{msg.fileName || msg.content}</p>
                            {msg.fileSize && (
                              <p className="text-xs opacity-80">
                                {formatFileSize(msg.fileSize)}
                              </p>
                            )}
                            {msg.content !== ' ' && (
                              <p className={`text-sm mt-1 p-2 rounded-lg ${msg.sender.id === currentUser?.id ? 'bg-white/20' : 'bg-white/50'
                                }`}>
                                {msg.content}
                              </p>
                            )}
                          </div>
                          {msg.fileUrl && (
                            <button
                              onClick={() => handleFileDownload(msg.fileUrl!, msg.fileName || `file_${msg.id}`)}
                              disabled={isSending}
                              className={`p-1 rounded-lg transition-colors ${msg.sender.id === currentUser?.id
                                  ? 'bg-white/20 hover:bg-white/30'
                                  : 'bg-white/50 hover:bg-white/60'
                                } disabled:opacity-50`}
                              title="Download file"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm break-words">{msg.content}</p>
                      )}
                    </div>

                    {/* Time stamp below message */}
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTimeWithDate(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 flex-shrink-0"
                disabled={isSending}
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />

              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSending}
                />
              </div>

              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className={`p-3 rounded-xl transition-colors transform hover:scale-105 flex-shrink-0 ${message.trim() && !isSending
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 font-inter">Share File</h2>
              <button
                onClick={() => {
                  setShowFileUpload(false);
                  setSelectedFile(null);
                  setFileCaption('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{selectedFile?.name}</p>
                    <p className="text-gray-600 text-sm">
                      {selectedFile && formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a caption (optional)
                </label>
                <input
                  type="text"
                  value={fileCaption}
                  onChange={(e) => setFileCaption(e.target.value)}
                  placeholder="Describe this file..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => {
                  setShowFileUpload(false);
                  setSelectedFile(null);
                  setFileCaption('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isSending}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${selectedFile && !isSending
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSending ? (
                  <Loader className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Share File'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Chat;
