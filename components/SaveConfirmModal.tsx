import React, { useEffect } from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';

interface SaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  characterName: string;
  isDarkMode: boolean;
}

export const SaveConfirmModal: React.FC<SaveConfirmModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  characterName,
  isDarkMode
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Bottom Drawer Content */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[610]
          rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t transform transition-transform duration-500 ease-out animate-in slide-in-from-bottom-full
          ${isDarkMode ? 'bg-[#161B22] border-[#30363D]' : 'bg-surface border-border'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Handle */}
        <div className="w-12 h-1.5 bg-border/40 rounded-full mx-auto mt-4 mb-2" />

        <div className="p-8 pt-4 space-y-8 flex flex-col items-center text-center">
          <div className="relative">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Heart size={14} className="text-rose-500 fill-rose-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-text-primary'}`}>
              {characterName} 와(과)의 시간을 저장한 파일을 다운로드 했어요.
            </h3>
            <p className={`text-sm font-medium leading-relaxed px-4 ${isDarkMode ? 'text-slate-400' : 'text-text-secondary'}`}>
              첫 화면의 Load버튼을 통해 불러올 수 있습니다.<br/>첫 화면으로 돌아가시겠어요?
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full py-4 bg-primary hover:bg-primary-light text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              조금 더 집중할거야. <Heart size={16} fill="currentColor" />
            </button>

            <button
              onClick={onGoHome}
              className={`w-full py-4 rounded-2xl font-black text-sm border transition-all active:scale-95
                ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              첫 화면으로 돌아갈래.
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
