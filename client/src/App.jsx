import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { StudentDashboard } from './pages/student/Dashboard';
import { ReportIssue } from './pages/student/ReportIssue';
import { MyIssues } from './pages/student/MyIssues';
import { IssueDetail } from './pages/student/IssueDetail';
import { AuthorityDashboard } from './pages/authority/Dashboard';
import { AuthorityIssues } from './pages/authority/Issues';
import { AuthorityIssueDetail } from './pages/authority/IssueDetail';
import { Analytics } from './pages/authority/Analytics';
import { Forbidden } from './pages/Forbidden';

// Helper for root redirect
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/authority/dashboard'} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<AppLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/report" element={<ReportIssue />} />
          <Route path="/student/issues" element={<MyIssues />} />
          <Route path="/student/issues/:id" element={<IssueDetail />} />
        </Route>
      </Route>

      {/* Authority Routes */}
      <Route element={<ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
          <Route path="/authority/issues" element={<AuthorityIssues />} />
          <Route path="/authority/issues/:id" element={<AuthorityIssueDetail />} />
          <Route path="/authority/analytics" element={<Analytics />} />
        </Route>
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
