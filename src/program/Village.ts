import { AbstractMesh, ActionManager, Animation, ArcRotateCamera, Axis, Camera, Color3, Color4, CubeTexture, DirectionalLight, ExecuteCodeAction, FollowCamera, HemisphericLight, Light, Material, Mesh, MeshBuilder, ParticleSystem, Ray, RayHelper, Scene, SceneLoader, ShadowGenerator, Sound, Space, SpotLight, StandardMaterial, Texture, Vector3, Vector4, WebXRExperienceHelper, WebXRState } from "@babylonjs/core";
import { particlesPixelShader } from "@babylonjs/core/Shaders/particles.fragment";
import { debounce } from "../helper";
import { AdvancedDynamicTexture, Control, Slider, StackPanel, TextBlock }from '@babylonjs/gui';

enum HouseMode {
  Semi = 'semi',
  Detached = 'detached',
}
let dirLight: DirectionalLight;
let shadowGenerator: ShadowGenerator

/**
 * Build Camera
 */

const buildCamera = (scene: Scene) => {
  // This creates and positions a free camera (non-mesh)
  // var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 60, 0), scene);
  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());
  camera.rotation.set(0.25, 0, 0.5);
  camera.alpha = Math.PI / 4;
  camera.beta = Math.PI / 4
  camera.radius = 50;

  // This attaches the camera to the canvas
  camera.attachControl(scene, true);

  return {
    camera
  };
};

/**
 * Build Light
 */
const buildLight = (scene: Scene) => {

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  // var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const light = new DirectionalLight('light', new Vector3(0, 10, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.position.set(10, 8, 10);
  light.intensity = 0.3;
  light.setDirectionToTarget(Vector3.Zero());
  dirLight = light;

  shadowGenerator = new ShadowGenerator(1024, dirLight, false);
  return {
    light
  };
}

/**
 * street light
 */
const buildStreetLight = (scene: Scene, vector3?: Vector3) => {
  const light = new SpotLight('spotlight', vector3 || new Vector3(0, 4, 0), Vector3.Zero(), 0, 0, scene)
};


/**
 * Build House
 */
const faceUV = [
  new Vector4(0.5, 0.0, 0.75, 1.0),
  new Vector4(0.0, 0.0, 0.25, 1.0),
  new Vector4(0.25, 0, 0.5, 1.0),
  new Vector4(0.75, 0, 1.0, 1.0),
];

const semiFaceUV = [
  new Vector4(0.6, 0.0, 1.0, 1.0), //rear face
  new Vector4(0.0, 0.0, 0.4, 1.0), //front face
  new Vector4(0.4, 0, 0.6, 1.0), //right side
  new Vector4(0.4, 0, 0.6, 1.0), //left side
]

const carFaceUV = [
  new Vector4(0, 0.5, 0.38, 1),
  new Vector4(0, 0, 1, 0.5),
  new Vector4(0.38, 1, 0, 0.5),
];

const wheelUV = [
  new Vector4(0, 0, 1, 1),
  new Vector4(0, 0.5, 0, 0.5),
  new Vector4(0, 0, 1, 1)
];

const buildBox = (scene: Scene, mode: HouseMode) => {

  // Set up material
  let boxMaterial: StandardMaterial = new StandardMaterial('boxMat', scene);
  boxMaterial.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png", null);

  let box: Mesh;
  switch (mode) {
    case HouseMode.Detached:
      box = MeshBuilder.CreateBox("detached_box", { size: 2, faceUV, wrap: true }, scene);
      boxMaterial = new StandardMaterial('boxMat', scene);
      boxMaterial.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png", null);
      break;
    case HouseMode.Semi:
      box = MeshBuilder.CreateBox("semi_box", { width: 4, height: 2, depth: 2, faceUV: semiFaceUV, wrap: true }, scene);
      boxMaterial = new StandardMaterial('boxMat', scene);
      boxMaterial.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/semihouse.png", null);
      break;
  }

  // Move the box upward 1/2 its height
  box.position.y = 1;
  box.material = boxMaterial;

  return {
    box,
    boxMaterial
  }
}

