/* DEFINITIONS & SETUP */

// first let's retrieve references to all the elements we'll need to use
// this is the audio itself
let audioElement = document.getElementById("audioElement");
// the buttons for the controls
let playButton = document.getElementById("playButton");
let stopButton = document.getElementById("stopButton");
// the progress element
let progressBar = document.getElementById("progressBar");
// the hero image
let heroImage = document.getElementById("rotateDisk");

// let animatedDisk = the html animated disk
let animatedDisk = document.getElementById("rotateDisk");

// next we remove the controls attribute - we do this with JS rather than just not including it in the HTML tag as a fallback
// this way if the JS doesn't load for whatever reason the player will have the default built in controls
audioElement.removeAttribute("controls");
// then if the default controls are removed we can show our custom controls - we want to do this via JS so that if the JS doesn't
// load then they won't show
document.getElementById("controlsWrapper").style.display = "flex";

// then we listen for the loadedmetadata event to fire which means we'll be able to access exactly how long the piece of media is
// i'm using an arrow function here that updates the progress element's max attribute with the duration of the media
// this way when it comes to setting the progress bars value the number matches a percentage of the total duration
audioElement.addEventListener("loadedmetadata", () => {
  progressBar.setAttribute("max", audioElement.duration);
});

// some mobile devices won't fire a loadedmetadata event so we need a fallback to make sure the attribute is set in these cases - we
// can do this by also running a check whenever playback starts by using the playing event
audioElement.addEventListener("playing", () => {
  // we can then double check if the attribute has already been set - if not then set it here - ! inside of an if statement flips the
  // truth of what we're checking for - so (progressBar.getAttribute('max')) would check if there's a value and
  // (!progressBar.getAttribute('max')) checks if there is no value - ie false
  if (!progressBar.getAttribute("max")) {
    progressBar.setAttribute("max", audioElement.duration);
  }
});

/* LOADING */

// here we're adding some feedback to indicate when the audio is loading - this is pretty similar to our last experiement in that we're
// applying an animation via a class. the real difference here is when that class gets added - by listening for the waiting event which
// fires when the media is waiting to load we can add the animation to the timeline via the .classList.add() method. when we want to
// stop the animation we listen for the canplay event which fires when the media player has buffered enough data to be able to playback the
// media then we use the .classList.remove() method - if we instead wanted to wait until it has actually loaded the whole file we could
// use the canplaythrough event
audioElement.addEventListener("waiting", () => {
  progressBar.classList.add("timeline-loading");
});
audioElement.addEventListener("canplay", () => {
  progressBar.classList.remove("timeline-loading");
});

/* MEDIA FINSIHED */

// when the media finishes we want to make sure that play icon switches back over from pause to indicate that the user can restart playback
audioElement.addEventListener("ended", () => {
  playButton.style.backgroundImage = "url('./icons/play.svg')";
});

/* PLAY/PAUSE */

// we can use the .play() and .pause() methods on our media element to play and pause playback - because I want this to be triggered by
// two different events (see below) i'm going to write it as a seperate function
// by combining play and pause into the same function i'm able to make sure it does what i want - if the media is already playing i only
// ever want use .pause() (as pausing an already paused audio doesn't really make sense)
// the same goes if the media is paused or stopped i only want use .play()
function playPause() {
  // the following if statement checks to see if the media is currently paused OR if the media has finshed playing - || inside of an if
  // statement like this is how we write an OR conditional, if either of these things are true it'll trigger the block of code
  // the reason we check for both is that when the audio finishes playing it'll be in an ended state not a paused state
  if (audioElement.paused || audioElement.ended) {
    // if it isn't already playing make it play
    audioElement.play();
    // then make sure the icon on the button changes to pause indicating what it does if you click it
    playButton.style.backgroundImage = "url('pause.png')";
    document.getElementById("audioPlayOverlay").style.display = "none";

    /* ADDING IN PAUSE AND PLAY FOR ANIMATION */
    /* here I have added to the original code for the pressing pause and play 
    and I have added in that when the audio element is set to play that the css animation will trigger
    in my css I have also set the playstate of the animation on load to pause so that the animation 
    does not begin until the play button has been pressed.  */
    animatedDisk.style.animationPlayState = "running";
  } else {
    // if it is already playing make it pause
    audioElement.pause();
    // then make sure the icon on the button changes to play indicating what it does if you click it
    playButton.style.backgroundImage = "url('./play.png')";
    document.getElementById("audioPlayOverlay").style.display = "block";

    animatedDisk.style.animationPlayState = "paused";
  }
}

// now we have our function we need to attach it to two seperate events, the first is probably obvious - clicking on the play button
playButton.addEventListener("click", playPause);

