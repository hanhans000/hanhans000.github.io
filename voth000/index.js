import * as THREE from "three";
import Stats from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/libs/stats.module.js";
import dat from "https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/postprocessing/UnrealBloomPass.js";
// Define global variables
let scene, camera, renderer, controls, raycaster, mouse;
let container, tim, tim1, gltf2, gltf3, gltf4;

const popup = document.getElementById("up");

function showPopup() {
  popup.style.display = "flex";
}

function hidePopup() {
  popup.style.display = "none";
}

// Show the popup initially
showPopup();

init();

function init() {
  container = document.getElementById("three-container");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  // Add an event listener for window resizing

  // Add an orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // Add an ambient light
  const ambientLight = new THREE.AmbientLight(0x443333);
  scene.add(ambientLight);

  // Add a directional light
  const dirLight1 = new THREE.DirectionalLight(0xffddcc, 1);
  dirLight1.position.set(1, 0.75, 0.5);
  scene.add(dirLight1);

  // Add a second directional light
  const dirLight2 = new THREE.DirectionalLight(0xccccff, 1);
  dirLight2.position.set(-1, 0.75, -0.5);
  scene.add(dirLight2);

  const bloomStrength = 2.5;
  const bloomKernelSize = 64;
  const bloomSigma = 1.0;
  const bloomResolution = 256;

  // create a bloom pass with a high strength value
  const bloomPass = new UnrealBloomPass(
    bloomStrength, // Strength of the bloom effect
    bloomKernelSize, // Size of the Gaussian blur kernel
    bloomSigma, // Standard deviation of the Gaussian blur kernel
    bloomResolution // Resolution of the internal render targets
  );

  // create a render target with half the resolution to improve performance
  const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth / 2,
    window.innerHeight / 2
  );

  // add the bloom pass to the composer
  const composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloomPass);

  /////colorpicker
  // Add an HTML color input element

  // Get the color picker element
  const colorPicker = document.getElementById("colorPicker");
  // Set up the emissive color
  const emissiveColor = new THREE.Color(0x0091ff);

  // Listen for the color picker's input event
  colorPicker.addEventListener("input", function (event) {
    const color = event.target.value;
    emissiveColor.set(color);
    updateEmissiveColor();
  });

  // Function to update the emissive color of the model's material
  function updateEmissiveColor() {
    tim.traverse(function (node) {
      if (node.isMesh && node.name !== "sh") {
        // Apply to all models except 'sh.glb'
        node.material.emissive = emissiveColor;
      }
    });
    renderer.render(scene, camera); // Render the scene to see the color change immediately
  }

  // Get the color picker element
  const colorPicker1 = document.getElementById("colorPicker2");
  // Set up the emissive color
  const emissiveColor1 = new THREE.Color(0xff00ea);
  // Listen for the color picker's input event
  colorPicker1.addEventListener("input", function (event1) {
    const color1 = event1.target.value;
    emissiveColor1.set(color1);
    updateEmissiveColor1();
  });

  // Function to update the emissive color of the model's material
  function updateEmissiveColor1() {
    gltf4.traverse(function (node) {
      if (node.isMesh) {
        node.material.emissive = emissiveColor1;
      }
    });
    renderer.render(scene, camera); // Render the scene to see the color change immediately
  }

  // Load the first GLTF model (tim.glb)
  // Load the first GLTF model (tim.glb)
  const loader = new GLTFLoader();
  loader.load("ani2.glb", function (gltf) {
    tim = gltf.scene;
    scene.add(tim);
    // Set up the animations
    const mixer = new THREE.AnimationMixer(tim);
    const clips = gltf.animations;

    // Play all animation clips
    clips.forEach(function (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    });
    tim.visible = true;
    tim.name = "tim";

    document.addEventListener("click", function () {
      hidePopup();
    });

    document.getElementById("button1").addEventListener("click", function () {
      scene.getObjectByName("tim1").visible = false;
      scene.getObjectByName("tim").visible = true;
    });

    tim.traverse(function (node) {
      if (node.isMesh) {
        node.material.shininess = 0;
        node.scale.set(0.11, 0.11, 0.11);

        const material = node.material;
        material.emissive = emissiveColor; // set the emissive color to white
        material.emissiveIntensity = 0.9; // adj
        node.material.transparent = true;
        node.material.opacity = 0.85;
      }
    });
    // Set the position of the model
    tim.position.set(0, 0, 0.5);
    composer.render();
    // Set up the raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    // Add an event listener for mouse clicks
    document.addEventListener("mousedown", onDocumentMouseDown);
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update the mixer to advance the animations
      mixer.update(0.005); // Adjust the time delta as needed

      renderer.render(scene, camera);
      controls.update();
    }

    // Start the animation loop
    animate();
  });

  // Load the first GLTF model (tim.glb)
  const loader1 = new GLTFLoader();
  loader1.load("ani1.glb", function (gltf) {
    tim1 = gltf.scene;
    scene.add(tim1);
    // Set up the animations
    const mixer = new THREE.AnimationMixer(tim1);
    const clips = gltf.animations;

    // Play all animation clips
    clips.forEach(function (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    });

    tim1.visible = false;
    tim1.name = "tim1";

    document.getElementById("button2").addEventListener("click", function () {
      scene.getObjectByName("tim").visible = false;

      tim1.visible = !tim1.visible;
    });

    tim1.traverse(function (node) {
      if (node.isMesh) {
        const material = node.material;
        material.emissive = emissiveColor; // set the emissive color to white
        material.emissiveIntensity = 0.1; // adj
        node.material.transparent = true;
        node.material.opacity = 1;
        node.material.encoding = THREE.sRGBEncoding;
        node.material.shininess = 20;
        node.scale.set(0.6, 0.6, 0.6);
        node.position.set(-0.25, 1, 1);

        if (material.map) {
          material.map.encoding = THREE.sRGBEncoding;
        }
      }
    });
    // Set the position of the model
    composer.render();
    // Set up the raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    // Add an event listener for mouse clicks
    document.addEventListener("mousedown", onDocumentMouseDown);
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update the mixer to advance the animations
      mixer.update(0.008); // Adjust the time delta as needed

      renderer.render(scene, camera);
      controls.update();
    }

    // Start the animation loop
    animate();
  });

  // Load the second GLTF model (2.glb)
  loader.load("hoa2.glb", function (gltf) {
    gltf2 = gltf.scene;
    gltf2.traverse(function (node) {
      if (node.isMesh) {
        node.material.shininess = 5;
        node.scale.set(1.4, 1.4, 1.4);
        node.position.set(0, 0, 0);

        const material = node.material;
        material.emissive = new THREE.Color(0xffffff); // set the emissive color to white
        material.emissiveIntensity = 0.4; // adj
      }
    });
  });

  loader.load("tree2.glb", function (gltf) {
    gltf3 = gltf.scene;

    gltf3.traverse(function (node) {
      if (node.isMesh) {
        node.material.shininess = 55;
        node.scale.set(0.2, 0.2, 0.2);
        node.position.set(0, 0, 0);
        const material = node.material;
        material.opacity = 0.6;
        material.emissive = new THREE.Color(0xffffff); // set the emissive color to white
        material.emissiveIntensity = 0.7; // adj
      }
    });
  });

  loader.load("sh.glb", function (gltf) {
    gltf4 = gltf.scene;
    gltf4.traverse(function (node) {
      if (node.isMesh) {
        node.material.shininess = 85;
        node.scale.set(1.4, 1.4, 1.4);
        node.position.set(0, 0, -3);

        const material = node.material;
        material.opacity = 0.5;
        material.emissive = emissiveColor1;

        // set the emissive color to white
        material.emissiveIntensity = 1; // adj
      }
    });
  });

  // Set the camera position
  camera.position.z = 5;

  window.addEventListener("resize", onWindowResize);
}