/**
 * Build Roof
 */
const buildRoof = (scene: Scene, mode: HouseMode) => {
  // set up material
  const roofMaterial: StandardMaterial = new StandardMaterial('roofMat', scene);
  roofMaterial.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg", null);
  // Our built-in 'ground' shape.
  const roof: Mesh = MeshBuilder.CreateCylinder("roof", { diameter: 1.3, height: 1.2, tessellation: 3 });
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 2.3;

  switch (mode) {
    case HouseMode.Semi:
      roof.scaling.set(1, 4, 2);
      break;
    case HouseMode.Detached:
      roof.scaling.set(1, 2, 2);
      break;
  }
  // roof.position.set(2, 3, 3);
  roof.material = roofMaterial;
  return {
    roof,
    roofMaterial
  }
}

/**
 * Build Ground
 */
const buildGround = (scene: Scene) => {
  // const ground = MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, null);
  // const groundMat = new StandardMaterial('ground', scene);
  // ground.material = groundMat;
  // groundMat.diffuseColor = new Color3(0.25, 0.25, 0.25);


    
    //Create Village ground
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png", scene);
    groundMat.diffuseTexture.hasAlpha = true;

    const ground = MeshBuilder.CreateGround("ground", {width:24, height:24});
    ground.material = groundMat;

    //large ground
    const largeGroundMat = new StandardMaterial("largeGroundMat", scene);
    largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png", scene);
    
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
    largeGround.material = largeGroundMat;
    largeGround.position.y = -0.01;
    ground.receiveShadows = true;
    largeGround.receiveShadows =true;
  return {
    ground
  }
}

/**
 * Add Player
 */
const buildBGM = (scene: Scene) => {
  const player = new Sound("y2mate", "/music/Y2Mate.mp3", scene, null, { loop: true, autoplay: false });

  const togglePlayer = debounce(() => {
    (player.isPlaying) ? player.pause() : player.play()

    console.log({
      'player.getVolume()': player.getVolume()
    })
  })

  const lowerVolumne = () => {
    player.setVolume(Math.max(player.getVolume() - 0.005, 0));
    console.log('current volume: ', player.getVolume());
  }
  const raiseVolume = () => {
    player.setVolume(Math.min(player.getVolume() + 0.005, 1));
    console.log('current volume: ', player.getVolume());
  }
  return {
    player,
    togglePlayer,
    lowerVolumne,
    raiseVolume
  }
}

/**
 * Add Action Manager
 */
const AddActionManager = (scene: Scene) => {
  const inputMap: Record<string, any> = {};
  const actionManager = new ActionManager(scene);

  scene.actionManager = actionManager;
  actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
    if (evt.sourceEvent) {
      const { key, type } = evt.sourceEvent as KeyboardEvent;
      inputMap[key.toLowerCase()] = type === 'keydown';
    }
  }))

  actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
    if (evt.sourceEvent) {
      const { key, type } = evt.sourceEvent as KeyboardEvent;
      inputMap[key.toLowerCase()] = type === 'keydown';
    }
  }))

  return {
    actionManager,
    inputMap,
  }
}

const BuildHouse = (scene: Scene, mode: HouseMode) => {
  const roof = buildRoof(scene, mode).roof;
  const box = buildBox(scene, mode).box;
  const house = Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);
  return house;
}

