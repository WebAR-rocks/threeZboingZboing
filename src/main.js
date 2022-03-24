import * as THREE from '../libs/three/v136/build/three.module.js';

import { OrbitControls } from '../libs/three/v136/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../libs/three/v136/examples/jsm/loaders/GLTFLoader.js';

import { ZboingZboingPhysics } from './ZboingZboingPhysics.js';




window.PARENTTHREEOBJ = null;


const SETTINGS = {
  meshPath: 'assets/poulpi.glb',
  skinnedMeshName: null,

  simuStepsCount: 1, // default: 3

  gravity: 0,
  
  bonesPhysics: {
    DEFAULT: {
      damperRange: [5, 20],
      springRange: [50, 100]
    } 
    /*DEFAULT: {
      damperRange: [0.001, 0.005],
      springRange: [0.00001, 0.000005]
    } /*
    boneName: {
      damper: 0.0008,
      spring: 0.000004
    }//*/
  }
};



let renderer = null, camera = null, scene = null, controls = null;

let skinnedMesh = null, animationMixer = null, clock = null, animationAction = null;
let physics = null;

// entry point:
function main(){
  const canvas = document.getElementById('three');

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas
  });

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000 );
  camera.aspect = canvas.width / canvas.height;
  camera.position.set(0, 0, 5);
  camera.updateProjectionMatrix();

  controls = new OrbitControls( camera, renderer.domElement );
  controls.update();

  // lighting:
  const al = new THREE.AmbientLight(0xffffff, 1);
  const pl = new THREE.PointLight(0xffffff, 2);
  pl.position.set(0,0,10);
  scene.add(al, pl);

  // load mesh:
  const loader = new GLTFLoader();
  loader.load( SETTINGS.meshPath, function ( gltf ) {
    
    window.gltf = gltf;
    
    const model = gltf.scene;
    model.position.set(0,-0.5,0);
    model.scale.multiplyScalar(0.5);
    scene.add(model);

    skinnedMesh = extract_skinnedMesh(model, SETTINGS.skinnedMeshName);

    // put some stuffs as globals:
    window.skinnedMesh = skinnedMesh;
    window.PARENTTHREEOBJ = model;
    
    physics = new ZboingZboingPhysics(scene, skinnedMesh, SETTINGS.bonesPhysics, {
      isDebug: false,
      internalStrengthFactor: 0.5,
      simuStepsCount: SETTINGS.simuStepsCount,
      gravity: SETTINGS.gravity
      //bonesNamesShouldContain: '_rigleft',
    });

    // handle animation:
    if (gltf.animations.length > 0){
      const animationClip = gltf.animations[0];

      // we need to use physics to create the animationMixer
      // because it will be linked to the rigid (and hidden) skeleton
      animationMixer = physics.create_animationMixer();
      clock = new THREE.Clock();
      animationAction = animationMixer.clipAction( animationClip );
      animationAction.play();
      window.animationAction = animationAction;
    }

    console.log('Start animate...');
    animate();
  });
}


function extract_skinnedMesh(model, name){
  let sm = null;
  model.traverse(function(threeStuff){
    if (threeStuff.type === "SkinnedMesh" 
      && (!SETTINGS.skinnedMeshName || threeStuff.name === SETTINGS.skinnedMeshName)){
      sm = threeStuff;
    }
  });
  return sm;
}


function animate(dt){
  controls.update();

  if (physics !== null){
    physics.update();
    if (animationMixer){    
      animationMixer.update(clock.getDelta());
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
}


function toggle_animation(){
  if (!animationAction) {
    console.log('NO ANIMATION');
    return;
  }
  if (animationAction.paused){
    console.log('PLAY ANIMATION');
    animationAction.paused = false;
  } else {
    console.log('PAUSE ANIMATION');
    animationAction.paused = true;
  }
}


window.toggle_animation = toggle_animation;
window.onload = main;