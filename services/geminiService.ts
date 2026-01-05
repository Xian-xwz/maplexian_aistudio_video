import { GoogleGenAI } from "@google/genai";
import { ModelGender, ModelAction, AspectRatio } from "../types";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

const MESSAGES: Record<string, any> = {
  'zh-TW': {
    build: "正在構建時尚場景...",
    init: "初始化 Veo 模型...",
    fusing: "AI 正在融合多張參考圖 (可能需要較長時間)...",
    generating: "AI 正在生成模特動態...",
    rendering: "正在渲染光影與材質...",
    downloading: "正在下載影片...",
    errorEmpty: "請至少上傳一張參考圖片",
    errorGen: "影片生成失敗",
    errorLink: "未能獲取影片下載連結",
    errorDownload: "影片下載失敗"
  },
  'zh-CN': {
    build: "正在构建时尚场景...",
    init: "初始化 Veo 模型...",
    fusing: "AI 正在融合多张参考图 (可能需要较长时间)...",
    generating: "AI 正在生成模特动态...",
    rendering: "正在渲染光影与材质...",
    downloading: "正在下载视频...",
    errorEmpty: "请至少上传一张参考图片",
    errorGen: "视频生成失败",
    errorLink: "未能获取视频下载链接",
    errorDownload: "视频下载失败"
  },
  'en': {
    build: "Building fashion scene...",
    init: "Initializing Veo model...",
    fusing: "AI is fusing multiple reference images (may take longer)...",
    generating: "AI is generating model motion...",
    rendering: "Rendering lighting and materials...",
    downloading: "Downloading video...",
    errorEmpty: "Please upload at least one reference image",
    errorGen: "Video generation failed",
    errorLink: "Could not get video download link",
    errorDownload: "Video download failed"
  }
};

/**
 * Handles the interaction with the Veo model to generate fashion videos.
 * Supports multiple reference images.
 */
export const generateFashionVideo = async (
  images: ImageInput[],
  gender: ModelGender,
  action: ModelAction,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void,
  language: string = 'zh-TW'
): Promise<string> => {
  
  const t = MESSAGES[language] || MESSAGES['zh-TW'];
  // Replaced import.meta.env with process.env
  const apiKey = "AIzaSyC1jbG6xtCnWvFnsvsCt7HrBLZZuFEEn_M";
  const ai = new GoogleGenAI({ apiKey });

  if (images.length === 0) {
    throw new Error(t.errorEmpty);
  }

  onProgress(t.build);

  const genderTerm = gender === 'male' ? 'male model' : 'female model';
  
  let actionDescription = "";
  switch (action) {
    case 'walk':
      actionDescription = "walking confidently down a high-fashion runway, full body shot";
      break;
    case 'coffee':
      actionDescription = "sitting in a chic cafe holding a cup of coffee, looking relaxed, upper body shot";
      break;
    case 'stretch':
      actionDescription = "standing in a bright studio, stretching arms elegantly, showing off the outfit";
      break;
  }

  const prompt = `A cinematic video of a ${genderTerm} wearing the clothing/outfit shown in the reference images. The model is ${actionDescription}. High fashion aesthetic, realistic lighting, 4k resolution, highly detailed texture.`;

  onProgress(t.init);

  let modelParams: any;
  
  // Strategy: 
  // 1 Image -> Use Fast model (Supports 9:16 Portrait)
  // >1 Images -> Use Base model (Supports multiple references, usually requires 16:9)
  if (images.length === 1) {
    modelParams = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: images[0].base64Data,
        mimeType: images[0].mimeType
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio // Use user selection
      }
    };
  } else {
    // Veo 3.1 Base model allows up to 3 reference images according to docs.
    // We will take up to 3 images to ensure stability, or 4 if the API allows it in practice,
    // but strictly speaking the prompt context mentioned "up to 3".
    // We'll slice to 3 to be safe and robust.
    const refs = images.slice(0, 3).map(img => ({
      image: {
        imageBytes: img.base64Data,
        mimeType: img.mimeType
      },
      referenceType: 'ASSET' 
    }));

    modelParams = {
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9', // Base model typically requires 16:9 with reference images
        referenceImages: refs
      }
    };
  }

  let operation = await ai.models.generateVideos(modelParams);

  onProgress(images.length > 1 ? t.fusing : t.generating);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    onProgress(t.rendering);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
    throw new Error(operation.error.message || t.errorGen);
  }

  const generatedVideo = operation.response?.generatedVideos?.[0];
  const downloadLink = generatedVideo?.video?.uri;

  if (!downloadLink) {
    throw new Error(t.errorLink);
  }

  onProgress(t.downloading);

  // Append key from env
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  
  if (!response.ok) {
     throw new Error(`${t.errorDownload}: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const checkApiKeyStatus = async (): Promise<boolean> => {
  // Check for API_KEY first
  if (process.env.API_KEY) {
    return true;
  }

  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true;
};

export const requestApiKeySelection = async (): Promise<void> => {
  if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key picker not available.");
  }
};
