// Game State
let isTransformed = false;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let currentPosition = { x: 0, y: 0 };
let zoomLevel = 1;
let cockroachElement = null;
let gameWorld = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('title-screen');
    const transformationScreen = document.getElementById('transformation-screen');
    const gameWorldElement = document.getElementById('game-world');
    cockroachElement = document.getElementById('cockroach');
    gameWorld = gameWorldElement;

    // Title screen click to start
    titleScreen.addEventListener('click', startTransformation);
    
    // Setup game world interactions
    setupGameWorld();
});

function startTransformation() {
    const titleScreen = document.getElementById('title-screen');
    const transformationScreen = document.getElementById('transformation-screen');
    const gameWorldElement = document.getElementById('game-world');
    
    // Hide title screen
    titleScreen.style.opacity = '0';
    setTimeout(() => {
        titleScreen.classList.add('hidden');
        transformationScreen.classList.remove('hidden');
        
        // Show transformation animation
        setTimeout(() => {
            transformationScreen.style.opacity = '0';
            setTimeout(() => {
                transformationScreen.classList.add('hidden');
                gameWorldElement.classList.remove('hidden');
                isTransformed = true;
                
                // Show instructions
                setTimeout(() => {
                    showInstructions();
                }, 500);
            }, 800);
        }, 2000);
    }, 500);
}

function setupGameWorld() {
    if (!gameWorld) return;

    // Mouse drag to move
    gameWorld.addEventListener('mousedown', (e) => {
        if (e.target === gameWorld || e.target.closest('.environment')) {
            isDragging = true;
            dragStart.x = e.clientX - currentPosition.x;
            dragStart.y = e.clientY - currentPosition.y;
            gameWorld.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            currentPosition.x = e.clientX - dragStart.x;
            currentPosition.y = e.clientY - dragStart.y;
            updateWorldPosition();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (gameWorld) {
            gameWorld.style.cursor = 'grab';
        }
    });

    // Touch support
    let touchStart = { x: 0, y: 0 };
    
    gameWorld.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStart.x = touch.clientX - currentPosition.x;
            touchStart.y = touch.clientY - currentPosition.y;
            isDragging = true;
        }
    });

    gameWorld.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            currentPosition.x = touch.clientX - touchStart.x;
            currentPosition.y = touch.clientY - touchStart.y;
            updateWorldPosition();
        }
    });

    gameWorld.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Zoom with scroll
    gameWorld.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomLevel = Math.max(0.5, Math.min(3, zoomLevel * delta));
        updateZoom();
    });

    // Pinch zoom for touch
    let initialDistance = 0;
    gameWorld.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    });

    gameWorld.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (initialDistance > 0) {
                const scale = currentDistance / initialDistance;
                zoomLevel = Math.max(0.5, Math.min(3, zoomLevel * scale));
                updateZoom();
                initialDistance = currentDistance;
            }
        }
    });

    // Food item interactions
    document.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            eatFood(item);
        });
    });

    // Crack interactions (hiding spots)
    document.querySelectorAll('.crack').forEach(crack => {
        crack.addEventListener('click', (e) => {
            e.stopPropagation();
            hideInCrack(crack);
        });
    });

    // Cockroach movement animation
    animateCockroach();
}

function updateWorldPosition() {
    if (!gameWorld) return;
    const environment = gameWorld.querySelector('.environment');
    if (environment) {
        environment.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`;
    }
}

function updateZoom() {
    if (!gameWorld) return;
    gameWorld.style.transform = `scale(${zoomLevel})`;
    
    // Update size status
    const sizeElement = document.getElementById('size');
    if (sizeElement) {
        if (zoomLevel > 2) {
            sizeElement.textContent = 'Very Small';
        } else if (zoomLevel > 1.5) {
            sizeElement.textContent = 'Small';
        } else if (zoomLevel < 0.8) {
            sizeElement.textContent = 'Large';
        } else {
            sizeElement.textContent = 'Normal';
        }
    }
}

function animateCockroach() {
    if (!cockroachElement) return;
    
    // Random movement
    setInterval(() => {
        if (!isDragging && Math.random() > 0.7) {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            
            cockroachElement.style.transform = `translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px))`;
            
            setTimeout(() => {
                cockroachElement.style.transform = 'translate(-50%, -50%)';
            }, 500);
        }
    }, 2000);
}

function eatFood(foodItem) {
    // Animate eating
    foodItem.style.transform = 'scale(0) rotate(360deg)';
    foodItem.style.opacity = '0';
    foodItem.style.transition = 'all 0.5s ease';
    
    // Show feedback
    showFeedback('Yum! Food consumed', foodItem);
    
    // Remove after animation
    setTimeout(() => {
        foodItem.remove();
    }, 500);
}

function hideInCrack(crack) {
    if (!cockroachElement) return;
    
    // Move cockroach to crack
    const crackRect = crack.getBoundingClientRect();
    const worldRect = gameWorld.getBoundingClientRect();
    
    const relativeX = crackRect.left - worldRect.left + crackRect.width / 2;
    const relativeY = crackRect.top - worldRect.top + crackRect.height / 2;
    
    cockroachElement.style.left = `${relativeX}px`;
    cockroachElement.style.top = `${relativeY}px`;
    cockroachElement.style.opacity = '0.3';
    cockroachElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
    
    showFeedback('Hidden! Safe from danger', crack);
    
    // Come out after a moment
    setTimeout(() => {
        cockroachElement.style.opacity = '1';
        cockroachElement.style.transform = 'translate(-50%, -50%) scale(1)';
        cockroachElement.style.left = '50%';
        cockroachElement.style.top = '50%';
    }, 2000);
}

function showFeedback(message, element) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.position = 'absolute';
    feedback.style.left = element.getBoundingClientRect().left + 'px';
    feedback.style.top = (element.getBoundingClientRect().top - 30) + 'px';
    feedback.style.background = 'rgba(139, 69, 19, 0.9)';
    feedback.style.padding = '8px 15px';
    feedback.style.borderRadius = '15px';
    feedback.style.fontSize = '0.9rem';
    feedback.style.color = '#fff';
    feedback.style.pointerEvents = 'none';
    feedback.style.zIndex = '1000';
    feedback.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(-20px)';
        feedback.style.transition = 'all 0.5s ease';
        setTimeout(() => feedback.remove(), 500);
    }, 1500);
}

function showInstructions() {
    const modal = document.getElementById('instructions-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeInstructions() {
    const modal = document.getElementById('instructions-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isTransformed) return;
    
    const moveSpeed = 10;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            currentPosition.y += moveSpeed;
            updateWorldPosition();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            currentPosition.y -= moveSpeed;
            updateWorldPosition();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            currentPosition.x += moveSpeed;
            updateWorldPosition();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            currentPosition.x -= moveSpeed;
            updateWorldPosition();
            break;
        case '+':
        case '=':
            zoomLevel = Math.min(3, zoomLevel * 1.1);
            updateZoom();
            break;
        case '-':
        case '_':
            zoomLevel = Math.max(0.5, zoomLevel * 0.9);
            updateZoom();
            break;
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    if (isTransformed) {
        e.preventDefault();
    }
});




