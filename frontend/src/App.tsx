import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/courses" 
            element={isAuthenticated ? <CourseManagement onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/groups" 
            element={isAuthenticated ? <GroupDiscovery onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/groups/create" 
            element={isAuthenticated ? <GroupCreation onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/groups/:id" 
            element={isAuthenticated ? <GroupDetail onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat/:groupId?" 
            element={isAuthenticated ? <Chat onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/calendar" 
            element={isAuthenticated ? <Calendar onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={isAuthenticated ? <NotificationsPage onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;