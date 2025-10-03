import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, ArrowLeft, Camera, Mail, Phone, GraduationCap, MapPin, Calendar, CreditCard as Edit3, Save, X, Settings, Bell, Shield, Palette, Globe, Users, Plus, LogOut, Eye, EyeOff, Check } from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    phone: '+1 (555) 123-4567',
    university: 'University of Technology',
    major: 'Computer Science',
    year: 'Junior',
    bio: 'Passionate computer science student interested in algorithms and data structures. Love collaborating with peers and helping others understand complex concepts.',
    joinDate: 'January 2024',
    studyGroups: 3,
    totalSessions: 24,
    hoursStudied: 156
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    groupInvitations: true,
    weeklyDigest: false,
    theme: 'light',
    language: 'english',
    timezone: 'UTC-5'
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePreferencesUpdate = () => {
    alert('Preferences updated successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'actions', label: 'Quick Actions', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Manage your account information and preferences
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
                {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
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
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{profileData.major}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{profileData.university}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profileData.joinDate}</span>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{profileData.studyGroups}</p>
                    <p className="text-xs text-gray-600">Study Groups</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{profileData.totalSessions}</p>
                    <p className="text-xs text-gray-600">Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{profileData.hoursStudied}</p>
                    <p className="text-xs text-gray-600">Hours</p>
                  </div>
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
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Personal Information</h3>
                    <p className="text-gray-600 mt-1">Update your personal details and academic information</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!isEditing}
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!isEditing}
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="email"
                            required
                            disabled={!isEditing}
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter your email address"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            disabled={!isEditing}
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={profileData.university}
                            onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              !isEditing ? 'bg-gray-50' : 'bg-white'
                            }`}
                            placeholder="Enter your university"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Major
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={profileData.major}
                          onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="Enter your major"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Year
                        </label>
                        <select
                          disabled={!isEditing}
                          value={profileData.year}
                          onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          <option value="Freshman">Freshman</option>
                          <option value="Sophomore">Sophomore</option>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        disabled={!isEditing}
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                          !isEditing ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="Tell us about yourself and your study interests..."
                      />
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                        >
                          <Save className="h-5 w-5" />
                          <span>Save Changes</span>
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
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Notification Preferences</h3>
                    <p className="text-gray-600 mt-1">Customize how you receive notifications and updates</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Email Notifications</h4>
                      
                      {[
                        { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive notifications via email' },
                        { key: 'studyReminders', label: 'Study reminders', desc: 'Get reminded about upcoming study sessions' },
                        { key: 'groupInvitations', label: 'Group invitations', desc: 'Receive invitations to join study groups' },
                        { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Get a weekly summary of your activities' }
                      ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-800">{pref.label}</p>
                            <p className="text-sm text-gray-600">{pref.desc}</p>
                          </div>
                          <button
                            onClick={() => setPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[pref.key as keyof typeof preferences] ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[pref.key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handlePreferencesUpdate}
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                      >
                        <Check className="h-5 w-5" />
                        <span>Save Preferences</span>
                      </button>
                    </div>
                  </div>
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
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Find Groups</h4>
                            <p className="text-purple-100 text-sm">Discover study groups</p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/notifications"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-3 rounded-xl">
                            <Bell className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">View Notifications</h4>
                            <p className="text-green-100 text-sm">Check your alerts</p>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={onLogout}
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

              {/* Account Settings Tab */}
              {activeTab === 'account' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 font-inter">Account Settings</h3>
                    <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC-7">Mountain Time (UTC-7)</option>
                          <option value="UTC-6">Central Time (UTC-6)</option>
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                          <option value="UTC+0">GMT (UTC+0)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handlePreferencesUpdate}
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                      >
                        <Check className="h-5 w-5" />
                        <span>Save Settings</span>
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