const BuildCar = (scene: Scene) => {
  //material
  const carMat = new StandardMaterial("carMat", scene);
  carMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/car.png", scene);

  // base
  const outline = [
    new Vector3(-0.3, 0, -0.1),
    new Vector3(0.2, 0, -0.1),
  ]
  // Curve Front
  for (let i = 0; i < 20; i++) {
    outline.push(new Vector3(0.2 * Math.cos(i * Math.PI / 40), 0, 0.2 * Math.sin(i * Math.PI / 40) - 0.1));
  }
  // Top
  outline.push(new Vector3(0, 0, 0.1));
  outline.push(new Vector3(-0.3, 0, 0.1));

  const car = MeshBuilder.ExtrudePolygon('car', { shape: outline, depth: 0.2, faceUV: carFaceUV, wrap: true });
  car.material = carMat;

  const wheelMat = new StandardMaterial("wheelMat", scene);
  wheelMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/wheel.png", scene);
  const wheelRB = MeshBuilder.CreateCylinder("wheelRB", { diameter: 0.125, height: 0.05, faceUV: wheelUV })
  wheelRB.material = wheelMat;

  wheelRB.parent = car;
  wheelRB.position.z = -0.1;
  wheelRB.position.x = -0.2;
  wheelRB.position.y = 0.035;

  const wheelRF = wheelRB.clone("wheelRF");
  wheelRF.position.x = 0.1;

  const wheelLB = wheelRB.clone("wheelLB");
  wheelLB.position.y = -0.2 - 0.035;

  const wheelLF = wheelRF.clone("wheelLF");
  wheelLF.position.y = -0.2 - 0.035;
  const animWheel = new Animation("wheelAnimation", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

  const wheelKeys = [];
  //At the animation key 0, the value of rotation.y is 0
  wheelKeys.push({
    frame: 0,
    value: 0
  });
  //At the animation key 30, (after 1 sec since animation fps = 30) the value of rotation.y is 2PI for a complete rotation
  wheelKeys.push({
    frame: 60,
    value: 2 * Math.PI
  });

  //Link this animation to the right back wheel
  const animations = [animWheel];
  wheelRB.animations = animations;
  wheelRF.animations = animations;
  wheelLB.animations = animations;
  wheelLF.animations = animations;


  animWheel.setKeys(wheelKeys);

  //Begin animation - object to animate, first frame, last frame and loop if true
  scene.beginAnimation(wheelRB, 0, 60, true);
  scene.beginAnimation(wheelRF, 0, 60, true);
  scene.beginAnimation(wheelLB, 0, 60, true);
  scene.beginAnimation(wheelLF, 0, 60, true);

  const animCar = new Animation('carAnimation', 'position.z', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

  const carKeys = [];
  carKeys.push({
    frame: 0,
    value: 20
  });
  carKeys.push({
    frame: 300,
    value: -16
  });
  animCar.setKeys(carKeys);
  car.animations = [animCar];

  car.position.set(5, 0.17, 10);
  car.rotation.x = -Math.PI / 2;
  car.rotation.z = Math.PI / 2;
  car.scaling.add(new Vector3(20, 20, 20));

  scene.beginAnimation(car, 0, 300, true, 0.4);
  
  const followCamera = new FollowCamera('Car Camera', new Vector3(5, 4, 12), scene, car);
  followCamera.heightOffset = 8;
  followCamera.radius = 1;
  followCamera.rotationOffset = 0;
  followCamera.cameraAcceleration = 0.005;
  followCamera.maxCameraSpeed = 10;
  return car;
}

let villagerIndex = 0;
const buildVillager = (scene: Scene) => {
  villagerIndex++;
  return SceneLoader.ImportMeshAsync("him", "/scenes/Dude/", "Dude.babylon", scene).then((result) => {
    var dude = result.meshes[0];

    dude.scaling = new Vector3(0.005, 0.005, 0.005);
    dude.position.set(5, 0.05, 5);
    addShadow(dude);
    scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

    const cameraPosition = dude.position.clone();
    cameraPosition.y = 60;
    const camera = new ArcRotateCamera('Villager Cam '+ villagerIndex, Math.PI / 2, Math.PI / 2.5, 150, cameraPosition, scene);
    // camera.attachControl(scene, true);
    camera.parent = dude;
    camera.beta = Math.PI / 3;

    
    var forward = new Vector3(0,0,1);		
    const m = dude.getWorldMatrix();
    forward = Vector3.TransformCoordinates(dude.position, m);

    const origin = dude.position;
    var direction = forward.subtract(origin);
    direction = Vector3.Normalize(direction);

    const ray = new Ray(dude.position, direction, 100);


		let rayHelper = new RayHelper(ray);		
		rayHelper.show(scene);

    const hit = scene.pickWithRay(ray);

    return dude
});
}

const buildXr = async (scene: Scene) => {
  try {
    const xrHelper = await scene.createDefaultXRExperienceAsync({});
    // const sessionManager = await xrHelper.enterExitUI('immersive-vr', 'local-floor');
    
  //   xrHelper.onStateChangedObservable.add((state) => {
  //     console.log(state);
  //     switch (state) {
  //         case WebXRState.IN_XR:
  //             // XR is initialized and already submitted one frame
  //         case WebXRState.ENTERING_XR:
  //             // xr is being initialized, enter XR request was made
  //         case WebXRState.EXITING_XR:
  //             // xr exit request was made. not yet done.
  //         case WebXRState.NOT_IN_XR:
  //             // self explanatory - either out or not yet in XR
  //     }
  // })
  } catch (e) {
    console.error(e);
  }
}

const generateBuilding = (detached_house: Mesh, semi_house: Mesh) => {
  const places = [];
  places.push([1, -Math.PI / 16, -6.8, 2.5]);
  places.push([2, -Math.PI / 16, -4.5, 3]);
  places.push([2, -Math.PI / 16, -1.5, 4]);
  places.push([2, -Math.PI / 3, 1.5, 6]);
  places.push([2, 15 * Math.PI / 16, -6.4, -1.5]);
  places.push([1, 15 * Math.PI / 16, -4.1, -1]);
  places.push([2, 15 * Math.PI / 16, -2.1, -0.5]);
  places.push([1, 5 * Math.PI / 4, 0, -1]);
  places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3]);
  places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5]);
  places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7]);
  places.push([2, Math.PI / 1.9, 4.75, -1]);
  places.push([1, Math.PI / 1.95, 4.5, -3]);
  places.push([2, Math.PI / 1.9, 4.75, -5]);
  places.push([1, Math.PI / 1.9, 4.75, -7]);
  places.push([2, -Math.PI / 3, 5.25, 2]);
  places.push([1, -Math.PI / 3, 6, 4]);

  const houses = [];
  for (let i = 0; i < places.length; i++) {
    if (places[i][0] === 1) {
      houses[i] = detached_house.clone("house" + i);
    }
    else {
      houses[i] = semi_house.clone("house" + i);
    }
    houses[i].rotation.y = places[i][1];
    houses[i].position.x = places[i][2] * 2;
    houses[i].position.z = places[i][3] * 2;
  }
  detached_house.dispose();
  semi_house.dispose();
  return houses;
};

