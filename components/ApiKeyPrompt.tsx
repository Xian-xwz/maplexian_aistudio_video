import React from 'react';
import { KeyIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ApiKeyPromptProps {
  onSelectKey: () => void;
  title?: string;
  description?: string;
  selectKeyLabel?: string;
  getKeyLabel?: string;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ 
  onSelectKey,
  title,
  description,
  selectKeyLabel = "选择 API Key",
  getKeyLabel = "获取 API Key"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl max-w-lg mx-auto text-center space-y-6 shadow-xl transition-colors animate-fadeInUp">
      <div className="p-4 bg-brand-50 dark:bg-slate-700/50 rounded-full text-brand-500 dark:text-brand-400">
        <KeyIcon className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {title || "需要选择 API 密钥"}
        </h3>
        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {description ? (
            <p>{description}</p>
          ) : (
            <p>要使用 Veo 视频生成模型，您需要选择一个具有结算功能的 Google Cloud 项目的 API 密钥。</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
         <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-all text-sm"
        >
          <span>{getKeyLabel}</span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>

        <button
          onClick={onSelectKey}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-semibold shadow-lg shadow-brand-500/20 transition-all transform hover:scale-105 text-sm"
        >
          {selectKeyLabel}
        </button>
      </div>
      
      <div className="text-xs text-slate-400 pt-2">
          <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-brand-500 underline transition-colors"
            >
              了解更多关于计费的信息 (Billing Docs)
            </a>
       </div>
    </div>
  );
};