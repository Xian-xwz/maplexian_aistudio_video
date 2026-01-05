import React, { useState, useEffect, useRef } from 'react';
import { 
  VideoCameraIcon, 
  ExclamationTriangleIcon, 
  PhotoIcon, 
  XMarkIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftIcon,
  LanguageIcon
} from '@heroicons/react/24/solid'; 
import { GenerationStatus, ModelGender, ModelAction, AspectRatio } from './types';
import { generateFashionVideo, checkApiKeyStatus, requestApiKeySelection, ImageInput } from './services/geminiService';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VideoResult } from './components/VideoResult';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

type ViewMode = 'landing' | 'mobile' | 'web';
type ThemeMode = 'light' | 'dark';
type LanguageMode = 'zh-CN' | 'zh-TW' | 'en';

const App: React.FC = () => {
  // Global App State
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [language, setLanguage] = useState<LanguageMode>('zh-TW'); // Default to Traditional Chinese
  const [showSettings, setShowSettings] = useState(false);

  // State for Fashion App
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false); // Track if user has generated once
  
  // Selection State
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectedGender, setSelectedGender] = useState<ModelGender | null>(null);
  const [selectedAction, setSelectedAction] = useState<ModelAction | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enforce 16:9 for multiple images
  useEffect(() => {
    if (selectedImages.length > 1) {
      setAspectRatio('16:9');
    }
  }, [selectedImages.length]);

  // Translation Resources
  const translations = {
    'zh-CN': {
      title: "AI Fashion Studio",
      landingTitle: "打造您的专属秀场",
      landingSubtitle: "选择您的体验方式，开始打造虚拟时装秀。",
      mobileMode: "手机端体验",
      mobileDesc: "模拟移动设备界面，适合竖屏视频创作。",
      webMode: "网页端体验",
      webDesc: "全宽工作台模式，更宽广的视野与细节。",
      uploadTitle: "上传服装/参考图",
      uploadDesc: "点击 or 拖拽上传服装图片",
      addMore: "添加图片",
      singleImgHint: "单图模式：支持 9:16 或 16:9",
      multiImgHint: "多图模式：自动锁定 16:9",
      fileLimit: "支持 PNG, JPG (Max 5MB)",
      selectRatio: "选择视频比例",
      ratioPortrait: "9:16 竖屏",
      ratioLandscape: "16:9 横屏",
      selectModel: "选择模特类型",
      female: "女模特",
      male: "男模特",
      selectAction: "选择展示动作",
      actionWalk: "T台走秀 (Walking)",
      descWalk: "全身镜头，自信步伐",
      actionCoffee: "喝咖啡 (Lifestyle)",
      descCoffee: "半身镜头，休闲惬意",
      actionStretch: "伸懒腰 (Pose)",
      descStretch: "展示服装剪裁与弹性",
      generateBtn: "生成 AI 视频",
      generating: "正在准备时尚大片...",
      errorKey: "API Key 错误或未授权。请重新选择。",
      errorUnknown: "生成视频时发生未知错误",
      themeTitle: "外观主题",
      langTitle: "语言 / Language",
      backHome: "返回首页",
      mainIntroTitle: "打造您的专属秀场",
      mainIntroDesc: "支持 1-4 张服装图，自动生成高定走秀视频。",
      modelLoading: "正在生成中...",
      trialTitle: "免费试用已结束",
      trialDesc: "继续生成视频，请配置您自己的 API Key。注意：必须使用已绑定付费结算项目的 Google Cloud Key。",
      keyTitle: "需要选择 API 密钥",
      keyDesc: "要使用 Veo 视频生成模型，您需要选择一个具有结算功能的 Google Cloud 项目的 API 密钥。",
      getKeyBtn: "申请 API Key",
      selectKeyBtn: "选择 API Key"
    },
    'zh-TW': {
      title: "AI Fashion Studio",
      landingTitle: "打造您的專屬秀場",
      landingSubtitle: "選擇您的體驗方式，開始打造虛擬時裝秀。",
      mobileMode: "手機端體驗",
      mobileDesc: "模擬移動設備介面，適合直式影片創作。",
      webMode: "網頁端體驗",
      webDesc: "全寬工作台模式，更寬廣的視野與細節。",
      uploadTitle: "上傳服裝/參考圖",
      uploadDesc: "點擊 or 拖拽上傳服裝圖片",
      addMore: "添加圖片",
      singleImgHint: "單圖模式：支持 9:16 或 16:9",
      multiImgHint: "多圖模式：自動鎖定 16:9",
      fileLimit: "支持 PNG, JPG (Max 5MB)",
      selectRatio: "選擇影片比例",
      ratioPortrait: "9:16 直式",
      ratioLandscape: "16:9 橫式",
      selectModel: "選擇模特類型",
      female: "女模特",
      male: "男模特",
      selectAction: "選擇展示動作",
      actionWalk: "T台走秀 (Walking)",
      descWalk: "全身鏡頭，自信步伐",
      actionCoffee: "喝咖啡 (Lifestyle)",
      descCoffee: "半身鏡頭，休閒愜意",
      actionStretch: "伸懶腰 (Pose)",
      descStretch: "展示服裝剪裁與彈性",
      generateBtn: "生成 AI 影片",
      generating: "正在準備時尚大片...",
      errorKey: "API Key 錯誤或未授權。請重新選擇。",
      errorUnknown: "生成影片時發生未知錯誤",
      themeTitle: "外觀主題",
      langTitle: "語言 / Language",
      backHome: "返回首頁",
      mainIntroTitle: "打造您的專屬秀場",
      mainIntroDesc: "支持 1-4 張服裝圖，自動生成高定走秀影片。",
      modelLoading: "正在生成中...",
      trialTitle: "免費試用已結束",
      trialDesc: "繼續生成影片，請配置您自己的 API Key。注意：必須使用已綁定付費結算項目的 Google Cloud Key。",
      keyTitle: "需要選擇 API 密鑰",
      keyDesc: "要使用 Veo 影片生成模型，您需要選擇一個具有結算功能的 Google Cloud 項目的 API 密鑰。",
      getKeyBtn: "申請 API Key",
      selectKeyBtn: "選擇 API Key"
    },
    'en': {
      title: "AI Fashion Studio",
      landingTitle: "Create Your Runway",
      landingSubtitle: "Choose your experience to start your virtual fashion show.",
      mobileMode: "Mobile Experience",
      mobileDesc: "Simulated mobile interface, perfect for portrait video creation.",
      webMode: "Desktop Experience",
      webDesc: "Full-width workspace mode for broader view and details.",
      uploadTitle: "Upload Clothing",
      uploadDesc: "Click or drag to upload",
      addMore: "Add Image",
      singleImgHint: "Single Mode: Supports 9:16 or 16:9",
      multiImgHint: "Multi Mode: Locked to 16:9",
      fileLimit: "Supports PNG, JPG (Max 5MB)",
      selectRatio: "Select Aspect Ratio",
      ratioPortrait: "9:16 Portrait",
      ratioLandscape: "16:9 Landscape",
      selectModel: "Select Model",
      female: "Female Model",
      male: "Male Model",
      selectAction: "Select Action",
      actionWalk: "Runway Walk",
      descWalk: "Full body shot, confident stride",
      actionCoffee: "Coffee Break",
      descCoffee: "Upper body shot, relaxed vibe",
      actionStretch: "Stretching Pose",
      descStretch: "Shows off fit and elasticity",
      generateBtn: "Generate Video",
      generating: "Preparing your fashion show...",
      errorKey: "API Key invalid or unauthorized. Please re-select.",
      errorUnknown: "Unknown error during generation",
      themeTitle: "Theme",
      langTitle: "Language",
      backHome: "Back to Home",
      mainIntroTitle: "Create Your Runway",
      mainIntroDesc: "Upload 1-4 clothing images to generate a high-fashion video.",
      modelLoading: "Generating...",
      trialTitle: "Free Trial Ended",
      trialDesc: "To generate more videos, please configure your own API Key. Note: A Google Cloud Key with a paid billing project is required.",
      keyTitle: "API Key Required",
      keyDesc: "To use the Veo video generation model, you need to select an API key from a Google Cloud project with billing enabled.",
      getKeyBtn: "Get API Key",
      selectKeyBtn: "Select API Key"
    }
  };

  const t = translations[language];

  // Initialize Theme
  useEffect(() => {
    // Check if user has a preference or default to dark
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = (mode: ThemeMode) => {
    setTheme(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initial check for API Key status
  useEffect(() => {
    const init = async () => {
      setStatus(GenerationStatus.CHECKING_KEY);
      try {
        const hasKey = await checkApiKeyStatus();
        if (hasKey) {
          setStatus(GenerationStatus.IDLE);
        } else {
          setStatus(GenerationStatus.WAITING_FOR_KEY);
        }
      } catch (e) {
        console.error("Failed to check API key status", e);
        setStatus(GenerationStatus.IDLE);
      }
    };
    init();
  }, []);

  const handleSelectKey = async () => {
    try {
      await requestApiKeySelection();
      setStatus(GenerationStatus.IDLE);
      setError(null);
    } catch (e) {
      setError("密钥选择失败，请重试。");
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    let errorMessage = null;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        errorMessage = "仅支持图片文件";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorMessage = "单张图片大小请控制在 5MB 以内";
        return;
      }
      validFiles.push(file);
    });

    if (errorMessage) setError(errorMessage);

    if (validFiles.length === 0) return;

    // Limit total to 4
    const remainingSlots = 4 - selectedImages.length;
    if (remainingSlots <= 0) {
      setError("最多只能上传 4 张图片");
      return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Data = result.split(',')[1];
        
        setSelectedImages(prev => [
          ...prev, 
          {
            id: Math.random().toString(36).substring(7),
            file,
            preview: result,
            base64: base64Data,
            mimeType: file.type
          }
        ]);
        setError(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset value to allow selecting the same file again if deleted
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0 || !selectedGender || !selectedAction) return;

    setStatus(GenerationStatus.GENERATING);
    setError(null);
    setProgressMessage(t.generating);

    try {
      const imageInputs: ImageInput[] = selectedImages.map(img => ({
        base64Data: img.base64,
        mimeType: img.mimeType
      }));

      const url = await generateFashionVideo(
        imageInputs, 
        selectedGender, 
        selectedAction,
        aspectRatio, // Pass the selected aspect ratio
        (msg) => {
          setProgressMessage(msg);
        },
        language // Pass current language for localized messages
      );
      setVideoUrl(url);
      setHasGenerated(true); // Mark as generated
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         setStatus(GenerationStatus.WAITING_FOR_KEY);
         setError(t.errorKey);
      } else {
        setStatus(GenerationStatus.ERROR);
        setError(err instanceof Error ? err.message : t.errorUnknown);
      }
    }
  };

  const reset = () => {
    setVideoUrl(null);
    setError(null);

    // If user has already generated once, force them to select a key
    if (hasGenerated) {
      setStatus(GenerationStatus.WAITING_FOR_KEY);
    } else {
      setStatus(GenerationStatus.IDLE);
    }
  };

  // Helper for step numbers
  const StepNumber = ({ num }: { num: number }) => (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 flex-shrink-0">
      {num}
    </div>
  );

  // --- Landing Page Component ---
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
         {/* Settings Button */}
         <div className="absolute top-6 right-6 z-50">
           <div className="relative">
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
             >
               <Cog6ToothIcon className="w-6 h-6" />
             </button>
             {showSettings && (
               <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 animate-fadeIn z-50">
                 
                 {/* Theme Section */}
                 <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">
                   {t.themeTitle}
                 </div>
                 <div className="grid grid-cols-2 gap-1 mb-3">
                    <button 
                      onClick={() => toggleTheme('light')}
                      className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      <SunIcon className="w-4 h-4" /> Light
                    </button>
                    <button 
                      onClick={() => toggleTheme('dark')}
                      className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      <MoonIcon className="w-4 h-4" /> Dark
                    </button>
                 </div>

                 <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 mx-2"></div>

                 {/* Language Section */}
                 <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                   {t.langTitle}
                 </div>
                 <div className="space-y-1">
                   <button 
                     onClick={() => setLanguage('zh-TW')}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${language === 'zh-TW' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                   >
                     <span className="text-xs border border-current px-1 rounded">繁</span> 中文繁體
                   </button>
                   <button 
                     onClick={() => setLanguage('zh-CN')}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${language === 'zh-CN' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                   >
                     <span className="text-xs border border-current px-1 rounded">简</span> 中文简体
                   </button>
                   <button 
                     onClick={() => setLanguage('en')}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${language === 'en' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                   >
                     <span className="text-xs border border-current px-1 rounded">En</span> English
                   </button>
                 </div>

               </div>
             )}
           </div>
         </div>

         {/* Hero Section */}
         <div className="text-center space-y-4 mb-16 z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
               <div className="bg-gradient-to-tr from-brand-500 to-purple-500 p-3 rounded-2xl shadow-xl shadow-brand-500/20">
                 <SparklesIcon className="w-8 h-8 text-white" />
               </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Fashion <span className="text-brand-500 dark:text-brand-400">Studio</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {t.landingSubtitle}
            </p>
         </div>

         {/* Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl z-10">
            <button
              onClick={() => setViewMode('mobile')}
              className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-brand-500/50 dark:hover:border-brand-400/50 transition-all duration-300 flex flex-col items-center gap-6 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-4 bg-brand-100 dark:bg-slate-700 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <DevicePhoneMobileIcon className="w-12 h-12 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.mobileMode}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {t.mobileDesc}
                </p>
              </div>
            </button>

            <button
              onClick={() => setViewMode('web')}
              className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300 flex flex-col items-center gap-6 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-4 bg-purple-100 dark:bg-slate-700 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <ComputerDesktopIcon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.webMode}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {t.webDesc}
                </p>
              </div>
            </button>
         </div>

         {/* Footer */}
         <div className="absolute bottom-6 text-sm text-slate-400 dark:text-slate-600">
           Powered by Google Gemini & Veo
         </div>
      </div>
    );
  }

  // --- Main Application Component ---
  
  // Dynamic class for container width based on selection
  const containerClass = viewMode === 'mobile' 
    ? 'max-w-[430px] mx-auto min-h-screen border-x border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-[#0a0a0a] shadow-2xl'
    : 'w-full min-h-screen bg-gray-50 dark:bg-[#0a0a0a]';

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300`}> {/* Outer background for contrast in mobile mode */}
      <div className={`${containerClass} transition-all duration-300 relative`}>
      
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-gray-200 dark:border-white/5">
          <div className={`mx-auto px-4 h-16 flex items-center justify-between ${viewMode === 'web' ? 'max-w-6xl' : ''}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('landing')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                title={t.backHome}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  AI Fashion
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {/* View Mode Toggle (Mini) */}
               {viewMode === 'web' && (
                 <div className="hidden sm:flex items-center text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded border border-brand-200 dark:border-brand-500/20">
                    WEB MODE
                 </div>
               )}
            </div>
          </div>
        </header>

        <main className={`mx-auto px-4 py-8 pb-20 ${viewMode === 'web' ? 'max-w-5xl' : ''}`}>
          
          {/* Intro Text */}
          {status === GenerationStatus.IDLE && (
            <div className="text-center space-y-3 mb-10 animate-fadeIn">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.mainIntroTitle}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                {t.mainIntroDesc}
              </p>
            </div>
          )}

          {/* State: Waiting for Key */}
          {status === GenerationStatus.WAITING_FOR_KEY && (
             <div className="mt-12">
               <ApiKeyPrompt 
                 onSelectKey={handleSelectKey} 
                 title={hasGenerated ? t.trialTitle : t.keyTitle}
                 description={hasGenerated ? t.trialDesc : t.keyDesc}
                 getKeyLabel={t.getKeyBtn}
                 selectKeyLabel={t.selectKeyBtn}
               />
             </div>
          )}

          {/* State: Main Interface */}
          {(status === GenerationStatus.IDLE || status === GenerationStatus.ERROR) && (
            <div className="space-y-10 animate-fadeInUp">
              
              {/* Step 1: Upload Clothing */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <StepNumber num={1} />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t.uploadTitle} 
                    <span className="ml-2 text-sm font-normal text-slate-500">({selectedImages.length}/4)</span>
                  </h3>
                </div>
                
                <div className="grid place-items-center">
                  <input 
                    type="file" 
                    multiple
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleFileSelect}
                  />
                  
                  {/* Upload Area & Grid */}
                  <div className="w-full">
                    {selectedImages.length > 0 ? (
                      <div className={`grid gap-3 animate-fadeIn ${viewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                        {/* Existing Images */}
                        {selectedImages.map((img) => (
                          <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group shadow-sm">
                            <img 
                              src={img.preview} 
                              alt="Reference" 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removeImage(img.id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-transform hover:scale-110 shadow-lg"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Button (if < 4) */}
                        {selectedImages.length < 4 && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                              relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
                              ${isDragging 
                                ? 'border-brand-400 bg-brand-50 dark:bg-brand-400/10' 
                                : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800 hover:border-brand-400 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400'
                              }
                            `}
                          >
                            <PlusIcon className="w-8 h-8" />
                            <span className="text-xs font-medium">{t.addMore}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      // Empty State Upload Box
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          w-full aspect-video md:aspect-[2/1] rounded-2xl border-2 border-dashed 
                          transition-all group flex flex-col items-center justify-center gap-3 cursor-pointer
                          ${isDragging 
                            ? 'border-brand-400 bg-brand-50 dark:bg-brand-400/10 scale-[1.02]' 
                            : 'border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-400/50'
                          }
                        `}
                      >
                        <div className={`p-4 rounded-full transition-transform shadow-lg ${isDragging ? 'bg-brand-500 text-white scale-110' : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-brand-500 dark:group-hover:text-brand-400'}`}>
                          {isDragging ? (
                            <ArrowUpTrayIcon className="w-8 h-8 animate-bounce" />
                          ) : (
                            <PhotoIcon className="w-8 h-8" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`font-medium ${isDragging ? 'text-brand-600 dark:text-brand-300' : 'text-slate-600 dark:text-slate-300'}`}>
                            {isDragging ? (language === 'en' ? "Release to upload" : "释放以上传图片") : t.uploadDesc}
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{t.fileLimit}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Validation Help Text / Aspect Ratio Control for Step 1 */}
                     <div className="mt-4 flex flex-col items-center gap-3">
                         {/* Aspect Ratio Selector - Only enable if count <= 1 */}
                         {selectedImages.length > 0 && (
                            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm animate-fadeIn">
                               <button 
                                 onClick={() => setAspectRatio('9:16')}
                                 disabled={selectedImages.length > 1}
                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${aspectRatio === '9:16' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'} ${selectedImages.length > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                               >
                                 <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
                                 {t.ratioPortrait}
                               </button>
                               <div className="w-px h-4 bg-gray-200 dark:bg-slate-700"></div>
                               <button 
                                 onClick={() => setAspectRatio('16:9')}
                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${aspectRatio === '16:9' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                               >
                                 <ComputerDesktopIcon className="w-3.5 h-3.5" />
                                 {t.ratioLandscape}
                               </button>
                            </div>
                         )}

                         {/* Hints */}
                         {selectedImages.length === 1 && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" /> {t.singleImgHint}
                            </p>
                         )}
                         {selectedImages.length > 1 && (
                            <p className="text-xs text-purple-600 dark:text-purple-400/80 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" /> {t.multiImgHint}
                            </p>
                         )}
                     </div>

                  </div>
                </div>
              </section>

              <div className={`grid gap-12 ${viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                
                {/* Step 2: Select Model */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <StepNumber num={2} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.selectModel}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'female', label: t.female, icon: UserIcon },
                      { id: 'male', label: t.male, icon: UserIcon },
                    ].map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedGender(model.id as ModelGender)}
                        className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 ${
                          selectedGender === model.id
                            ? 'bg-brand-50 dark:bg-brand-600/20 border-brand-500 text-brand-700 dark:text-white shadow-md'
                            : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <model.icon className={`w-8 h-8 ${selectedGender === model.id ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="font-medium">{model.label}</span>
                        {selectedGender === model.id && (
                          <div className="absolute top-2 right-2 text-brand-500 dark:text-brand-400"><CheckCircleIcon className="w-5 h-5"/></div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Step 3: Select Action */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <StepNumber num={3} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.selectAction}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'walk', label: t.actionWalk, desc: t.descWalk },
                      { id: 'coffee', label: t.actionCoffee, desc: t.descCoffee },
                      { id: 'stretch', label: t.actionStretch, desc: t.descStretch },
                    ].map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setSelectedAction(act.id as ModelAction)}
                        className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                          selectedAction === act.id
                            ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 text-purple-900 dark:text-white shadow-md'
                            : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className={`font-medium ${selectedAction === act.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-200'}`}>{act.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{act.desc}</div>
                        </div>
                        {selectedAction === act.id && (
                          <div className="text-purple-500 dark:text-purple-400"><CheckCircleIcon className="w-6 h-6"/></div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-200 p-4 rounded-xl flex items-center gap-3 justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={selectedImages.length === 0 || !selectedGender || !selectedAction}
                  className="
                    group relative w-full max-w-md py-4 rounded-full font-bold text-lg tracking-wide
                    bg-gradient-to-r from-brand-600 to-purple-600 text-white
                    shadow-lg shadow-brand-500/30 dark:shadow-brand-900/40
                    hover:scale-[1.02] active:scale-[0.98] transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
                  "
                >
                  <span className="flex items-center justify-center gap-2">
                     <VideoCameraIcon className="w-6 h-6" />
                     {selectedImages.length > 0 ? `${t.generateBtn} (${selectedImages.length})` : t.generateBtn}
                  </span>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

            </div>
          )}

          {/* State: Loading */}
          {(status === GenerationStatus.GENERATING || status === GenerationStatus.POLLING || status === GenerationStatus.DOWNLOADING) && (
            <div className="mt-20">
              <LoadingIndicator message={progressMessage} />
            </div>
          )}

          {/* State: Result */}
          {status === GenerationStatus.SUCCESS && videoUrl && (
            <div className="mt-10">
              <VideoResult 
                videoUrl={videoUrl} 
                prompt={`Fashion Video: ${selectedGender} model, ${selectedAction}`} 
                onReset={reset} 
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;