const buildTriangleAnimate = (scene: Scene) => {

  // Create Triangle
  const points = [
    new Vector3(2, 1, 2),
    new Vector3(2, 1, -2),
    new Vector3(2, 1.7320508075688772 * 2, 0),
    new Vector3(2, 1, 2),
  ]

  const triangle = MeshBuilder.CreateLines('triangle', { points });
  const sphere = MeshBuilder.CreateSphere('ball', { diameter: .25 });
  sphere.position = points[0];


  let p = 0;
  let distance = 0;
  const step = 0.05;
  
  const slide = function (turn: number, dist: number) { //after covering dist apply turn
    return { turn, dist };
  }

  const track: Record<string, any> = [];
  track.push(slide(Math.PI * 2 / 3, 4));
  track.push(slide(Math.PI * 2 / 3, 8));
  track.push(slide(Math.PI * 2 / 3, 12));
  console.log(track);
    // sphere.movePOV(0, 0, 4);
  scene.onBeforeRenderObservable.add(() => {
    sphere.movePOV(0, 0, step);
    distance += step;
    if (distance > track[p].dist) {
      sphere.rotate(Axis.X, track[p].turn, Space.LOCAL);
      p +=1;
      p %= track.length;
      if (p === 0) {
          distance = 0;
          sphere.position = points[0].clone(); //reset to initial conditions
          sphere.rotation = Vector3.Zero();//prevents error accumulation
      }
    }
  });


  return [triangle, sphere];
}

