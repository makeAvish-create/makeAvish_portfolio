import * as THREE from 'three';
import './style.scss';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Canvas
const canvas = document.querySelector("#experience-canvas")
const sizes ={
    width: window.innerWidth,
    height: window.innerHeight
}

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(-4.896341026016275, 20.14724978921813, -11.284748272260565)

// Rendering
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Star floating animation
const zAxisStars = [];
const starInitialPositions = [];
const starProperties = [];

// Star & Name select animation
const raycaster = new THREE.Raycaster();
raycaster.params.Mesh.threshold = 1;
const pointer = new THREE.Vector2();
let hoveredStar = null;

// Star in well animmation path
const starPaths = {
  "Star_one": new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 16, 0), // replaced by current pos on click
    new THREE.Vector3(0.03853344917297363, 19, 0), // directly above well
    new THREE.Vector3(0.03853344917297363, 16.334545135498047, 0), // well center
  ]),
  "Star_two": new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, 16, 0),
    new THREE.Vector3(0.03853344917297363, 19, 0),
    new THREE.Vector3(0.03853344917297363, 16.334545135498047, 0),
  ]),
  "Star_three": new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, 16, 0),
    new THREE.Vector3(0.03853344917297363, 19, 0),
    new THREE.Vector3(0.03853344917297363, 16.334545135498047, 0),
  ]),
  "Star_four": new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, 16, 0),
    new THREE.Vector3(0.03853344917297363, 19, 0),
    new THREE.Vector3(0.03853344917297363, 16.334545135498047, 0),
  ]),
  "Star_five": new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, 16, 0),
    new THREE.Vector3(0.03853344917297363, 19, 0),
    new THREE.Vector3(0.03853344917297363, 16.334545135498047, 0),
  ]),
};

// Camera animation to well
let cameraAnimation = null;
let starsCompleted = 0;
let cameraAnimationDone = false;

const wellCameraPath = new THREE.CatmullRomCurve3([
  camera.position.clone(),
  new THREE.Vector3(0.03853, 20, -1.5),
  new THREE.Vector3(0.03853344917297363, 17, 0),
  new THREE.Vector3(0.03853344917297363, 17, 0),
]);

function startCameraAnimation(){
  cameraAnimation = { progress: 0, curve: wellCameraPath };
  wellCameraPath.points[0] = camera.position.clone();
}

const starAnimations = {}; // tracks progress for each star

// Track mouse position for stars
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});

// Text array
const RaycasterObjects =[];

// Hitbox array
const HitboxPlane = [];
const tooltip = document.querySelector(".star-tooltip");

// Loaders
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/")

// GLTF loader
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader)

// Background loader
const environmentMap = new THREE.CubeTextureLoader()
  .setPath ( '/Skybox/' )
  .load ([ 'px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp' ])
  scene.environment = environmentMap;
  scene.background = environmentMap;

// Rotate background -90 degrees around Y axis
scene.backgroundRotation.y = Math.PI * 1.5;

// Texture map
const textureMap = {
   "1": "/Textures/Scene_1_board.webp",
   "2": "/Textures/Scene_2_rocks.webp",
   "3": "/Textures/Scene_3_well.webp",
   "4": "/Textures/Scene_4_yel_flr.webp",
   "5": "/Textures/Scene_5_pink_flr.webp",
   "6": "/Textures/Scene_6_roof.webp",
   "8": "/Textures/Scene_8_text.webp",
   "9": "/Textures/Scene_9_landscape.webp",
   // "ten": "/Textures/Scene_ten_sky.webp"  
  }

const loadedTextures = {};

Object.entries(textureMap).forEach(([key, path]) => {
  const texture = textureLoader.load(path);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures[key] = texture;
});

// Star material


// GLB load
loader.load("/Models/vj_portfolio-v6.glb", (gLb)=>{
  gLb.scene.traverse(child=>{
    if(child.isMesh){
      console.log(child.name);
      Object.keys(textureMap).forEach(key=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures[key],
          });
            child.material = material;
            if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
       }
      }

      // Push Star to array
      if (child.name.includes("Star")){
        zAxisStars.push(child);
        starInitialPositions.push(child.position.y);
        starProperties.push({
        speed: Math.random() * 0.00075 + 0.0006,
        amplitude: Math.random() * 0.05 + 0.035,
      });
      }

      // Push text to array
      if (child.name.includes("Raycaster")){
        RaycasterObjects.push(child);}

        // Push hitbox to array
      if(child.name.includes("hitbox")){
         child.material = new THREE.MeshBasicMaterial({
         transparent: true,
         opacity: 0,
         depthWrite: false,
         });
       RaycasterObjects.push(child);
      }

      // Star Material
      if(child.name.includes("Star_one")){
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x14F6FF,
          emissive: 0xFFFFFF,        // glow color
          emissiveIntensity: 0.5, 
          transmission: 0.9,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 1.5,
          thickness: 0.01,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      }

      if(child.name.includes("Star_two")){
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x9843FFFF,
          emissive: 0xFFFFFF,        // glow color
          emissiveIntensity: 0.5,
          transmission: 0.5,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 1.5,
          thickness: 0.01,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      }

      if(child.name.includes("Star_three")){
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x1EFF00,
          emissive: 0xFFFFFF,        // glow color
          emissiveIntensity: 0.5,
          transmission: 0.5,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 1.5,
          thickness: 0.01,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      }

      if(child.name.includes("Star_four")){
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xB0C7FF,
          emissive: 0xFFFFFF,        // glow color
          emissiveIntensity: 0.5,
          transmission: 0.5,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 1.5,
          thickness: 0.01,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      }

      if(child.name.includes("Star_five")){
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xFF4BE5,
          emissive: 0xFFFFFF,        // glow color
          emissiveIntensity: 0.5,
          transmission: 0.5,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 1.5,
          thickness: 0.01,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      }

    });
    }
  });
  scene.add(gLb.scene);
},
  (progress) => { console.log("Loading:", progress) },
  (error) => { console.log("Error:", error) }
);

