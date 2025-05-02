const cube = document.getElementById('cube');
let isDragging = false;
let previousX = 0;
let previousY = 0;
let rotationX = 0;
let rotationY = 0;

// When you start dragging that badass cube
cube.addEventListener('pointerdown', (e) => {
  isDragging = true;
  previousX = e.clientX;
  previousY = e.clientY;
  document.body.style.cursor = 'grabbing';
});

// When you stop dragging, let it go, you sexy rebel
window.addEventListener('pointerup', () => {
  isDragging = false;
  document.body.style.cursor = 'grab';
});

// While dragging, update the cube's rotation based on mouse movement
window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  let deltaX = e.clientX - previousX;
  let deltaY = e.clientY - previousY;
  previousX = e.clientX;
  previousY = e.clientY;
  rotationY += deltaX * 0.5; // Adjust sensitivity as you damn well please
  rotationX -= deltaY * 0.5;
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
});