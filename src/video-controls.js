/**
 * Video Controls Handler
 * Manages play/pause cursor interactions and mute/unmute button
 */

let videoAnimation = null;
let clickOverlay = null;
let muteButton = null;

/**
 * Initialize video controls
 * @param {VideoPanelShader} videoAnimationInstance - The video animation instance
 */
export function initVideoControls(videoAnimationInstance) {
    videoAnimation = videoAnimationInstance;
    clickOverlay = document.querySelector('#video-click-overlay');
    muteButton = document.querySelector('#video-mute-button');

    if (!clickOverlay || !videoAnimation) return;

    // Add click handler for play/pause
    clickOverlay.addEventListener('click', handleOverlayClick);

    // Add hover handlers for custom cursor
    clickOverlay.addEventListener('mouseenter', updateCursor);
    clickOverlay.addEventListener('mousemove', updateCursor);
    clickOverlay.addEventListener('mouseleave', () => {
        clickOverlay.style.cursor = 'default';
    });

    // Add mute button handler
    if (muteButton) {
        muteButton.addEventListener('click', handleMuteClick);
        updateMuteButton();
    }

    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handle overlay click for play/pause
 */
function handleOverlayClick(e) {
    if (!videoAnimation) return;
    
    const isPlaying = videoAnimation.togglePlayPause();
    updateCursor();
}

/**
 * Update cursor based on video state
 */
function updateCursor() {
    if (!clickOverlay || !videoAnimation) return;
    
    const isPlaying = videoAnimation.getIsPlaying();
    const cursorImage = isPlaying ? '/assets/pause-cursor.png' : '/assets/play-cursor.png';
    clickOverlay.style.cursor = `url('${cursorImage}') 24 24, pointer`;
}

/**
 * Handle mute button click
 */
function handleMuteClick() {
    if (!videoAnimation || !muteButton) return;
    
    const isMuted = videoAnimation.getIsMuted();
    videoAnimation.setMuted(!isMuted);
    updateMuteButton();
}

/**
 * Update mute button appearance
 */
function updateMuteButton() {
    if (!videoAnimation || !muteButton) return;
    
    const isMuted = videoAnimation.getIsMuted();
    const icon = muteButton.querySelector('.mute-icon');
    
    if (icon) {
        icon.textContent = isMuted ? '🔇' : '🔊';
    }
    
    muteButton.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
    muteButton.title = isMuted ? 'Unmute video' : 'Mute video';
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyPress(e) {
    if (!videoAnimation) return;
    
    // Only handle if overlay is in viewport
    const rect = clickOverlay?.getBoundingClientRect();
    if (!rect) return;
    
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isInViewport) return;
    
    // Space or K for play/pause
    if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        videoAnimation.togglePlayPause();
        updateCursor();
    }
    
    // M for mute/unmute
    if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const isMuted = videoAnimation.getIsMuted();
        videoAnimation.setMuted(!isMuted);
        updateMuteButton();
    }
}

/**
 * Cleanup event listeners
 */
export function cleanupVideoControls() {
    if (clickOverlay) {
        clickOverlay.removeEventListener('click', handleOverlayClick);
        clickOverlay.removeEventListener('mouseenter', updateCursor);
        clickOverlay.removeEventListener('mousemove', updateCursor);
    }
    
    if (muteButton) {
        muteButton.removeEventListener('click', handleMuteClick);
    }
    
    document.removeEventListener('keydown', handleKeyPress);
}
