import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FileText, Image, File, Download, ArrowLeft, Users, Calendar, Loader, User, Menu, X, Search } from 'lucide-react';
import { groupsAPI, chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { downloadFile } from '../services/api';

interface GroupFilesProps {
  onLogout: () => void;
}

interface Group {
  id: number;
  name: string;
  description: string;
  course: {
    courseCode: string;
    courseName: string;
  };
}

interface FileMessage {
  id: number;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  type: 'IMAGE' | 'PDF' | 'DOCUMENT' | 'EXCEL' | 'POWERPOINT' | 'TEXT' | 'LINK';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  timestamp: string;
}

const GroupFiles = ({ onLogout }: GroupFilesProps) => {
  const { groupId } = useParams();
  const { user: currentUser } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [files, setFiles] = useState<FileMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'PDF' | 'DOCUMENT'>('ALL');
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      fetchGroupFiles();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await groupsAPI.getGroup(parseInt(groupId!));
      setGroup(response.group);
    } catch (error) {
      console.error('Failed to fetch group data:', error);
      toast.error('Failed to load group data');
    }
  };

  const fetchGroupFiles = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getMessages(parseInt(groupId!), 0, 1000);
      const allMessages = response.messages || [];
      
      const fileMessages = allMessages.filter((msg: FileMessage) => 
        msg.type !== 'TEXT' && msg.type !== 'LINK' && msg.fileUrl
      );
      
      setFiles(fileMessages);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (file: FileMessage) => {
  try {
    setDownloadingFile(file.id);
    const fileName = file.fileName || `file_${file.id}`;
    await downloadFile(file.fileUrl!, fileName);
    toast.success('File downloaded successfully');
  } catch (error) {
    console.error('Failed to download file:', error);
    toast.error('Failed to download file');
  } finally {
    setDownloadingFile(null);
  }
};

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="h-6 w-6" />;
      case 'PDF':
        return <FileText className="h-6 w-6" />;
      case 'DOCUMENT':
        return <FileText className="h-6 w-6" />;
      case 'EXCEL':
        return <File className="h-6 w-6" />;
      case 'POWERPOINT':
        return <File className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'PDF':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'DOCUMENT':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'EXCEL':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'POWERPOINT':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeDisplayName = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'Image';
      case 'PDF':
        return 'PDF';
      case 'DOCUMENT':
        return 'Document';
      case 'EXCEL':
        return 'Spreadsheet';
      case 'POWERPOINT':
        return 'Presentation';
      default:
        return 'File';
    }
  };

  // filter files based on selected filter and search term
  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'ALL' || file.type === filter;
    const matchesSearch = file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         file.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/groups/${groupId}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Group</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 truncate">{group?.name} Files</h1>
                  <p className="text-gray-600 text-sm lg:text-base">
                    {group?.course.courseCode} • {filteredFiles.length} files
                  </p>
                </div>
              </div>
              <Link
                to={`/chat/${groupId}`}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 w-full lg:w-auto"
              >
                <Users className="h-5 w-5" />
                <span>Open Chat</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search files by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Desktop Filter Tabs */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setFilter('IMAGE')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'IMAGE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setFilter('PDF')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'PDF'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              PDFs
            </button>
            <button
              onClick={() => setFilter('DOCUMENT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'DOCUMENT'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Menu className="h-5 w-5" />
              <span>Filter Files</span>
            </button>

            {/* Mobile Filter Dropdown */}
            {showMobileFilters && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Filter by Type</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setFilter('ALL'); setShowMobileFilters(false); }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      filter === 'ALL'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => { setFilter('IMAGE'); setShowMobileFilters(false); }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      filter === 'IMAGE'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => { setFilter('PDF'); setShowMobileFilters(false); }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      filter === 'PDF'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    PDFs
                  </button>
                  <button
                    onClick={() => { setFilter('DOCUMENT'); setShowMobileFilters(false); }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      filter === 'DOCUMENT'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Documents
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {files.length === 0 ? 'No files shared yet' : 'No files match your search'}
              </h3>
              <p className="text-gray-600">
                {files.length === 0 
                  ? 'Files shared in the group chat will appear here.' 
                  : 'Try adjusting your search criteria or filter.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <div key={file.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl border ${getFileTypeColor(file.type)} flex-shrink-0`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800 truncate text-sm lg:text-base">
                            {file.fileName || file.content}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type)} mt-1 max-w-fit sm:mt-0 sm:flex-shrink-0`}>
                            {getFileTypeDisplayName(file.type)}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 mb-2 space-y-1 sm:space-y-0">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{file.sender.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs lg:text-sm">{formatDate(file.timestamp)}</span>
                          </div>
                          {file.fileSize && (
                            <span className="text-xs lg:text-sm">{formatFileSize(file.fileSize)}</span>
                          )}
                        </div>

                        {file.content && file.content !== `Shared ${file.fileName}` && (
                          <p className="text-gray-600 text-sm truncate">{file.content}</p>
                        )}
                      </div>
                    </div>

                    {file.fileUrl && (
                      <button
                        onClick={() => handleFileDownload(file)}
                        disabled={downloadingFile === file.id}
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center lg:ml-4 w-full lg:w-auto"
                        title="Download file"
                      >
                        {downloadingFile === file.id ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster/>
    </div>
  );
};

export default GroupFiles;