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

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
      throw new Error(`Upload failed: ${response.status}`);
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

// Mock data for other features (to be implemented later)
export const groupsAPI = {
  getGroups: async () => {
    // TODO: Implement actual API call
    return new Promise(resolve => setTimeout(() => resolve({
      groups: [
        {
          id: 1,
          name: 'CS 101 Study Warriors',
          description: 'Focused study group for mastering computer science fundamentals.',
          course: 'CS 101',
          privacy: 'public',
          members: 12,
          maxMembers: 15,
          tags: ['Beginner Friendly', 'Problem Solving', 'Weekly Meetings']
        },
        // ... more groups
      ]
    }), 1000));
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

  // Get user's enrolled courses
  getMyCourses: async () => {
    return apiCall('/courses/my-courses', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}/unenroll`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Get peers in same courses
  getCoursePeers: async () => {
    return apiCall('/courses/peers', {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },

  // Get peers in specific course
  getPeersInCourse: async (courseId: number) => {
    
    return apiCall(`/courses/${courseId}/peers`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  },
};