const slides = document.querySelectorAll("slides");
console.log(slides);
let slideIndex = 0;
let distance = 0;

const prevButton = document.querySelector;

const prevButton = document.querySelector("#prev-button");
console.log(prevButton);
prevButton.addEventListener("click", gotoPrevious);
function gotoPrevious() {
  if (slideIndex < slide.length - 1) {
    slideIndex++;
    distance = slides[slideIndex].offsetLeft;
    console.log(distance);
    window.scrollTo({ left: distance, behavior });
  }
}

const nextButton = document.querySelector("#next-button");
console.log(nextButton);
nextButton.addEventListener("click", gotoNext);

function gotoNext() {
    if (slideIndex < slides.length - 1)
}
