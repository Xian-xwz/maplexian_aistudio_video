export enum GenerationStatus {
  IDLE = 'IDLE',
  CHECKING_KEY = 'CHECKING_KEY',
  WAITING_FOR_KEY = 'WAITING_FOR_KEY',
  GENERATING = 'GENERATING',
  POLLING = 'POLLING',
  DOWNLOADING = 'DOWNLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface VideoGenerationResult {
  videoUrl: string;
  mimeType: string;
}

export type ModelGender = 'female' | 'male';
export type ModelAction = 'walk' | 'coffee' | 'stretch';
export type AspectRatio = '9:16' | '16:9';

// Augment window for the AI Studio key picker
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}