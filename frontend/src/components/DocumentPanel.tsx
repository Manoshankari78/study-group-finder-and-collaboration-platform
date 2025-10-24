import React, { useState, useEffect } from 'react';
import {
  File,
  Upload,
  Download,
  Trash2,
  Edit2,
  X,
  Check,
  FileText,
  Image as ImageIcon,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedBy: {
    id: number;
    name: string;
  };
  uploadedAt: string;
}

interface DocumentPanelProps {
  groupId: number;
  userId: number;
}

const DocumentPanel: React.FC<DocumentPanelProps> = ({ groupId, userId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [groupId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('groupId', groupId.toString());
    if (description) {
      formData.append('description', description);
    }

    try {
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
          toast.success('Document uploaded successfully');
          fetchDocuments();
          setShowUploadModal(false);
          setSelectedFile(null);
          setDescription('');
          setUploadProgress(0);
        } else {
          toast.error('Upload failed');
          setUploadProgress(0);
        }
      });

      xhr.open('POST', 'http://localhost:8080/api/documents/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleUpdateDescription = async (documentId: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}/description`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: editDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? data.document : doc))
        );
        setEditingDocId(null);
        setEditDescription('');
        toast.success('Description updated successfully');
      } else {
        toast.error('Failed to update description');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update description');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/'))
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Shared Documents</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload documents to share with your group
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{getFileIcon(doc.fileType)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {doc.fileName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Uploaded by {doc.uploadedBy.name} •{' '}
                          {formatFileSize(doc.fileSize)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={doc.fileUrl}
                          download
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </a>

                        {doc.uploadedBy.id === userId && (
                          <>
                            <button
                              onClick={() => {
                                setEditingDocId(doc.id);
                                setEditDescription(doc.description || '');
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit description"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600" />
                            </button>

                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingDocId === doc.id ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Add description..."
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleUpdateDescription(doc.id)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDocId(null);
                            setEditDescription('');
                          }}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      doc.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {doc.description}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upload Document
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add a description for this document..."
                />
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Uploading...</span>
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
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDescription('');
                  setUploadProgress(0);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadProgress > 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-2 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPanel;
