import { GoogleGenAI } from "@google/genai";

const MODEL_NICKNAMES: Record<string, string> = {
  'gemini-2.5-flash': '2.5',
  'gemini-2.5-flash-lite': '2.5L',
  'gemini-3-flash-preview': '3.0', 
  'gemini-3.1-flash-lite-preview': '3.1L',
  'gemini-1.5-pro': 'PRO',
  'gemini-1.5-flash': '1.5'
};

const STORAGE_KEY_MODEL_TURN = 'yulipomo_model_turn_index';

let currentActiveModel = '-';
let globalBlockUntil: number | null = null; 
let lastUsedKey: string | null = null;

export const getActiveModel = () => currentActiveModel;

export const resetGeminiSystem = () => {
  globalBlockUntil = null;
};

const getNextTurnPriority = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY_MODEL_TURN);
  let turnIndex = stored ? parseInt(stored, 10) : 0;

  const nextIndex = turnIndex === 0 ? 1 : 0;
  localStorage.setItem(STORAGE_KEY_MODEL_TURN, nextIndex.toString());

  if (turnIndex === 0) {
    return [
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite'
    ];
  } else {
    return [
      'gemini-3.1-flash-lite-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite'
    ];
  }
};

export const generateWithFallback = async (
  apiKey: string,
  prompt: string,
  safetySettings: any,
  jsonSchema: any = null
) => {
  if (lastUsedKey !== null && apiKey !== lastUsedKey) {
    globalBlockUntil = null;
  }
  lastUsedKey = apiKey;

  if (globalBlockUntil) {
    const now = Date.now();
    if (now < globalBlockUntil) {
      const waitMin = Math.ceil((globalBlockUntil - now) / 60000);
      throw new Error(`[서버 과부하] 모든 AI가 숨을 고르고 있습니다. ${waitMin}분 뒤에 다시 시도해주세요. ☕`);
    } else {
      globalBlockUntil = null;
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;
  const currentPriority = getNextTurnPriority();

  for (const modelName of currentPriority) {
    try {
      const config: any = { safetySettings: safetySettings };
      if (jsonSchema) {
        config.responseMimeType = "application/json";
        if (typeof jsonSchema === 'object') {
            config.responseSchema = jsonSchema;
        }
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config,
      });

      currentActiveModel = MODEL_NICKNAMES[modelName] || 'Unknown';
      return response;

    } catch (e: any) {
      if (e.status === 400 || e.message?.includes('API_KEY')) {
        throw new Error("API 키가 올바르지 않습니다. 키를 확인해주세요.");
      }
      lastError = e;
    }
  }

  console.error("🚨 비상! 모든 모델이 막혔습니다. 5분간 쿨타임 가동.");
  globalBlockUntil = Date.now() + (5 * 60 * 1000); 
  throw new Error("모든 AI 모델이 응답하지 않습니다. (5분 대기)");
};