// the second event we want is clicking on the hero image, a feature popularised by youtube that is now ubiquitous in online media players
heroImage.addEventListener("click", playPause);

// this feature is unfinished in my code - while it works it has no signifiers to let users know they can do this by clicking the audio
// there is already an element appropriately placed as a signifier, the <img> with the id of audioPlayerOverlay however its CSS is currently
// set to display: none - try to complete this feature by doing the following
// first you'll need to remove display: none from its css ruleset
// then you'll need to add two new statements to the playPause() function above - each will need to first find the correct element using the
// document.getElementById() and then update that element's .style.display property to equal either "block" or "none" depending on the context
// if done correctly the play overlay will only appear over the audio if paused, otherwise it should disappear when playing

/* TIMELINE */

// there's two different things we want to do with our timeline - update the progress bar to display how much has already played and let the user
// click the progress bar to scrub the audio to a specific place in the audio
// to update the progress bar we need to listen for the timeupdate event which is fired everytime the current audio time is updated - when the audio
// is playing this repeatedly fires at a constant rate
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
  // had tried changing .style.left with the below variable but nothing was working so i decided to try font size
  // and could then see that it is working properly. now I have to figure out how to make it change the position
  // of the div as the style.left was not working
  // document.getElementById("progressCircle").style.fontSize = progressPercentage + "px";

  // turns out i just needed to change the css position to relative also i added - 1.5 so that it aligns with the progress bar
  /* I decided to use this method of displaying the progress so that it would match the aesthetics and design of my player and so that I could have more freedom over how it was represented 
  as changing the progress bar itself did not provide me with the options to be able to only create a single point instead of representing as a bar.   */

  document.getElementById("progressCircle").style.left =
    progressPercentage - 1.5 + "%";
});

// the simplest version of scrubbing would be to update the audio's currentTime when the user clicks the timeline - however due to the interaction pattern
// established by youtube we should also account for a slightly different expression of user agency. the code below will work with a simple click on the
// timeline but will also allow for a user to drag their mouse on the timeline to continuously update currentTime and only end scrubbing when they release the
// mouse button. implementing this will take some more complex use of event listeners but i'll do my best to explain the design and technical implementation

// first thing we want to do is write a function that will take the current position of the the mouse in relation to the timeline and use it to change the
// currentTime property of the audio element. each time this runs we'll need to know the position of the mouse so which we'll do using the event passed to it
// by the eventlistener - to access this we need to set it as a parameter, i've used the name e but it can be called whatever you like
function scrubToTime(e) {
  // this statement has a lot going on so let's step through each part:
  // the first thing we want to work out what is the distance between the left side of the progress bar and the mouses current position - if we were just building
  // an interaction to work when the mouse is over the bar we could take this from the event, however as we want this to also work when we've held the mouse
  // down and moved it somewhere else on the page we need to work this out manually
  // e.clientX is the cursors current distance from the left edge of the page
  // we then want to minus (progressBar.getBoundingClientRect().left + window.scrollX) from this distance to account for any gap between the left edge of the
  // page and the start of the progress bar
  // audioElement.currentTime is the current position in the media file - we are setting it here to change the playback time
  // we then need to find a normalised 0-1 value based on how far along the bar the cursor is - the idea is that if i click the left most side it should return 0
  // and if i click the right most side it should return 1 - we get this value by dividing x by the total width of the progressBar
  // the value is then fed into our clampZeroOne() function - this is accounting for if our mouse is further left or further right than the ends of the progress bar
  // it works by essentially making the value always equal 1 if it is over 1 or always making it 0 if under 0 - this is commonly called a clamp, we're only allowing
  // a value to be in a certain range
  // finally we're using this clamped value to multiply with total duration of our audio thus working out where we should scrub to
  let x =
    e.clientX - (progressBar.getBoundingClientRect().left + window.scrollX);
  audioElement.currentTime =
    clampZeroOne(x / progressBar.offsetWidth) * audioElement.duration;
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

/* Mute Unmute */
function muteUnmute() {
  //check if mute unmute is working
  console.log("mute/unmute is working");
  //videoElement.muted = true;

  // check if audio is muted
  if (audioElement.muted) {
    // if muted is true set to false
    audioElement.muted = false;
    //change the icon
    muteButton.style.backgroundImage = "url('unmute.png')";
  } else {
    // if muted is false set to true
    audioElement.muted = true;
    muteButton.style.backgroundImage = "url('muted.png')";
  }
}

muteButton.addEventListener("click", muteUnmute);

/* HELPER FUNCTIONS */

function clampZeroOne(input) {
  return Math.min(Math.max(input, 0), 1);
}

function logEvent(e) {
  console.log(e);
}
