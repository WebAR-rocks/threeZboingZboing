# threeZboingZboing


Simple bone based physics for THREE.js.
Simulates a spring damper system applied at the rotation of bone joints.
Once physics is applied, the instance of `THREE.SkinnedMesh` can be moved, rotated, animated using a skeleton and physics will automatically apply.


## Architecture

* `index.html`: demo HTML file, to host with a static HTTP server,
* `assets/poulpi.blend`: Blender octopus rigged 3D model,
* `assets/poulpi.glb`: Octopus rigged 3D model exported using Blender GLTF exporter,
* `src/main.js`: main demo script,
* `src/ZboingZboingPhysics.js`: the most important file of this library. You only need this one


## Usage

Import the module:

```javascript
import { ZboingZboingPhysics } from './ZboingZboingPhysics.js';
```

Create physics:

```javascript
const physics = new ZboingZboingPhysics(scene, skinnedMesh, bonePhysics, options);
```

Where:

* `<THREE.Scene> scene` is the Three scene. Bones simulated using physics will be directly put there,
* `<THREE.SkinnedMesh> skinnedMesh` is the skinned mesh to apply physics,
* `<Dict> bonePhysics` is a dictionnary with bones physical parameters:

   ```
   DEFAULT: {
      damperRange: [0.001, 0.005],
      springRange: [0.000001, 0.000005]
    },
    boneName: {
      damper: 0.0008,
      spring: 0.000004
    },
    anotherBoneName: {
      damper: 0.0008,
      spring: 0.000004
    }
    ```
* `<Dict> options` are some options:
  * `<int> simuStepsCount`: number of simulation steps per update. The default value is `3`,
  * `<float> internalStrengthFactor`: force applied between a bone and its children / parent relative to the force applied between a point and its rigid position. Default value is `0.5`
  * `<bool> isDebug`: Default is `false`. If `true`, the rigid skinned mesh will be added to the scene


**WARNING**: to animate your skinned mesh, you should not directly create an instance of `THREE.AnimationMixer` using the skinned mesh. You need to proceed this way:

```javascript
const animationMixer = physics.create_animationMixer();
```

Update (in the rendering loop):
```javascript
physics.update();
```

Destroy:
```javascript
physics.destroy();
````

## How it works

When we create the physics, we replace the swap the skeleton of the skinned mesh by a new skeleton where bone will be simulated using physics.
The old skeleton is still here and called the rigid skeleton. But it is hidden. Each bone of the new skeleton is simulated using damper-spring systems:

* between the start of the bone and the start of the rigid skeleton bone
* between the end of the bone and the end of the rigid skeleton bone
* between the start of the bone and its parent
* between the end of the bone and its children
* inside the bone (start -> end and end -> start)


## Workaround

The THREE GLTF importer does not give access to the end positions of the bones. So we compute the end position of a bone by computing the mean of its children positions. But if the bone had no child, we cannot compute its end position, so only half of the bone will be simulated.

As a workaround, it is better to add a useless bone at the end of each bone chain which should be simulated.


## License

[MIT software license](LICENSE)

Files included in these directories are NOT affected by this license:

* `/libs/`: each libs is released under its own software license
* `/assets/`: The octopus 3D model is released under CC license


## References

3D Model: [Blue Ringed Octopus by Leslie Stowe](https://sketchfab.com/3d-models/blue-ringed-octopus-inktober-day-1-ac85becda709471494d049ab346136f0)