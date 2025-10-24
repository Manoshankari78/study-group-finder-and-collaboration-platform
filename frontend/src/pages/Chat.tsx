// src/pages/Chat.tsx - Complete Implementation
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { 
  Send, Paperclip, Image as ImageIcon, Smile, Search, 
  MoreVertical, Edit2, Trash2, Check, X, Upload, File as FileIcon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  timestamp: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  readBy?: number[];
  edited?: boolean;
  editedAt?: string;
}

interface ChatProps {
  onLogout: () => void;
}

const Chat = ({ onLogout }: ChatProps) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, sendMessage, subscribeToGroup, unsubscribeFromGroup, sendTypingIndicator } = useWebSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (groupId && isConnected) {
      subscribeToGroup(parseInt(groupId), handleNewMessage);
      fetchMessageHistory();

      // Subscribe to typing indicators
      // This would need additional WebSocket subscription

      return () => {
        unsubscribeFromGroup(parseInt(groupId));
      };
    }
  }, [groupId, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });

    // Mark as read if not own message
    if (message.sender.id !== user?.id) {
      markMessageAsRead(message.id);
    }
  };

  const fetchMessageHistory = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chat/groups/${groupId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && groupId) {
      sendMessage(parseInt(groupId), newMessage);
      setNewMessage('');
      handleTyping(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (groupId) {
      sendTypingIndicator(parseInt(groupId), typing);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      handleTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      handleTyping(false);
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('groupId', groupId!);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // Send file message
          sendMessage(parseInt(groupId!), '', 'FILE', response.fileUrl, file.name);
          toast.success('File uploaded successfully');
          setSelectedFile(null);
          setUploadProgress(0);
        } else {
          toast.error('File upload failed');
        }
      });

      xhr.open('POST', 'http://localhost:8080/api/files/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleEditMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chat/messages/${messageId}/edit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editingContent })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(m => 
          m.id === messageId ? data.message : m
        ));
        setEditingMessageId(null);
        setEditingContent('');
        toast.success('Message edited successfully');
      } else {
        toast.error('Failed to edit message');
      }
    } catch (error) {
      console.error('Edit message error:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success('Message deleted successfully');
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Delete message error:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/chat/groups/${groupId}/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.messages || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`http://localhost:8080/api/chat/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender.id === user?.id;
    const isEditing = editingMessageId === message.id;

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
        <div className={`max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {!isOwn && (
            <span className="text-xs text-gray-600 mb-1">{message.sender.name}</span>
          )}
          
          <div className={`relative rounded-xl px-4 py-2 ${
            isOwn 
              ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="bg-white text-gray-800 px-2 py-1 rounded"
                  autoFocus
                />
                <button
                  onClick={() => handleEditMessage(message.id)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditingContent('');
                  }}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                {message.type === 'TEXT' && (
                  <p className="text-sm break-words">{message.content}</p>
                )}
                
                {message.type === 'FILE' && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:underline"
                  >
                    <FileIcon className="h-4 w-4" />
                    <span className="text-sm">{message.fileName}</span>
                  </a>
                )}
                
                {message.type === 'IMAGE' && (
                  <div>
                    <img
                      src={message.fileUrl}
                      alt={message.fileName}
                      className="max-w-sm rounded-lg mb-2"
                    />
                    {message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {formatTimestamp(message.timestamp)}
                    {message.edited && ' (edited)'}
                  </span>
                  
                  {isOwn && message.readBy && message.readBy.length > 0 && (
                    <span className="text-xs opacity-75 ml-2">
                      ✓✓ {message.readBy.length}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Message Actions */}
            {isOwn && !isEditing && (
              <div className="absolute -right-20 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingMessageId(message.id);
                      setEditingContent(message.content);
                    }}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />

      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
          Connecting to chat...
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Group Chat</h2>
              <p className="text-sm text-gray-600">
                {typingUsers.length > 0
                  ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
                  : 'Online'
                }
              </p>
            </div>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="border-b p-3 bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search messages..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {searchResults.map(msg => (
                    <div
                      key={msg.id}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                      onClick={() => {
                        // Scroll to message
                        const element = document.getElementById(`message-${msg.id}`);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span className="font-semibold">{msg.sender.name}:</span> {msg.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} id={`message-${msg.id}`}>
                {renderMessage(msg)}
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="px-4 py-2 bg-blue-50">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Uploading {selectedFile?.name}...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach image"
              >
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                disabled={!isConnected}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Chat;