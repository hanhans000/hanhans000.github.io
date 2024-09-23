// const myButton = document.querySelector("#my-button");
// console.log(myButton);

// const count = document.querySelector("#count");
// console.log(count);

// let buttonCount = 0;
// myButton.addEventListener("click", myFunction);

// function myFunction() {
//   // buttonCount = buttonCount +1;
//   buttonCount++;
//   console, log("hey did you just click me?");
//   count.textContent = buttonCount;
// }

const boxContainer = document.querySelector(".box-container");
console.log(boxContainer);

const toggleButton = document.querySelector("#toggle-button");
console.log(toggleButton);

toggleButton.addEventListener("click", toggleMe);

function toggleMe() {
  console.log("toggle button is clicked");
  boxContainer.classList.toggle("row-reverse");
}

const addButton = document.querySelector("#add-button");

// const addButton = document.querySelector("#add-button");
console.log(addButton);

addButton.addEventListener("click", addMe);
let count = 0;
function addMe() {
  console.log("add button is clicked");
  //   boxContainer.innerHTML += `<div class="box purple-box"></div>`;
  // }

  if (count % 2 === 0) {
    boxContainer.innerHTML += `<div class="box purple-box"></div>`;
  } else {
    boxContainer.innerHTML += `<div class="box coral-box"></div>`;
  }
  count++;
}

// let removeButton = document.querySelectorAll("#remove-button");
// removeButton.addEventListener("dblclick", removeMe);

// function removeMe() {
//     let lastBox =
// }

// count = 4
// 4 % 2 = 0
// 4/2 = 2  0

// 5 / 2 = 2 reminder 1
// 5 % 2 = 1

// 7 % 2 = 1
// 60 % 2 = 0

boxContainer.addEventListener("mouseover", dropMe);
function dropMe() {
  boxContainer.classList.add("drop");
}
boxContainer.addEventListener("moouseout", pickMe);

function pickMe() {
  console.log("pick me");
  boxContainer.classList.remove("drop");
}

// addButton.addEventListener("mouse");
