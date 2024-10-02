/* DEFINITIONS & SETUP */
let audioElement = document.getElementById("audioElement");
// the buttons for the controls
let playButton = document.getElementById("playButton");
let stopButton = document.getElementById("stopButton");
// the progress element
let progressBar = document.getElementById("progressBar");
// the image
let heroImage = document.getElementById("rotateDisk");

// let animatedDisk = the html animated disk
let animatedDisk = document.getElementById("rotateDisk");

audioElement.removeAttribute("controls");

document.getElementById("controlsWrapper").style.display = "flex";

audioElement.addEventListener("loadedmetadata", () => {
  progressBar.setAttribute("max", audioElement.duration);
});

audioElement.addEventListener("playing", () => {
  if (!progressBar.getAttribute("max")) {
    progressBar.setAttribute("max", audioElement.duration);
  }
});

audioElement.addEventListener("waiting", () => {
  progressBar.classList.add("timeline-loading");
});
audioElement.addEventListener("canplay", () => {
  progressBar.classList.remove("timeline-loading");
});

// when the media finishes we want to make sure that play icon switches back over from pause to indicate that the user can restart playback
audioElement.addEventListener("ended", () => {
  playButton.style.backgroundImage = "url('./icons/play.svg')";
});

/* PLAY/PAUSE */

function playPause() {
  if (audioElement.paused || audioElement.ended) {
    audioElement.play();
    playButton.style.backgroundImage = "url('pause.png')";

    animatedDisk.style.animationPlayState = "running";
  } else {
    audioElement.pause();
    playButton.style.backgroundImage = "url('./play.png')";
    animatedDisk.style.animationPlayState = "paused";
  }
}

playButton.addEventListener("click", playPause);

heroImage.addEventListener("click", playPause);

/* TIMELINE */

audioElement.addEventListener("timeupdate", () => {
  // this statement is simple - we update the progress bar's value attribute with the currentTime property of the audio, because timeupdate runs everytime
  // currentTime is changed it'll update both as the audio plays and if we were to skip or stop the audio
  progressBar.value = audioElement.currentTime;

  /* CURRENT PROGRESS IN MM:SS */

  //updatinglog with the current time
  //console.log(parseInt(videoElement.currentTime))
  let currentLengthOnlySec = parseInt(audioElement.currentTime);
  // console.log(currentLength);

  // converting seconds to a time 00:00

  function convertingToTime(currentLengthOnlySec) {
    // calculate how many minutes are in the currentLengthOnlySec so that if there was 73 it would be 1.2111 and telling it to round down to the nearest whole number / integer
    var minutes = Math.floor(currentLengthOnlySec / 60);
    // setting the remaining seconds to calculate the currentLengthOnlySec minus the minutes variable that is * by 60 so if the current length num was 73 the equation would equal 13
    var remainingSeconds = currentLengthOnlySec - minutes * 60;
    // joining minutes and remainingSeconds, adding in a 0 in front of remainingSeconds if the value is lower than 10 so that numbers will appear in the same format even when single digit.
    var formattedTime =
      minutes + " : " + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
    return formattedTime;
  }

  var formattedTime = convertingToTime(currentLengthOnlySec); // Call the function and get the result
  // get the id of the div in my html and assign the text content to the formatted time
  document.getElementById("currentLengthNum").textContent = formattedTime;

  /* TOTAL DURATION IN MM:SS */

  /*  Creating a new variable and assigning the audio element duration to it with a parse function so the number is rounded  */
  let totalDurationOnlySec = parseInt(audioElement.duration);
  /* calling the math function I created for convertingToTime and applying it to the newly parsed total duration var i have created  */
  var totalDurationConverted = convertingToTime(
    totalDurationOnlySec - currentLengthOnlySec
  );
  /* assigning the output time to the id totalDuration that is in my html  */
  document.getElementById("totalDuration").textContent = totalDurationConverted;

  // adding a percentage amount to be able to add a circle where the progress is
  progressPercentage = (currentLengthOnlySec / totalDurationOnlySec) * 100;
  // testing print to console as a whole number %
  console.log(parseInt(progressPercentage) + "%");

  document.getElementById("progressSlide").style.left =
    progressPercentage - 1.5 + "%";
});

function scrubToTime(e) {
  let x =
    e.clientX - (progressBar.getBoundingClientRect().left + window.scrollX);
  let newTime =
    clampZeroOne(x / progressBar.offsetWidth) * audioElement.duration;

  // Check if newTime is a valid number and finite before assigning it
  if (isFinite(newTime) && newTime >= 0 && newTime <= audioElement.duration) {
    audioElement.currentTime = newTime;
  } else {
    console.error("Invalid time value: ", newTime); // Debugging info if the value is invalid
  }
}

// Helper function to clamp the value between 0 and 1
function clampZeroOne(input) {
  return Math.min(Math.max(input, 0), 1);
}

// the click event fires only if the user presses the mouse down and then releases it on the same element. we can allow for a wider range of interactions by
// further breaking this down this into its discrete parts and listening to both the mousedown and mouseup events seperately

progressBar.addEventListener("mousedown", scrubToTime);
progressBar.addEventListener("mousedown", (e) => {
  // the behaviour here is to listen to the mousemove event (fired when the user moves their mouse) when the click is held down but then to stop listening to that
  // event when the mouse click is released
  window.addEventListener("mousemove", scrubToTime);
  window.addEventListener("mouseup", () => {
    window.removeEventListener("mousemove", scrubToTime);
  });
});

