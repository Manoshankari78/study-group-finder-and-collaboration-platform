import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  User, 
  ArrowLeft, 
  Camera, 
  Mail, 
  GraduationCap, 
  Save, 
  X, 
  Settings, 
  Bell, 
  Shield, 
  Plus, 
  LogOut, 
  Eye, 
  EyeOff, 
  Check,
  BookOpen,
  School,
  GraduationCapIcon,
  FileText
} from 'lucide-react';
import { userAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onLogout: () => void;
}

interface ProfileData {
  name: string;
  email: string;
  secondarySchool?: string;
  secondarySchoolPassingYear?: number;
  secondarySchoolPercentage?: number;
  higherSecondarySchool?: string;
  higherSecondaryPassingYear?: number;
  higherSecondaryPercentage?: number;
  universityName?: string;
  universityPassingYear?: number;
  universityPassingGPA?: number;
  bio?: string;
  avatarUrl?: string;
}

const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser, logout } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfileData(response.user || response);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First update profile data
      const response = await userAPI.updateProfile(profileData);
      setProfileData(response.user || response);

      // Then upload avatar if a new file was selected
      if (avatarFile) {
        const avatarResponse = await userAPI.uploadAvatar(avatarFile);
        setProfileData(prev => ({ ...prev, avatarUrl: avatarResponse.avatarUrl }));
        setAvatarFile(null);
        setAvatarPreview('');
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      alert(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await userAPI.removeAvatar();
      setProfileData(prev => ({ ...prev, avatarUrl: '' }));
      setAvatarPreview('');
      alert('Avatar removed successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to remove avatar. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'actions', label: 'Quick Actions', icon: Plus }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent font-inter mb-3">
                Profile Settings
              </h1>
              <p className="text-gray-600 font-roboto text-lg">
                Manage your academic profile and personal information
              </p>
            </div>
            
            {activeTab === 'profile' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg ${
                  isEditing 
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                }`}
              >
                {isEditing ? <X className="h-5 w-5" /> : <User className="h-5 w-5" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card & Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {avatarPreview || profileData.avatarUrl ? (
                    <img 
                      src={avatarPreview || profileData.avatarUrl} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {profileData.name}
                </h2>
                <p className="text-gray-600 mb-2">{profileData.email}</p>
                {profileData.bio && (
                  <p className="text-gray-600 text-sm mb-4">{profileData.bio}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {profileData.universityName && (
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                      <GraduationCapIcon className="h-4 w-4" />
                      <span>{profileData.universityName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Academic Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Academic Summary</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  {profileData.secondarySchool && (
                    <p>🎓 {profileData.secondarySchool}</p>
                  )}
                  {profileData.higherSecondarySchool && (
                    <p>📚 {profileData.higherSecondarySchool}</p>
                  )}
                  {profileData.universityName && (
                    <p>🏛️ {profileData.universityName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              {/* Profile Info Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Academic Profile</h3>
                    <p className="text-gray-600 mt-1">Update your personal and academic information</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="p-6 space-y-8">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Personal Information</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            disabled={!isEditing}
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                              type="email"
                              required
                              disabled
                              value={profileData.email}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 cursor-not-allowed"
                              placeholder="Enter your email address"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          rows={3}
                          disabled={!isEditing}
                          value={profileData.bio || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                            !isEditing ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="Tell us about yourself and your academic interests..."
                        />
                      </div>
                    </div>

                    {/* Secondary School */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <School className="h-5 w-5" />
                        <span>Secondary School (10th Grade)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Name
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={profileData.secondarySchool || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, secondarySchool: e.target.value }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter school name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passing Year
                          </label>
                          <select
                            disabled={!isEditing}
                            value={profileData.secondarySchoolPassingYear || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, secondarySchoolPassingYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <option value="">Select year</option>
                            {yearOptions.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Percentage (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            disabled={!isEditing}
                            value={profileData.secondarySchoolPercentage || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, secondarySchoolPercentage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="e.g., 85.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Higher Secondary School */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Higher Secondary School (12th Grade)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Name
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={profileData.higherSecondarySchool || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, higherSecondarySchool: e.target.value }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter school name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passing Year
                          </label>
                          <select
                            disabled={!isEditing}
                            value={profileData.higherSecondaryPassingYear || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, higherSecondaryPassingYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <option value="">Select year</option>
                            {yearOptions.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Percentage (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            disabled={!isEditing}
                            value={profileData.higherSecondaryPercentage || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, higherSecondaryPercentage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="e.g., 85.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* University */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <GraduationCapIcon className="h-5 w-5" />
                        <span>University / College</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            University Name
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={profileData.universityName || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, universityName: e.target.value }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter university name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passing Year
                          </label>
                          <select
                            disabled={!isEditing}
                            value={profileData.universityPassingYear || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, universityPassingYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <option value="">Select year</option>
                            {yearOptions.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GPA / CGPA
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            disabled={!isEditing}
                            value={profileData.universityPassingGPA || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, universityPassingGPA: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="e.g., 8.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Avatar Management */}
                    {isEditing && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h4>
                        <div className="flex items-center space-x-4">
                          <label className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer">
                            <Camera className="h-4 w-4 inline mr-2" />
                            Change Photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </label>
                          
                          {(avatarPreview || profileData.avatarUrl) && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                        
                        {avatarPreview && (
                          <p className="text-green-600 text-sm mt-2">New photo selected - will be saved when you update profile</p>
                        )}
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null);
                            setAvatarPreview('');
                            // Reload profile data to discard changes
                            userAPI.getProfile().then(response => {
                              setProfileData(response.user || response);
                            });
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <Save className="h-5 w-5" />
                          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Security Settings</h3>
                    <p className="text-gray-600 mt-1">Update your password and security preferences</p>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="Enter your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="Confirm your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Quick Actions Tab */}
              {activeTab === 'actions' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Quick Actions</h3>
                    <p className="text-gray-600 mt-1">Frequently used actions and shortcuts</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link
                        to="/groups/create"
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-3 rounded-xl">
                            <Plus className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Create Study Group</h4>
                            <p className="text-blue-100 text-sm">Start a new study group</p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/groups"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-3 rounded-xl">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Find Groups</h4>
                            <p className="text-purple-100 text-sm">Discover study groups</p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/courses"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-3 rounded-xl">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Manage Courses</h4>
                            <p className="text-green-100 text-sm">View your courses</p>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-3 rounded-xl">
                            <LogOut className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Logout</h4>
                            <p className="text-red-100 text-sm">Sign out of your account</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;