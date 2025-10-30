import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseManagement from './pages/CourseManagement';
import GroupDiscovery from './pages/GroupDiscovery';
import GroupCreation from './pages/GroupCreation';
import GroupDetail from './pages/GroupDetail';
import Chat from './pages/Chat';
import Calendar from './pages/Calendar';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ResetPassword from './pages/ResetPassword';
import CoursePeers from './pages/CoursePeers';
import CourseSpecificPeers from './pages/CourseSpecificPeers';
import GroupMembers from './pages/GroupMembers';
import GroupEdit from './pages/GroupEdit';
import FloatingChatBubble from './components/FloatingChatBubble';
import GroupFiles from './pages/GroupFiles';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseManagement onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupDiscovery onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/create"
            element={
              <ProtectedRoute>
                <GroupCreation onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetail onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id/members"
            element={
              <ProtectedRoute>
                <GroupMembers onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:groupId?"
            element={
              <ProtectedRoute>
                <Chat onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peers"
            element={
              <ProtectedRoute>
                <CoursePeers onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/peers"
            element={
              <ProtectedRoute>
                <CourseSpecificPeers onLogout={logout} />
              </ProtectedRoute>
            } />
          <Route
            path="/groups/:id/edit"
            element={
              <ProtectedRoute>
                <GroupEdit onLogout={logout} />
              </ProtectedRoute>
            } />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />
          <Route
            path="/groups/:groupId/files"
            element={
              <ProtectedRoute>
                <GroupFiles onLogout={logout} />
              </ProtectedRoute>
            }
          />
        </Routes>
        <FloatingChatBubble />
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;