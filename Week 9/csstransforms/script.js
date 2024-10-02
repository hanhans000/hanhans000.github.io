const ball = document.querySelector(".ball");
console.log(ball);

// first we need the button

const moveButton = document.querySelector("#move-button");
console.log(moveButton);
moveButton.addEventListener("click", moveBall);

let distance = 30;
let outerWidth = outer.clientWidth / 2 - 30;
function moveBall() {
  if (distance < outerWidth) {
    ball.style.transform = `translateX(${distance}px)`;
    distance += 30;
  }
}

const rotateButton = document.querySelector("#rotate-button");
console.log(rotateButton);
moveButton.addEventListener("click", rotateBall);

let rDeg = 45;
function rotateBall() {
  ball.style.transform = `rotate(${rDeg}deg)`;
  rDeg += 45;
}

const scaleButton = document.querySelector("#scale-button");
console.log(scaleButton);
scaleButton.addEventListener("click", scaleBall);

let scaleVale = 0.9;
function scaleBall() {
  if (scaleVale > 0.2) {
    ball.style.transform = `rotate(${rDeg}deg)`;
    rDeg += 45;
  }
}
