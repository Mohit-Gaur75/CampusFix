import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50 rounded-xl border border-rose-100">
      <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
      <h3 className="text-lg font-medium text-rose-900 mb-1">Error</h3>
      <p className="text-rose-600 mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