let currentGlb = gltf2;
let gltf4Count = 0; // Counter for gltf4 appearances

function onDocumentMouseDown(event) {
  // Set the mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Perform the raycast
  raycaster.setFromCamera(mouse, camera);

  const intersectObjects = [];

  if (tim.visible) {
    intersectObjects.push(tim);
  }

  if (tim1.visible) {
    intersectObjects.push(tim1);
  }

  const intersects = raycaster.intersectObjects(intersectObjects, true);

  // Check if the mouse clicked on the tim.glb model
  if (intersects.length > 0) {
    // Get the first intersection point
    const intersection = intersects[0];

    // Calculate the position and rotation of the new object
    const position = intersection.point.clone();
    const normal = intersection.face.normal.clone();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    // Create a clone of the current GLTF model
    if (currentGlb) {
      const clone = currentGlb.clone();
      // Set the position and rotation of the clone based on the mouse click
      clone.position.copy(position);
      clone.quaternion.copy(quaternion);
      scene.add(clone);

      // Increment the gltf4Count if gltf4 is cloned
      if (currentGlb === gltf4) {
        gltf4Count++;
      }
    }
  }
}

setInterval(() => {
  if (currentGlb === gltf2) {
    currentGlb = gltf3;
    scene.remove(gltf2);
    scene.add(gltf3);
  } else if (currentGlb === gltf3) {
    if (gltf4Count < 20) {
      currentGlb = gltf4;
      scene.remove(gltf3);
      scene.add(gltf4);
    } else {
      currentGlb = gltf2;
      scene.remove(gltf3);
      scene.add(gltf2);
    }
  } else {
    currentGlb = gltf2;
    scene.remove(gltf4);
    scene.add(gltf2);
  }
}, 400);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

// Function to handle window resizing
function onWindowResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
}
