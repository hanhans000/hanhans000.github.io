function checkWeather() {
  let tempt = document.querySelector("#temp");
  let body = document.querySelector("body");
  let outer = document.querySelector("outer");
  console.log(temp.value);
  console.log(temp.value);
  if (temp.value >= 40) {
    body.style.backgroundColor = "red";
    outer.style.backgroundColor = "blue";
    console.log("it is burning hot");
  } else if (temp.value < 40 && temp.value >= 30) {
    body.style.backgroundColor = "limegreen";
    outer.style.backgroundColor = "peach";
    console.log("it is pleasant weather");
  } else if (temp.value < 30 && temp.value >= 15) {
    body.style.backgroundColor = "aqua";
    outer.style.backgroundColor = "purple";
    console.log("it is pleasant weather");
  } else {
    body.style.backgroundColor = "grey";
    console.log("it is freezing");
  }
}
