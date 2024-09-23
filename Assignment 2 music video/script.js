// Sync Lyrics with Video
const video = document.querySelector("video");
const lyrics = [
  "It's okay to just admit that you're jealous of me",
  "Yeah, I heard you talk about me, that's the word on the street",
  "You're obsessing, just confess it, put your hands up",
  "It's obvious I'm your number one",
  "It's alright to just admit that I'm the fantasy",
  "You're obsessing, just confess it 'cause it's obvious",
  "I'm your number one, I'm your number one",
  "I'm your number one, yeah",
  "I'm just living that life",
  "Von Dutch, cult classic, but I still pop",
  "I get money, you get mad because the bank's shut",
  "Yeah, I know your little secret, put your hands up",
  "It's so obvious I'm your number one, life",
  "Von Dutch, cult classic in your eardrums",
  "Why you lying? You won't fuck unless he famous",
  "Do that little dance, without it, you'd be nameless",
  "It's so obvious I'm your number one",
  "I'm your number one, I'm your number one",
  "I'm your number one, yeah, it's so obvious",
  "I'm your number one, I'm your number one",
  "I'm your number one, yeah, it's so obvious",
];

const times = [
  1, 5, 10, 14, 18, 22, 26, 30, 35, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78,
  82,
];

const lyricsElement = document.getElementById("lyrics");

// Update lyrics display based on video time
video.addEventListener("timeupdate", () => {
  const currentTime = Math.floor(video.currentTime);
  let currentIndex = 0;

  // Find the current lyric index based on the current video time
  for (let i = 0; i < times.length; i++) {
    if (currentTime >= times[i]) {
      currentIndex = i;
    }
  }

  // Display previous, current, and next line
  const previousLine = currentIndex - 1 >= 0 ? lyrics[currentIndex - 1] : "";
  const currentLine = lyrics[currentIndex];
  const nextLine =
    currentIndex + 1 < lyrics.length ? lyrics[currentIndex + 1] : "";

  // Build the lyrics HTML with highlighted lines
  lyricsElement.innerHTML = `
    <p class="highlight">${previousLine}</p>
    <p class="highlight">${currentLine}</p>
    <p>${nextLine}</p>
  `;
});

// Toggle Lyrics Overlay Button
const toggleLyricsBtn = document.getElementById("toggle-lyrics-btn");
const lyricsOverlay = document.getElementById("lyrics-overlay");

toggleLyricsBtn.addEventListener("click", () => {
  lyricsOverlay.classList.toggle("hidden");
});

// More Info Button Interaction
const infoBtn = document.getElementById("info-btn");
const moreInfo = document.getElementById("more-info");

infoBtn.addEventListener("click", () => {
  moreInfo.classList.toggle("hidden");
});

// Share Buttons
document.getElementById("share-twitter").addEventListener("click", () => {
  window.open(
    "https://twitter.com/share?text=Check%20out%20Von%20Dutch%20by%20Charli%20XCX!"
  );
});

const body = document.querySelector("body");
const lightModeToggle = document.getElementById("light-mode-toggle");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const sunsetModeToggle = document.getElementById("sunset-mode-toggle");

lightModeToggle.addEventListener("click", () => {
  body.classList.remove("dark-mode", "sunset-mode");
  body.classList.add("light-mode");
});

darkModeToggle.addEventListener("click", () => {
  body.classList.remove("light-mode", "sunset-mode");
  body.classList.add("dark-mode");
});

sunsetModeToggle.addEventListener("click", () => {
  body.classList.remove("light-mode", "dark-mode");
  body.classList.add("sunset-mode");
});
