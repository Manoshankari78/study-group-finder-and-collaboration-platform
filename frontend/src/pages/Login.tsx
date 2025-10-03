import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement forgot password API call
      // await authAPI.forgotPassword(forgotEmail);
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 3000);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Login Form */}
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-2xl shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold font-inter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
              {showForgotPassword ? 'Reset Password' : 'Welcome to StudyConnect'}
            </h2>
            <p className="text-lg text-gray-600 font-roboto">
              {showForgotPassword ? 'Enter your email to reset password' : 'Connect, collaborate, and excel together'}
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {showForgotPassword ? (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    name="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                {resetSent && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 text-sm font-medium">
                      Password reset link has been sent to your email!
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetSent || isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Sending...' : resetSent ? 'Reset Link Sent!' : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-gray-50 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {!showForgotPassword && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Register here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Illustration/Features */}
        <div className="hidden lg:block">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Join thousands of students already studying together
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Study Groups</h4>
                <p className="text-sm text-gray-600">Connect with peers in your courses</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Real-time Chat</h4>
                <p className="text-sm text-gray-600">Collaborate instantly with your group</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Study Sessions</h4>
                <p className="text-sm text-gray-600">Schedule and track your progress</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Course Management</h4>
                <p className="text-sm text-gray-600">Organize all your subjects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;