const buildSky = (scene: Scene) => {
  const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
  skybox.position.set(0, 0, 0);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
  skyboxMaterial!.reflectionTexture!.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  return skybox;
}

const buildFountain = (scene: Scene) => {
  const foutainProfile = [
    new Vector3(0, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(0.3, 2, 0),
    new Vector3(1, 3, 0),
    new Vector3(1, 5, 0),
    // new Vector3(1, 5, 0),
    new Vector3(0, 3, 0),
  ];

  const fountain = MeshBuilder.CreateLathe('fountain', { shape: foutainProfile, sideOrientation: Mesh.DOUBLESIDE }, scene);
  fountain.position.set(5, 0, 5);
  const fountainMat = new StandardMaterial('fountain mat', scene);
  fountainMat.diffuseColor = new Color3(0.4, 0.4, 0);
  fountain.material = fountainMat;

  // Particular system
  const particleSystem = new ParticleSystem("fountain water", 2400, scene);
  particleSystem.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png', scene);

  particleSystem.emitter = fountain;
  particleSystem.minEmitBox = new Vector3(0, 10, 5);
  particleSystem.minEmitBox = new Vector3(0, 10, 0);

  particleSystem.color1 = new Color4(0.4, 0.4, 0.0, 1);
  particleSystem.color2 = new Color4(0.45, 0.6, 1.0, 0.5);
  particleSystem.colorDead = new Color4(0, 0.2, 0, 0);

  // Size of each particle (random between ...)
  particleSystem.minSize = 0.2;
  particleSystem.maxSize = 0.5;

  particleSystem.minLifeTime = 3;
  particleSystem.maxLifeTime = 4;

  particleSystem.emitRate = 2000;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
  
  particleSystem.gravity = new Vector3(0, -9.81, 0);

  // Direction of each particle after it has been emitted
  particleSystem.direction1 = new Vector3(-2, 8, 2);
  particleSystem.direction2 = new Vector3(2, 8, -2);

  // Angular speed, in radians
  particleSystem.minAngularSpeed = 2;
  particleSystem.maxAngularSpeed = Math.PI;

  // Speed
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;
  particleSystem.updateSpeed = 0.025;

  // Start the particle system
  // particleSystem.start();

  return fountain;
}

const buildGUI = (scene: Scene, light: Light) => {

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const panel = new StackPanel();
    panel.width = "220px";
    panel.top = "-50px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(panel);

    const header = new TextBlock();
    header.text = "Night to Day";
    header.height = "30px";
    header.color = "white";
    panel.addControl(header); 

    const slider = new Slider();
    slider.minimum = 0;
    slider.maximum = 1;
    slider.borderColor = "black";
    slider.color = "gray";
    slider.background = "white";
    slider.value = light.intensity;
    slider.height = "20px";
    slider.width = "200px";
    slider.onValueChangedObservable.add((value) => {
        if (light) {
            light.intensity = value;
        }
    });
    panel.addControl(slider);
    
    return panel;
}

const addShadow = (mesh: AbstractMesh) => {
  shadowGenerator.addShadowCaster(mesh, true);
};

export {
  buildCamera,
  buildLight,
  buildBox,
  buildRoof,
  BuildHouse,
  BuildCar,
  buildGround,
  buildBGM,
  buildSky,
  buildVillager,
  buildXr,
  buildGUI,
  buildTriangleAnimate,
  buildFountain,
  AddActionManager,
  generateBuilding,
  addShadow,
  HouseMode,
}