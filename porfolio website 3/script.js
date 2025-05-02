const toggleBtn = document.getElementById("viewToggle");
const projectContainer = document.getElementById("projects");
const cards = document.querySelectorAll(".card");
const allTags = document.querySelectorAll(".tag");
const allTabs = document.querySelectorAll(".tab");

let inGrid = false;
let activeIndex = null;

function resetStack() {
  cards.forEach((card, index) => {
    card.style.transform = `translateX(-50%) translateY(${index * 100}px) scale(0.84) rotateX(-15deg)`;
    card.style.zIndex = 5 - index;
  });
}

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (inGrid) return;
    if (activeIndex === index) {
      activeIndex = null;
      resetStack();
    } else {
      activeIndex = index;
      cards.forEach((c, i) => {
        if (i === index) {
          c.style.transform = `translateX(-50%) translateY(0px) scale(0.86) rotateX(-5deg)`;
          c.style.zIndex = 99;
        } else {
          const offset = 350 + (i * 10);
          c.style.transform = `translateX(-50%) translateY(${offset}px) scale(0.8) rotateX(-10deg)`;
          c.style.zIndex = 1;
        }
      });
    }
  });
});

toggleBtn.addEventListener("click", () => {
  inGrid = !inGrid;
  if (inGrid) {
    projectContainer.classList.add("grid-mode");
    toggleBtn.textContent = "Switch to Stack View";
  } else {
    projectContainer.classList.remove("grid-mode");
    toggleBtn.textContent = "Switch to Grid View";
    resetStack();
  }
});

allTags.forEach(tag => {
  tag.addEventListener("mouseenter", () => {
    const tagCategory = [...tag.classList].find(cls => cls.startsWith("tag-"));
    allTags.forEach(t => {
      if (!t.classList.contains(tagCategory)) {
        t.classList.add("grayed-out");
      }
    });
    allTabs.forEach(tab => {
      if (!tab.classList.contains(tagCategory)) {
        tab.classList.add("grayed-out");
      }
    });
  });

  tag.addEventListener("mouseleave", () => {
    allTags.forEach(t => t.classList.remove("grayed-out"));
    allTabs.forEach(tab => tab.classList.remove("grayed-out"));
  });
});

resetStack();
