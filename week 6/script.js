function checkGrade() {
  const a1 = document.querySelector("#answer1");
  console.log(a1.value);
  const a2 = document.querySelector("#answer2");
  console.log(a2.value);
  //   let a1value = parseFloat(a1.value);
  //   let a2value = parseFloat(a2.value);
  let total = parseFloat(a1.value) + parseFloat(a2.value);
  console.log(total);
  giveReport(total);
}

function calculateTotal(a, b) {
  let sum = a + b;
  return sum;
}

function giveReport(score) {
  const report = document.querySelector("#report");
  if (score > 30) {
    console.log("you got HD");
    report.textContent = "you got HD";
  } else if (score > 20 && score <= 30) {
    console.log("you got DI");
    report.textContent = "you got DI";
    report.textContent = "you got DI";
  }
}

const para1 = document.querySelector("p1");
console.log(para1.textContent);
para1.textContent = "What is your Assignment 1 score?";

const para2 = document.querySelector("p2");
console.log(para2.textContent);
para2.textContent = "What is your Assignment 2 score?";

// const para = document.querySelector("p");
// console.log(para);

const heading = document.querySelector("h1");
console.log(heading.textContent);

heading.textContent = "new heading";
heading.classList.add("red-heading");
heading.classList.add("blue-heading");
heading.classList.remove("blue-heading");

// const abcd = document.querySelector(".abcd");
// console.log(abcd);

// const allAbcd = document.querySelectorAll(".abcd");
// console.log(allAbcd);
