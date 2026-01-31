// Play audio
export function playSound(audio) {
    try {
        audio.currentTime = 0;
        audio.play().catch(() => { });
    } catch (error) {
        console.error('Audio play error:', error);
    }
}