// Mute button functionality
function muteAudio() {
  // Mute the audio
  audioElement.muted = true;
  console.log("Audio muted");
}

// Unmute button functionality
function unmuteAudio() {
  // Unmute the audio
  audioElement.muted = false;
  console.log("Audio unmuted");
}

// Add event listeners for both buttons
muteButton.addEventListener("click", muteAudio);
unmuteButton.addEventListener("click", unmuteAudio);

/* HELPER FUNCTIONS */

function clampZeroOne(input) {
  return Math.min(Math.max(input, 0), 1);
}

function logEvent(e) {
  console.log(e);
}

// Array of audio files in the correct order
const audioTracks = [
  "https://ia802706.us.archive.org/24/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/Hummingbird%20%28Metro%20Boomin%20%26%20James%20Blake%29.mp3", // Hummingbird
  "https://dn720300.ca.archive.org/0/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/Nas%20Morales%20%28Metro%20Boomin%20%26%20Nas%29.mp3", // Nas Morales
  "https://dn720300.ca.archive.org/0/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/All%20The%20Way%20Live%20%28Spider-Man%20Across%20the%20Spider-Verse%29%20%28Metro%20Boomin%20%26%20Future%2C%20Lil%20Uzi%20Vert%29.mp3", // All The Way Live
];

let currentTrackIndex = 0; // Start at the first track (Hummingbird)

// Function to load and play a new track
function loadTrack(index) {
  currentTrackIndex = index; // Update current track index
  audioElement.src = audioTracks[index]; // Set the audio source
  audioElement.load(); // Load the new track
  audioElement.play(); // Play the track

  // Update the track button colors based on the current track
  updateTrackButtonColors(index);
}

// Event listener for Next Button
nextButton.addEventListener("click", () => {
  // Move to the next track in the array, and loop back to the first if at the end
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
  loadTrack(currentTrackIndex);
});

// Event listener for Previous Button
prevButton.addEventListener("click", () => {
  // Move to the previous track in the array, and loop to the last track if at the start
  currentTrackIndex =
    (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
  loadTrack(currentTrackIndex);
});

// When the track ends, automatically go to the next track
audioElement.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
  loadTrack(currentTrackIndex);
});

// Progress bar update logic
audioElement.addEventListener("timeupdate", () => {
  progressBar.value = audioElement.currentTime;
});

document.addEventListener("DOMContentLoaded", function () {
  // Define the audio track array
  const audioTracks = [
    "https://ia802706.us.archive.org/24/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/Hummingbird%20%28Metro%20Boomin%20%26%20James%20Blake%29.mp3",
    "https://dn720300.ca.archive.org/0/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/Nas%20Morales%20%28Metro%20Boomin%20%26%20Nas%29.mp3",
    "https://dn720300.ca.archive.org/0/items/metro-boomin-presents-spider-man-across-the-spider-verse-soundtrack-from-and-ins/All%20The%20Way%20Live%20%28Spider-Man%20Across%20the%20Spider-Verse%29%20%28Metro%20Boomin%20%26%20Future%2C%20Lil%20Uzi%20Vert%29.mp3",
  ];

  const audioElement = document.getElementById("audioElement");
  const progressBar = document.getElementById("progressBar");
  const currentLengthNum = document.getElementById("currentLengthNum");

  // Function to load and play the selected track
  function loadTrack(index) {
    audioElement.src = audioTracks[index];
    audioElement.load(); // Reload the audio with the new source

    // Reset the progress bar and current time display when a new track is loaded
    progressBar.value = 0;
    currentLengthNum.textContent = "00:00";

    // Play the new track
    audioElement.play();
  }

  // Add event listeners to the track list buttons
  const trackButtons = document.querySelectorAll(".track-button");
  trackButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const trackIndex = button.getAttribute("data-track-index");
      loadTrack(trackIndex);
    });
  });

  // Update progress bar max when track metadata is loaded
  audioElement.addEventListener("loadedmetadata", () => {
    progressBar.setAttribute("max", audioElement.duration);
  });

  // Update progress bar value as the track plays
  audioElement.addEventListener("timeupdate", () => {
    progressBar.value = audioElement.currentTime;

    // Update current time display in mm:ss format
    let minutes = Math.floor(audioElement.currentTime / 60);
    let seconds = Math.floor(audioElement.currentTime % 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    currentLengthNum.textContent = minutes + ":" + seconds;
  });
});

// Get the track buttons and store them in an array
const trackButtons = document.querySelectorAll(".track-button");

// Function to update the track button colors
function updateTrackButtonColors(currentTrackIndex) {
  trackButtons.forEach((button, index) => {
    if (index == currentTrackIndex) {
      button.classList.add("active"); // Add the active class to the currently playing track
    } else {
      button.classList.remove("active"); // Remove the active class from other tracks
    }
  });
}

// Function to load and play a new track
function loadTrack(index) {
  audioElement.src = audioTracks[index];
  audioElement.load(); // Reload the audio with the new source
  audioElement.play(); // Play the new track

  // Update the button colors based on the current track
  updateTrackButtonColors(index);
}

// Event listener for Next Button
nextButton.addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length; // Loop through tracks
  loadTrack(currentTrackIndex);
});

// Event listener for Previous Button
prevButton.addEventListener("click", () => {
  currentTrackIndex =
    (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length; // Loop through tracks
  loadTrack(currentTrackIndex);
});

// Event listener for Track Buttons
trackButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    loadTrack(index); // Load the track when the button is clicked
  });
});

// When the track ends, automatically go to the next track
audioElement.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
  loadTrack(currentTrackIndex);
});
