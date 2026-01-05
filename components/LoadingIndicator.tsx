import React from 'react';

interface LoadingIndicatorProps {
  message: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center animate-fadeIn">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-gray-200 dark:border-brand-900 rounded-full"></div>
        {/* Inner Spinning Ring */}
        <div className="absolute inset-0 border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Center Glow */}
        <div className="absolute inset-4 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-md animate-pulse-slow"></div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-wide">生成中</h3>
        <p className="text-slate-500 dark:text-brand-200 text-sm max-w-xs mx-auto animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};