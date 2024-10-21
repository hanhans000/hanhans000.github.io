const hoverButton = document.querySelector("#hover-button");
console.log(hoverButton);

const moreInfo = document.querySelector("#more-info");
console.log(moreInfo);

hoverButton.addEventListener("mouseover", showMoreInfo);
hoverButton.addEventListener("mouseout", hideMoreInfo);

function showMoreInfo() {
  moreInfo.classList.add("show");
}

function hideMoreInfo() {
  moreInfo.classList.remove("show");
}

// __________________________ drop down menu example
const profileButton = document.querySelector("#profile-content");
console.log(profileButton);
buttomButton.advice.addEventListener("click", gotoBottom);
function gotoBottom() {
  window.location.href = 
    "https://rmit.instructure.com/courses/128944/pages/assignment-3-interactivity-examples?module_item_id=6321814";
}

const topButton = document.querySelector("#top-button");
console.log(topButton);
topButton.addEventListener("click", gotoTop);
function gotoTop() {
  window.location.href = "#top";
}




