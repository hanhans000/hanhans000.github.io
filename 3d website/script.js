// Global state for world rotation (only X & Y)
let rotX = 0, rotY = 0;
const rotSpeed = 0.4; // Adjust rotation speed factor

// The cube size is now responsive via CSS variable (updated by window resize)
function updateCubeSize() {
  // Set cube size to, for example, 30% of the smaller viewport dimension
  const size = Math.max(150, Math.min(window.innerWidth, window.innerHeight) * 0.3);
  document.documentElement.style.setProperty('--cube-size', size + 'px');
}

// Update on load and on window resize
window.addEventListener('resize', updateCubeSize);
updateCubeSize();

// Grab the world element and gizmo container
const worldEl = document.getElementById('world');

// Mouse drag rotation for world (only X & Y)
let isDragging = false;
let prevX = 0, prevY = 0;
document.addEventListener('mousedown', e => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
  document.body.style.cursor = 'grabbing';
});
document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = 'grab';
});
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const deltaX = e.clientX - prevX;
  const deltaY = e.clientY - prevY;
  prevX = e.clientX;
  prevY = e.clientY;
  rotY += deltaX * rotSpeed; // update yaw
  rotX -= deltaY * rotSpeed; // update pitch
  updateTransforms();
});

// Update world transform based on current rotations
function updateTransforms() {
  worldEl.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

// (Optional) Remove the mouse wheel zoom of the cube if not desired
// Comment or remove this section if the cube should not be zoomable.
// document.addEventListener('wheel', e => {
//   e.preventDefault();
//   // If you want to allow zoom, update cubeScale and set transform on .cube
//   // For this version, we keep the cube size fixed (responsive via resize only)
// });

// Preset Navigation via Gizmo Clicks
// Define preset rotations for the three available views
const presets = {
  front: { rotX: 0,   rotY: 0 },
  left:  { rotX: 0,   rotY: -90 },
  top:   { rotX: -90, rotY: 0 }
};

// Add click event listeners on each gizmo circle
document.querySelectorAll('.viewport-gizmo .circle').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const preset = btn.getAttribute('data-preset') || btn.textContent.toLowerCase();
    if (presets[preset]) {
      rotX = presets[preset].rotX;
      rotY = presets[preset].rotY;
      updateTransforms();
    }
  });
});

// Initialize world transform
updateTransforms();
