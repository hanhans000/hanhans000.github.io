const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");
const tracks = document.querySelectorAll(".track");

// Update the current time in the display
audioPlayer.addEventListener("timeupdate", () => {
  const currentTime = audioPlayer.currentTime;
  const duration = audioPlayer.duration;
  progressBar.value = (currentTime / duration) * 100;

  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  currentTimeDisplay.innerText = `${minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
});

// Jump to specific track
tracks.forEach((track) => {
  track.addEventListener("click", () => {
    const time = track.getAttribute("data-time");
    audioPlayer.currentTime = time;
    audioPlayer.play();
  });
});

// Control progress bar dragging
progressBar.addEventListener("input", () => {
  const newTime = (progressBar.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
});
