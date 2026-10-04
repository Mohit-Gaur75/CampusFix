import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, demoLogin } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/authority/dashboard'} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(res.data.user.role === 'STUDENT' ? '/student/dashboard' : '/authority/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await demoLogin(role);
      if (res.success) {
        navigate(res.data.user.role === 'STUDENT' ? '/student/dashboard' : '/authority/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900"></div>
        <div className="relative z-10 p-12 text-center text-white">
          <h1 className="text-5xl font-bold tracking-tight mb-6">CampusFix.</h1>
          <p className="text-xl text-indigo-200 max-w-lg mx-auto">
            Report campus issues in seconds. Track progress instantly. Fix things faster.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow"
                placeholder="you@campusfix.demo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow"
                placeholder="••••••••"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-center text-slate-500 mb-4 font-medium">Quick Access (Demo)</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleDemo('STUDENT')} disabled={isLoading}>
                Demo Student
              </Button>
              <Button variant="outline" onClick={() => handleDemo('AUTHORITY')} disabled={isLoading}>
                Demo Authority
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
