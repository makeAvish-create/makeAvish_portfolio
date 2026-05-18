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
loader.load("/Models/vj_portfolio-v4.glb", (gLb)=>{
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

      // Water Material
      if(child.name.includes("Water")){
      child.material = new THREE.MeshStandardMaterial({
      color: 0x558bc8,
      envMap: environmentMap,
      envMapIntensity: 1,
      transparent: true,
      opacity: 0.9,
      roughness: 0,      // 0 = mirror-like reflections
      metalness: 0.1,
      })
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
controls.minAzimuthAngle = Math.PI / 2;
controls.maxAzimuthAngle = -Math.PI / 2;
controls.minPolarAngle = Math.PI / 2 - Math.PI / 6; // 60 degrees from top
controls.maxPolarAngle = Math.PI / 2; // 90 degrees from top
controls.minDistance = 5; // zoom in limit
controls.maxDistance = 30; // zoom out limit
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

const render = (time) =>{
  controls.update();

  //console.log(camera.position);
  //console.log("00000000");
  //console.log(controls.target);

  renderer.render( scene, camera );
  window.requestAnimationFrame(render);
}

render();