// Orbit controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.zoomToCursor = true;
controls.target.set(0.15059591431980046, 16.576135586793654, 1.066936603362746);
controls.minAzimuthAngle = Math.PI / 1.05;  // Vertical rotate limit
controls.maxAzimuthAngle = -Math.PI / 1.25;  // Vertical rotate limit
controls.minPolarAngle = Math.PI / 2 - Math.PI / 6; // 60 degrees from top
controls.maxPolarAngle = Math.PI / 2; // 90 degrees from top
controls.minDistance = 5; // zoom in limit
controls.maxDistance = 20; // zoom out limit
controls.update();

// Pan limits ← add here
//const panLimit = 25;
//const initialTarget = new THREE.Vector3(0.15059591431980046, 16.576135586793654, 1.066936603362746);
//controls.addEventListener('change', () => {
//  controls.target.x = Math.max(-panLimit, Math.min(panLimit, controls.target.x));
//  controls.target.y = Math.max(-panLimit, Math.min(panLimit, controls.target.y));
//  controls.target.z = Math.max(-panLimit, Math.min(panLimit, controls.target.z));
//});

// Event listeners
window.addEventListener("resize", ()=>{
sizes.width = window.innerWidth;
sizes.height = window.innerHeight;

// Update camera
camera.aspect = sizes.width / sizes.height
camera.updateProjectionMatrix()

// Update renderer
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
)

// Play star animation on click
window.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(zAxisStars);
  
  if(intersects.length > 0){
    const clicked = intersects[0].object;
    Object.keys(starPaths).forEach(key => {
      if(clicked.name.includes(key)){
        const currentPos = clicked.position.clone();
        const path = starPaths[key];
        path.points[0] = currentPos;
        starAnimations[clicked.uuid] = {
          mesh: clicked,
          curve: path,
          progress: 0,
        };
      }
    });
  }
});

const render = (time) =>{
  // console.log("controls enabled:", controls.enabled, "animDone:", cameraAnimationDone);
  if(!cameraAnimationDone){
    controls.update();
  }

  // Raycaster check
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects([...zAxisStars, ...RaycasterObjects]);

  if(intersects.length > 0){
    hoveredStar = intersects[0].object;
  } else {
    hoveredStar = null;
  }

  // Oscillate stars
  zAxisStars.forEach((star, index) => {
  const { speed, amplitude } = starProperties[index];
  const isAnimating = starAnimations[star.uuid] && starAnimations[star.uuid].progress < 1;

  if(isAnimating) return; // skip oscillation for animating stars

  if(star === hoveredStar){
    const newScale = THREE.MathUtils.lerp(star.scale.x, 1.25, 0.1);
    star.scale.setScalar(newScale);
  } else {
    star.position.y = starInitialPositions[index] + Math.sin(time * speed) * amplitude;
    const newScale = THREE.MathUtils.lerp(star.scale.x, 1, 0.1);
    star.scale.setScalar(newScale);
  }
  });

  // Animate stars along path
  Object.values(starAnimations).forEach(anim => {
  if(anim.progress < 1){
    anim.progress += 0.005;
    const point = anim.curve.getPoint(anim.progress);
    anim.mesh.position.copy(point);
    anim.mesh.material.transparent = true;
    anim.mesh.material.opacity = 1 - anim.progress;
  } else {
    if(!anim.counted){
      anim.counted = true;
      starsCompleted++;
      anim.mesh.visible = false;
      if(starsCompleted >= 1){
        startCameraAnimation();
      }
    }
  }
  });

  // Camera animation to well
  if(cameraAnimation && cameraAnimation.progress < 1){
  cameraAnimation.progress += 0.003;
  const point = cameraAnimation.curve.getPoint(cameraAnimation.progress);
  camera.position.copy(point);
  camera.lookAt(0.03853344917297363, 16, 0);
  controls.enabled = false;
  } else if(cameraAnimation && cameraAnimation.progress >= 1){
  // Force exact final position
  camera.position.set(0.03853344917297363, 16.334545135498047, 0);
  camera.lookAt(0.03853344917297363, 16, 0);
  cameraAnimationDone = true;
  }

  // Switch from default to pointer
  if(intersects.length>0){
    document.body.style.cursor = "pointer"
  }
  else{
    document.body.style.cursor = "default"
  }

  // Text highlight
  if(intersects.length > 0 && intersects[0].object.name.includes("hitbox")){
  tooltip.classList.add("visible");
  } else {
  tooltip.classList.remove("visible");
  }

  // console.log(camera.position);
  // console.log("00000000");
  // console.log(controls.target);

  renderer.render( scene, camera );
  window.requestAnimationFrame(render);
}

render();