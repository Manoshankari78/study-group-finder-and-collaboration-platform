const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function for file uploads
const getAuthHeadersMultipart = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// General API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: any) => {
    return apiCall('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/auth/update-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    return apiCall('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  updateProfile: async (profileData: any) => {
    return apiCall('/user/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/user/upload-avatar`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return await response.json();
  },

  removeAvatar: async () => {
    return apiCall('/user/remove-avatar', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

// Course API calls
export const coursesAPI = {
  // Get all courses with optional search
  getCourses: async (search?: string) => {
    const url = search ? `/courses?search=${encodeURIComponent(search)}` : '/courses';
    return apiCall(url, {
      method: 'GET',
    });
  },
  
  getCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  getMyCourses: async () => {
    return apiCall('/courses/my-courses', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  enrollInCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  unenrollFromCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}/unenroll`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // peers in same courses
  getCoursePeers: async () => {
    return apiCall('/courses/peers', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // peers in specific course
  getPeersInCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}/peers`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },
};

// Groups API calls
export const groupsAPI = {
  // Get all groups with optional search and course filter
  getGroups: async (search?: string, courseId?: number) => {
    let url = '/groups';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (courseId) params.append('courseId', courseId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiCall(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Get group by ID
  getGroup: async (groupId: number) => {
    return apiCall(`/groups/${groupId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  createGroup: async (groupData: any) => {
    return apiCall('/groups', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
  },

  updateGroup: async (groupId: number, groupData: any) => {
    return apiCall(`/groups/${groupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
  },

  deleteGroup: async (groupId: number) => {
    return apiCall(`/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  getMyGroups: async () => {
    return apiCall('/groups/my-groups', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getRecommendedGroups: async () => {
    return apiCall('/groups/recommended', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  joinGroup: async (groupId: number) => {
    return apiCall(`/groups/${groupId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  leaveGroup: async (groupId: number) => {
    return apiCall(`/groups/${groupId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  getGroupMembers: async (groupId: number) => {
    return apiCall(`/groups/${groupId}/members`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getPendingRequests: async (groupId: number) => {
    return apiCall(`/groups/${groupId}/pending-requests`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  handleJoinRequest: async (groupId: number, userId: number, status: string) => {
    return apiCall(`/groups/${groupId}/requests/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },
  getMyMembership: async (groupId: number) => {
    return apiCall(`/groups/${groupId}/my-membership`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },
  removeMember: async (groupId: number, userId: number) => {
  return apiCall(`/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
},
};

// Chat API calls
export const chatAPI = {
  // Get message history
  getMessages: async (groupId: number, page: number = 0, size: number = 50) => {
    return apiCall(`/chat/${groupId}/messages?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  uploadFile: async (groupId: number, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await fetch(`${API_BASE_URL}/chat/${groupId}/upload`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return await response.json();
  },

  shareLink: async (groupId: number, url: string, title?: string) => {
    return apiCall(`/chat/${groupId}/share-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url, title }),
    });
  },
};

export const downloadFile = async (fileUrl: string, fileName: string) => {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const eventsAPI = {
  createEvent: async (eventData: any) => {
    return apiCall('/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
  },

  getMyEvents: async () => {
    return apiCall('/events/my-events', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getGroupEvents: async (groupId: number) => {
    return apiCall(`/events/group/${groupId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getEvent: async (eventId: number) => {
    return apiCall(`/events/${eventId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  deleteEvent: async (eventId: number) => {
    return apiCall(`/events/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

export const preferencesAPI = {
  getPreferences: async () => {
    return apiCall('/user/preferences', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  updatePreferences: async (preferences: any) => {
    return apiCall('/user/preferences', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
  },
};

export const notificationsAPI = {
  getUserNotifications: async () => {
    return apiCall('/notifications', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getUnreadNotifications: async () => {
    return apiCall('/notifications/unread', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getUnreadCount: async () => {
    return apiCall('/notifications/unread-count', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  markAsRead: async (notificationId: number) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  markAllAsRead: async () => {
    return apiCall('/notifications/mark-all-read', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  deleteNotification: async (notificationId: number) => {
    return apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  deleteAllNotifications: async () => {
    return apiCall('/notifications', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};