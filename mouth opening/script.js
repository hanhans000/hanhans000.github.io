
// I tried with the script powers an simple video player interface
// with minimal controls and dynamic feedback designed to center the user's attention on the media, not the UI.

const video = document.getElementById('mouthVideo');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const muteToggle = document.getElementById('muteToggle');
const videoControls = document.getElementById('videoControls');
const bgImage = document.getElementById('bgImage');

let controlTimeout;


//FULLSCREEN
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

//MUTE/UNMUTE
function updateMuteIcon() {
  if (video.muted) {
    muteToggle.classList.add('muted');
    muteToggle.classList.remove('unmuted');
  } else {
    muteToggle.classList.remove('muted');
    muteToggle.classList.add('unmuted');
  }
}

muteToggle.addEventListener('click', () => {
  video.muted = !video.muted;
  updateMuteIcon();
});

//CONTROLS
playBtn.addEventListener('click', togglePlayPause);
fullscreenBtn.addEventListener('click', toggleFullscreen);

video.addEventListener('dblclick', toggleFullscreen);
video.addEventListener('click', () => {
  video.muted = !video.muted;
  updateMuteIcon();
});

video.addEventListener('play', resetControlTimer);
video.addEventListener('pause', showControls);

//SHOW/HIDE CONTROLS
function showControls() {
  videoControls.classList.remove('hide');
  resetControlTimer();
}

function hideControls() {
  videoControls.classList.add('hide');
}

function resetControlTimer() {
  clearTimeout(controlTimeout);
  controlTimeout = setTimeout(() => {
    if (!video.paused) hideControls();
  }, 2500);
}

['mousemove', 'click', 'touchstart'].forEach(event => {
  document.addEventListener(event, showControls);
});

//SCROLL to BLUR
document.addEventListener('wheel', (e) => {
  const blur = Math.min(Math.max(e.deltaY / 50, 0), 15); // clamp blur 0–15px
  bgImage.style.filter = `blur(${blur}px)`;
});

