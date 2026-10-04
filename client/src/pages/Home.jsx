import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicIssues } from '../api/issues';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityPill } from '../components/ui/Badges';
import { Building2, Search, ArrowRight, User as UserIcon } from 'lucide-react';
import { formatRelativeTime } from '../utils/constants';

export const Home = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await getPublicIssues({ limit: 20 });
      setIssues(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">CampusFix.</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to={user.role === 'STUDENT' ? '/student/dashboard' : '/authority/dashboard'}>
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
              )}
              <Button onClick={() => navigate('/student/report')}>
                Report an Issue
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-indigo-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Help us keep the campus perfect.
          </h1>
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            See what's happening around campus, track maintenance progress in real-time, and report issues instantly.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 border-none" onClick={() => navigate('/student/report')}>
              Report a New Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Recent Campus Issues</h2>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-500 py-12">Loading issues...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map(issue => (
              <Card key={issue._id} className="hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => navigate(`/student/issues/${issue._id}`)}>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      {issue.code}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{issue.title}</h3>
                  
                  <div className="text-sm text-slate-500 mb-4 flex-1">
                    <p className="flex items-center mb-1">
                      <Building2 className="w-4 h-4 mr-2" />
                      {issue.location?.label || 'Unknown location'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center text-xs text-slate-500">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {issue.reportCount} student{issue.reportCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatRelativeTime(issue.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {issues.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                No issues reported recently.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
