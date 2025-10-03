import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Send, Smile, Paperclip, Users, Hash, MessageSquare } from 'lucide-react';

interface ChatProps {
  onLogout: () => void;
}

const Chat = ({ onLogout }: ChatProps) => {
  const { groupId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Sarah Johnson',
      message: 'Hey everyone! Did anyone finish the problem set for Chapter 3?',
      time: '2:30 PM',
      avatar: 'bg-pink-600'
    },
    {
      id: 2,
      user: 'Mike Chen',
      message: 'I did! Question 7 was pretty tricky though. Want to go over it together?',
      time: '2:32 PM',
      avatar: 'bg-blue-600'
    },
    {
      id: 3,
      user: 'Emily Davis',
      message: 'That would be great! I\'m still stuck on the recursion part.',
      time: '2:35 PM',
      avatar: 'bg-green-600'
    },
    {
      id: 4,
      user: 'You',
      message: 'Count me in! Should we schedule a video call for tonight?',
      time: '2:38 PM',
      avatar: 'bg-purple-600',
      isOwn: true
    },
    {
      id: 5,
      user: 'Alex Rodriguez',
      message: 'Perfect timing! I was just about to ask the same question.',
      time: '2:40 PM',
      avatar: 'bg-yellow-600'
    },
    {
      id: 6,
      user: 'Sarah Johnson',
      message: 'Let\'s do 7 PM. I\'ll send the Zoom link in a few minutes.',
      time: '2:42 PM',
      avatar: 'bg-pink-600'
    }
  ]);

  const groups = [
    { id: '1', name: 'CS 101 Study Warriors', unread: 3, active: groupId === '1' },
    { id: '2', name: 'Calculus Masters', unread: 0, active: groupId === '2' },
    { id: '3', name: 'Physics Lab Partners', unread: 5, active: groupId === '3' },
    { id: '4', name: 'Data Structures Deep Dive', unread: 1, active: groupId === '4' }
  ];

  const activeGroup = groups.find(g => g.id === groupId) || groups[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: 'You',
        message: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'bg-purple-600',
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const onlineMembers = [
    { name: 'Sarah Johnson', avatar: 'bg-pink-600' },
    { name: 'Mike Chen', avatar: 'bg-blue-600' },
    { name: 'Emily Davis', avatar: 'bg-green-600' },
    { name: 'Alex Rodriguez', avatar: 'bg-yellow-600' }
  ];

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
              <div
                key={group.id}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  group.active ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{group.name}</p>
                    <p className="text-gray-600 text-sm">
                      {group.unread > 0 ? `${group.unread} new messages` : 'No new messages'}
                    </p>
                  </div>
                  {group.unread > 0 && (
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {group.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">{activeGroup.name}</h1>
                  <p className="text-sm text-gray-600">{onlineMembers.length} members online</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {onlineMembers.slice(0, 4).map((member, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full ${member.avatar} flex items-center justify-center relative`}
                    title={member.name}
                  >
                    <Users className="h-4 w-4 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                ))}
                {onlineMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-medium">
                    +{onlineMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full ${msg.avatar} flex items-center justify-center flex-shrink-0`}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className={`max-w-md ${msg.isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <div
                    className={`rounded-xl px-4 py-2 ${
                      msg.isOwn
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message ${activeGroup.name}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-3 rounded-xl transition-colors transform hover:scale-105 ${
                  message.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Members */}
        <div className="w-64 bg-white/80 backdrop-blur-sm border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 font-inter">Online Members</h2>
          </div>
          
          <div className="p-4 space-y-3">
            {onlineMembers.map((member, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full ${member.avatar} flex items-center justify-center`}>
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{member.name}</p>
                  <p className="text-gray-600 text-xs">Online</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;