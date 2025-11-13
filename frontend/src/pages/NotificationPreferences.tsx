import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Bell, Save, ArrowLeft, Loader } from 'lucide-react';
import { preferencesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface NotificationPreferencesProps {
  onLogout: () => void;
}

interface UserPreferences {
  id: number;
  eventNotifications: boolean;
  eventReminders: boolean;
  emailNotifications: boolean;
}

const NotificationPreferences = ({ onLogout }: NotificationPreferencesProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: 0,
    eventNotifications: true,
    eventReminders: true,
    emailNotifications: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await preferencesAPI.getPreferences();
      if (response.preferences) {
        setPreferences(response.preferences);
      } else {
        // default preferences if none returned
        setPreferences({
          id: 0,
          eventNotifications: true,
          eventReminders: true,
          emailNotifications: true
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch preferences:', error);
      if (error.message?.includes('404') || error.message?.includes('500')) {
        // server error, use default
        setPreferences({
          id: 0,
          eventNotifications: true,
          eventReminders: true,
          emailNotifications: true
        });
      } else {
        toast.error('Failed to load preferences');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await preferencesAPI.updatePreferences(preferences);
      toast.success('Preferences updated successfully!');
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar onLogout={onLogout} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-600 font-roboto">
            Manage how and when you receive notifications.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
          <div className="space-y-6">
            {/* Event Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Event Notifications</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Receive notifications when new study sessions are created in your groups
                </p>
              </div>
              <button
                onClick={() => handleToggle('eventNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.eventNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.eventNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Event Reminders */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Event Reminders</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Receive reminder notifications 30 minutes before study sessions
                </p>
              </div>
              <button
                onClick={() => handleToggle('eventReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.eventReminders ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.eventReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Email Notifications</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Receive notifications via email (requires both event notifications and reminders to be enabled)
                </p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                disabled={!preferences.eventNotifications || !preferences.eventReminders}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                } ${(!preferences.eventNotifications || !preferences.eventReminders) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800">How Notifications Work</h3>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Event notifications are sent when new study sessions are created</li>
                <li>• Event reminders are sent 30 minutes before sessions start</li>
                <li>• Email notifications require both notification types to be enabled</li>
                <li>• You can always change these settings later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;