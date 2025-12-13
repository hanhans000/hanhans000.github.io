// Interactive 3D House with Found Objects
class FoundObjectsHouse {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        this.objects = [];
        this.currentObject = null;
        this.foundObjects = new Set();
        this.currentRoom = 'living';
        this.isLoading = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createScene();
        this.createHouse();
        this.createObjects();
        this.animate();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Navigation controls
        document.getElementById('help-btn').addEventListener('click', () => this.toggleHelp());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Modal controls
        document.getElementById('close-info').addEventListener('click', () => this.hideObjectInfo());
        document.getElementById('close-modal').addEventListener('click', () => this.hideStoryModal());
        document.getElementById('close-help').addEventListener('click', () => this.hideHelp());
        
        // Story navigation
        document.getElementById('prev-story').addEventListener('click', () => this.previousStory());
        document.getElementById('next-story').addEventListener('click', () => this.nextStory());
        
        // Room navigation
        document.querySelectorAll('.room-dot').forEach(dot => {
            dot.addEventListener('click', (e) => this.switchRoom(e.target.dataset.room));
        });

        // Mouse events for object interaction
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Keyboard controls
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }

    createScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        
        // Create raycaster for object interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add lighting
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xff6b6b, 0.5, 20);
        pointLight1.position.set(-5, 3, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 20);
        pointLight2.position.set(5, 3, -5);
        this.scene.add(pointLight2);
    }

    createHouse() {
        // House structure
        const houseGroup = new THREE.Group();
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        houseGroup.add(floor);
        
        // Walls
        this.createWalls(houseGroup);
        
        // Rooms
        this.createRooms(houseGroup);
        
        this.scene.add(houseGroup);
    }

    createWalls(houseGroup) {
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
        
        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 8),
            wallMaterial
        );
        frontWall.position.set(0, 4, -10);
        houseGroup.add(frontWall);
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 8),
            wallMaterial
        );
        backWall.position.set(0, 4, 10);
        backWall.rotation.y = Math.PI;
        houseGroup.add(backWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 8),
            wallMaterial
        );
        leftWall.position.set(-10, 4, 0);
        leftWall.rotation.y = Math.PI / 2;
        houseGroup.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 8),
            wallMaterial
        );
        rightWall.position.set(10, 4, 0);
        rightWall.rotation.y = -Math.PI / 2;
        houseGroup.add(rightWall);
    }

    createRooms(houseGroup) {
        // Living Room (center)
        this.createLivingRoom(houseGroup);
        
        // Kitchen (right)
        this.createKitchen(houseGroup);
        
        // Bedroom (left)
        this.createBedroom(houseGroup);
        
        // Attic (upstairs)
        this.createAttic(houseGroup);
    }

    createLivingRoom(houseGroup) {
        const livingRoomGroup = new THREE.Group();
        livingRoomGroup.name = 'living-room';
        
        // Sofa
        const sofaGeometry = new THREE.BoxGeometry(3, 1, 1);
        const sofaMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
        sofa.position.set(-2, 0.5, -2);
        sofa.castShadow = true;
        livingRoomGroup.add(sofa);
        
        // Coffee table
        const tableGeometry = new THREE.BoxGeometry(2, 0.5, 1);
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(0, 0.25, -2);
        table.castShadow = true;
        livingRoomGroup.add(table);
        
        houseGroup.add(livingRoomGroup);
    }

    createKitchen(houseGroup) {
        const kitchenGroup = new THREE.Group();
        kitchenGroup.name = 'kitchen';
        
        // Stove
        const stoveGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const stoveMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const stove = new THREE.Mesh(stoveGeometry, stoveMaterial);
        stove.position.set(6, 0.5, 0);
        stove.castShadow = true;
        kitchenGroup.add(stove);
        
        // Refrigerator
        const fridgeGeometry = new THREE.BoxGeometry(1, 2, 1);
        const fridgeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
        fridge.position.set(8, 1, 0);
        fridge.castShadow = true;
        kitchenGroup.add(fridge);
        
        houseGroup.add(kitchenGroup);
    }

    createBedroom(houseGroup) {
        const bedroomGroup = new THREE.Group();
        bedroomGroup.name = 'bedroom';
        
        // Bed
        const bedGeometry = new THREE.BoxGeometry(3, 0.5, 2);
        const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.set(-6, 0.25, 0);
        bed.castShadow = true;
        bedroomGroup.add(bed);
        
        // Dresser
        const dresserGeometry = new THREE.BoxGeometry(2, 1.5, 1);
        const dresserMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const dresser = new THREE.Mesh(dresserGeometry, dresserMaterial);
        dresser.position.set(-8, 0.75, 0);
        dresser.castShadow = true;
        bedroomGroup.add(dresser);
        
        houseGroup.add(bedroomGroup);
    }

    createAttic(houseGroup) {
        const atticGroup = new THREE.Group();
        atticGroup.name = 'attic';
        
        // Attic floor
        const atticFloorGeometry = new THREE.PlaneGeometry(15, 15);
        const atticFloorMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const atticFloor = new THREE.Mesh(atticFloorGeometry, atticFloorMaterial);
        atticFloor.position.set(0, 6, 0);
        atticFloor.rotation.x = -Math.PI / 2;
        atticFloor.receiveShadow = true;
        atticGroup.add(atticFloor);
        
        houseGroup.add(atticGroup);
    }

    createObjects() {
        const objectData = [
            {
                name: "Grandmother's Teacup",
                room: "living",
                position: [0, 1.5, -2],
                emoji: "☕",
                story: "This delicate porcelain teacup belonged to my grandmother. Every Sunday, she would serve her famous chamomile tea in this very cup. The tiny chip on the rim tells the story of when my cousin accidentally knocked it over during a family gathering. Instead of throwing it away, grandmother said 'Every chip tells a story, and this one tells of love and laughter.'",
                details: ["Porcelain", "Hand-painted", "Circa 1950s", "Family heirloom"]
            },
            {
                name: "Mysterious Key",
                room: "kitchen",
                position: [6, 1.5, 0],
                emoji: "🗝️",
                story: "Found this key in the kitchen drawer, but no one knows what it opens. It's been there for years, passed down through generations. The intricate design suggests it might open something special - perhaps a hidden compartment or a long-forgotten treasure chest. The mystery continues to this day.",
                details: ["Brass", "Ornate design", "Unknown origin", "Possibly antique"]
            },
            {
                name: "Childhood Teddy Bear",
                room: "bedroom",
                position: [-6, 1.5, 0],
                emoji: "🧸",
                story: "Mr. Fluffles has been my companion since I was three years old. His fur is matted and his button eye is loose, but he's been through every adventure with me. From tea parties to space missions, he's been my constant friend. Even now, as an adult, I can't bear to part with him.",
                details: ["Cotton stuffing", "Hand-sewn", "Well-loved", "Sentimental value"]
            },
            {
                name: "Ancient Compass",
                room: "attic",
                position: [0, 7, 0],
                emoji: "🧭",
                story: "This compass was found in my great-grandfather's sea chest. He was a merchant sailor who traveled the world in the early 1900s. The needle still points north, though the glass is cracked. It guided him through storms and calm seas alike, and now it sits as a reminder of adventures yet to come.",
                details: ["Brass casing", "Magnetic needle", "Circa 1900s", "Nautical history"]
            },
            {
                name: "Vintage Camera",
                room: "living",
                position: [2, 1, -2],
                emoji: "📷",
                story: "This old film camera captured countless family memories. My father used it to document our childhood, and the photos it produced have a warmth that digital cameras can't replicate. The leather case is worn smooth from years of use, and the shutter still clicks with the same satisfying sound.",
                details: ["35mm film", "Manual focus", "Leather case", "Vintage 1970s"]
            },
            {
                name: "Magic 8-Ball",
                room: "kitchen",
                position: [8, 1.5, 0],
                emoji: "🎱",
                story: "This isn't just any Magic 8-Ball - it's the one that predicted my first job, my college acceptance, and even warned me about that terrible haircut in high school. While I know it's just a toy, there's something comforting about asking it for advice when life gets confusing.",
                details: ["Plastic", "Liquid-filled", "20 responses", "Nostalgic toy"]
            },
            {
                name: "Pressed Flower Bookmark",
                room: "bedroom",
                position: [-8, 2, 0],
                emoji: "🌸",
                story: "Pressed between the pages of an old poetry book, this flower was picked from my grandmother's garden on the last day I saw her. The delicate petals have faded but the memory remains vibrant. It's a reminder that beauty can be preserved, even as time passes.",
                details: ["Dried flower", "Hand-pressed", "Fragile", "Memory keepsake"]
            },
            {
                name: "Pocket Watch",
                room: "attic",
                position: [3, 7, 2],
                emoji: "⌚",
                story: "This pocket watch belonged to my great-uncle, a railroad conductor. It kept perfect time for decades, ensuring trains ran on schedule. The intricate engravings tell stories of journeys across the country. Even though it no longer works, it represents the importance of being punctual and reliable.",
                details: ["Gold-plated", "Wind-up mechanism", "Railroad history", "Family heirloom"]
            },
            {
                name: "Lucky Coin",
                room: "living",
                position: [-1, 1, -2],
                emoji: "🪙",
                story: "Found this coin on the sidewalk when I was seven. I've carried it in my pocket for every important test, job interview, and first date. Whether it's actually lucky or just gives me confidence, it's become my talisman. The edges are worn smooth from years of nervous thumbing.",
                details: ["Silver", "Worn smooth", "Personal talisman", "Good luck charm"]
            },
            {
                name: "Handwritten Recipe",
                room: "kitchen",
                position: [7, 1, 0],
                emoji: "📜",
                story: "This recipe for chocolate chip cookies is written in my mother's handwriting. The paper is stained with flour and chocolate, and the edges are torn from years of use. Every time I make these cookies, I feel connected to her, even though she's been gone for years. The secret ingredient? Love.",
                details: ["Handwritten", "Stained paper", "Family recipe", "Emotional value"]
            },
            {
                name: "Childhood Drawing",
                room: "bedroom",
                position: [-7, 2.5, 0],
                emoji: "🎨",
                story: "This crayon drawing of a house was my first attempt at art when I was five. The lines are wobbly and the colors are outside the lines, but it shows the pure joy of creation. My parents framed it and it's been on the wall ever since, reminding me that perfection isn't the goal - expression is.",
                details: ["Crayon on paper", "Child's artwork", "Framed", "Sentimental"]
            },
            {
                name: "Mystery Box",
                room: "attic",
                position: [-2, 7, -2],
                emoji: "📦",
                story: "This small wooden box has been in the attic for as long as I can remember. No one knows what's inside because it's locked and the key has been lost. The intricate carvings suggest it's valuable, but the mystery of its contents is more precious than any treasure it might contain.",
                details: ["Wooden", "Locked", "Intricate carvings", "Mysterious contents"]
            }
        ];

        objectData.forEach((data, index) => {
            this.createInteractiveObject(data, index);
        });
    }

    createInteractiveObject(data, index) {
        // Create object geometry based on type
        let geometry, material;
        
        switch (data.emoji) {
            case "☕":
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
                material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                break;
            case "🗝️":
                geometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
                material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
                break;
            case "🧸":
                geometry = new THREE.SphereGeometry(0.4, 8, 6);
                material = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
                break;
            case "🧭":
                geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
                material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                break;
            case "📷":
                geometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
                material = new THREE.MeshLambertMaterial({ color: 0x000000 });
                break;
            case "🎱":
                geometry = new THREE.SphereGeometry(0.3, 8, 6);
                material = new THREE.MeshLambertMaterial({ color: 0x000000 });
                break;
            case "🌸":
                geometry = new THREE.PlaneGeometry(0.3, 0.3);
                material = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
                break;
            case "⌚":
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
                material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
                break;
            case "🪙":
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
                material = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
                break;
            case "📜":
                geometry = new THREE.PlaneGeometry(0.4, 0.3);
                material = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
                break;
            case "🎨":
                geometry = new THREE.PlaneGeometry(0.3, 0.4);
                material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                break;
            case "📦":
                geometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
                material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                break;
            default:
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                material = new THREE.MeshLambertMaterial({ color: 0x666666 });
        }

        const object = new THREE.Mesh(geometry, material);
        object.position.set(...data.position);
        object.castShadow = true;
        object.userData = {
            name: data.name,
            emoji: data.emoji,
            story: data.story,
            details: data.details,
            room: data.room,
            index: index
        };

        // Add glow effect
        const glowGeometry = geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(object.position);
        glow.scale.multiplyScalar(1.2);
        this.scene.add(glow);

        this.scene.add(object);
        this.objects.push(object);

        // Add floating animation
        this.animateObject(object, glow);
    }

    animateObject(object, glow) {
        const startY = object.position.y;
        const time = Date.now() * 0.001;
        
        object.position.y = startY + Math.sin(time + object.userData.index) * 0.1;
        object.rotation.y += 0.01;
        
        glow.position.copy(object.position);
        glow.rotation.copy(object.rotation);
        
        requestAnimationFrame(() => this.animateObject(object, glow));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects);
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.showObjectInfo(object);
            this.foundObjects.add(object.userData.index);
            this.updateProgress();
        }
    }

    showObjectInfo(object) {
        this.currentObject = object;
        const data = object.userData;
        
        document.getElementById('object-title').textContent = data.name;
        document.getElementById('object-image').textContent = data.emoji;
        document.getElementById('story-text').textContent = data.story;
        
        const detailsList = document.getElementById('details-list');
        detailsList.innerHTML = '';
        data.details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });
        
        document.getElementById('object-info').classList.remove('hidden');
    }

    hideObjectInfo() {
        document.getElementById('object-info').classList.add('hidden');
    }

    showStoryModal() {
        if (this.currentObject) {
            const data = this.currentObject.userData;
            document.getElementById('modal-title').textContent = data.name;
            document.getElementById('modal-image').textContent = data.emoji;
            document.getElementById('modal-story-text').textContent = data.story;
            document.getElementById('story-modal').classList.remove('hidden');
        }
    }

    hideStoryModal() {
        document.getElementById('story-modal').classList.add('hidden');
    }

    toggleHelp() {
        document.getElementById('help-modal').classList.toggle('hidden');
    }

    hideHelp() {
        document.getElementById('help-modal').classList.add('hidden');
    }

    toggleSound() {
        // Sound toggle functionality
        const soundBtn = document.getElementById('sound-btn');
        soundBtn.textContent = soundBtn.textContent === '🔊' ? '🔇' : '🔊';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    switchRoom(roomName) {
        this.currentRoom = roomName;
        
        // Update room dots
        document.querySelectorAll('.room-dot').forEach(dot => {
            dot.classList.remove('active');
        });
        document.querySelector(`[data-room="${roomName}"]`).classList.add('active');
        
        // Move camera to room
        const roomPositions = {
            'living': { x: 0, y: 5, z: 10 },
            'kitchen': { x: 8, y: 5, z: 0 },
            'bedroom': { x: -8, y: 5, z: 0 },
            'attic': { x: 0, y: 8, z: 0 }
        };
        
        const target = roomPositions[roomName];
        this.animateCameraTo(target);
    }

    animateCameraTo(target) {
        const startPosition = this.camera.position.clone();
        const startTime = Date.now();
        const duration = 1000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, new THREE.Vector3(target.x, target.y, target.z), easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    updateProgress() {
        const totalObjects = this.objects.length;
        const foundCount = this.foundObjects.size;
        const progress = (foundCount / totalObjects) * 100;
        
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.getElementById('found-count').textContent = foundCount;
        
        if (foundCount === totalObjects) {
            this.showCompletionMessage();
        }
    }

    showCompletionMessage() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎉 Congratulations!</h2>
                </div>
                <div class="modal-body">
                    <p>You've discovered all the hidden stories in the house! Each object has shared its tale, and now you understand the rich history that lives within these walls.</p>
                    <p>Thank you for exploring the Found Objects House!</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                this.isLoading = false;
            }, 500);
        }, 2000);
    }

    onKeyDown(event) {
        switch(event.key) {
            case 'Escape':
                this.hideObjectInfo();
                this.hideStoryModal();
                this.hideHelp();
                break;
            case 'h':
            case 'H':
                this.toggleHelp();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    new FoundObjectsHouse();
});

