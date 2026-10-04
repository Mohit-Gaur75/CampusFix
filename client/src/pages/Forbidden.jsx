import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <ShieldAlert className="mx-auto h-16 w-16 text-rose-500" />
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>
        <div>
          <Button onClick={() => navigate(-1)} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
