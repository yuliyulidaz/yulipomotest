// Singleton AudioContext to avoid autoplay policy restrictions
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// iOS 등에서 사용자 액션(클릭 등)이 있을 때 미리 오디오 컨텍스트를 깨워두는 함수
export const initAudioContext = async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            console.error("Audio resume failed:", e);
        }
    }
};

export const playSuccessSound = async (isSoundEnabled: boolean, volumeLevel: number = 1) => {
    if (!isSoundEnabled) return;

    const ctx = getAudioContext();

    // 브라우저 정책으로 인해 AudioContext가 suspended 상태일 경우 깨워줍니다.
    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            console.error("Audio resume failed:", e);
        }
    }

    const now = ctx.currentTime;

    // Volume mapping: 1 -> 0.25, 2 -> 0.5, 3 -> 0.8, 4 -> 1.0
    const volumeMap = [0.25, 0.5, 0.8, 1.0];
    // Ensure index is valid (volumeLevel 1-based index 0-3)
    const masterVolume = volumeMap[Math.min(Math.max(volumeLevel, 1), 4) - 1] || 0.1;

    // Define Notes: C5, E5, G5 (Major Triad)
    const notes = [
        { freq: 523.25, time: 0.0 }, // C5
        { freq: 659.25, time: 0.1 }, // E5
        { freq: 783.99, time: 0.2 }  // G5
    ];

    notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + time;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(masterVolume, startTime + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8); // Smooth Decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.0);
    });

    // Haptic Feedback: Sync with notes (3 short pulses)
    if (navigator.vibrate) {
        setTimeout(() => navigator.vibrate(50), 0);
        setTimeout(() => navigator.vibrate(50), 100);
        setTimeout(() => navigator.vibrate(50), 200);
    }
};
