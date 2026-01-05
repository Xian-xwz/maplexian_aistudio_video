import React, { useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface VideoResultProps {
  videoUrl: string;
  prompt: string;
  onReset: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, prompt, onReset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    }
  }, [videoUrl]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeInUp">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/10 dark:shadow-brand-500/20 ring-1 ring-black/5 dark:ring-white/10 bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          loop
          className="w-full h-auto aspect-video object-contain"
        />
      </div>

      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">关键词 Prompt</h4>
            <p className="text-slate-900 dark:text-white font-medium line-clamp-2">{prompt}</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <a
              href={videoUrl}
              download={`veo-generation-${Date.now()}.mp4`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded-lg transition-colors font-medium text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              下载
            </a>
            <button
              onClick={onReset}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              再试一次
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};