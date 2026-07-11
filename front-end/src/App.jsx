import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import NoticeDetail from './pages/NoticeDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogs from './pages/AdminLogs';
import NoticeList from './pages/NoticeList';
import InterestConditions from './pages/InterestConditions';
import MyInfo from './pages/MyInfo';
import Notifications from './pages/Notifications';
import SignUp from './pages/SignUp';
import SignUpChoice from './pages/SignUpChoice';
import PasswordReset from './pages/PasswordReset';
import FindCompanyEmail from './pages/FindCompanyEmail';
import PublicSupport from './pages/PublicSupport';
import CalendarPage from './pages/CalendarPage';
import SpecificationList from './pages/SpecificationList';
import SpecificationDetail from './pages/SpecificationDetail';
import BidResultList from './pages/BidResultList';
import BidResultDetail from './pages/BidResultDetail';
import ProposalSupport from './pages/ProposalSupport';
import InterestNotices from './pages/InterestNotices';
import SupportCenter from './pages/SupportCenter';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpChoice />} />
          <Route path="/signup/personal" element={<SignUp signupType="PERSONAL" />} />
          <Route path="/signup/company" element={<SignUp signupType="COMPANY" />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/find-company-email" element={<FindCompanyEmail />} />
          <Route path="/support/public" element={<PublicSupport />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><NoticeList /></ProtectedRoute>} />
          <Route path="/notice/:id" element={<ProtectedRoute><NoticeDetail /></ProtectedRoute>} />
          <Route path="/conditions" element={<ProtectedRoute><InterestConditions /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyInfo /></ProtectedRoute>} />
          <Route path="/specifications" element={<ProtectedRoute><SpecificationList /></ProtectedRoute>} />
          <Route path="/specifications/:id" element={<ProtectedRoute><SpecificationDetail /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><BidResultList /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><BidResultDetail /></ProtectedRoute>} />
          <Route path="/proposal" element={<ProtectedRoute><ProposalSupport /></ProtectedRoute>} />
          <Route path="/interests" element={<ProtectedRoute><InterestNotices /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportCenter /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute requireAdmin={true}><AdminLogs /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
