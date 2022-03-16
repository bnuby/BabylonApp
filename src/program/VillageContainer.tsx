import { Vector3, Mesh, Scene, SceneLoader, TransformNode, ArcRotateCamera, StandardMaterial, AbstractMesh, PointerEventTypes, WebXRExperienceHelper } from "@babylonjs/core";
// import SceneComponent from "./SceneComponent"; // uses above component in same directory
import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.
import { MutableRefObject } from "react";
import { render } from "react-dom";
import "../App.css";
import CameraRender from "../components/CameraRender";
import VillagerMesh, { VillagerAction } from "../customMesh/VillagerMesh";
import { MeshBuilder } from "../override/MeshBuilder";
import { AddActionManager, buildBGM, buildCamera, buildGround, buildLight, HouseMode, BuildHouse, generateBuilding, BuildCar, buildVillager, buildTriangleAnimate, buildSky, buildFountain, buildGUI, addShadow, buildXr } from "./Village";

let box2: Mesh;
let villager: VillagerMesh | null = null;

const houses: AbstractMesh[] = [];

const addHouse = (...house: AbstractMesh[]) => houses.push(...house);

const asyncReady = async (scene: Scene, cameraListRef: VillageContainerProps['cameraListRef']) => {
  const result = await Promise.all([
    buildVillager(scene),
    buildXr(scene),
  ]);

  villager = new VillagerMesh(result[0]);

  villager.min(0, 0, -10);
  villager.max(2, 2, 10);
  villager.setSpeed(50);
  villager.setAction(VillagerAction.Move)

  const activeCamera = scene.activeCamera!;

  // lock camera not to below ground
  scene.cameras.forEach((camera) => {
    if (camera instanceof ArcRotateCamera) {
      camera.upperBetaLimit = Math.PI / 2.2
    }
  })

  // Add Camera button
  render(
    <CameraRender scene={scene} activeId={activeCamera.id} />,
    cameraListRef.current
  );
};


const onSceneReady = (scene: Scene, cameraListRef: VillageContainerProps['cameraListRef']) => {


  // Our built-in 'box' shape.
  box2 = MeshBuilder.CreateBox("box", { size: -.25 }, scene);
  box2.position.set(5, .25, 0);
  const material2 = new StandardMaterial('mat', scene);
  material2.diffuseColor.set(1, 0, 0);
  material2.alpha = 0.5;
  box2.material = material2;
  
  const box3 = box2.clone();
  box3.position.set(0, .25, 5);
  const material3 = new StandardMaterial('mat', scene);
  material3.diffuseColor.set(0, 0, 1);
  material3.alpha = 0.5
  box3.material = material3;

  buildCamera(scene);
  const { light } = buildLight(scene);
  buildGUI(scene, light);
  buildGround(scene);
  buildTriangleAnimate(scene);
  buildSky(scene);
  const fountain = buildFountain(scene);
  
  const detached_house = BuildHouse(scene, HouseMode.Detached)!;
  const semi_house = BuildHouse(scene, HouseMode.Semi)!;

  const car = BuildCar(scene);
  addShadow(car);
  addShadow(fountain);

  const buildings  = generateBuilding(detached_house, semi_house);
  addHouse(detached_house, semi_house, ...buildings);

  houses.forEach((house) => {
    addShadow(house);
  });

  const {
    togglePlayer,
    raiseVolume,
    lowerVolumne
  } = buildBGM(scene);
  const { inputMap } = AddActionManager(scene);

  asyncReady(scene, cameraListRef);

  scene.onPointerObservable.add((pointerInfo) => {
    switch(pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        if (pointerInfo.pickInfo?.pickedMesh === fountain) {
          const particleSystem = fountain.getConnectedParticleSystems()[0];
          if (particleSystem.isStarted()) {
            particleSystem.stop()
          } else {
            particleSystem.start()
          }
        }
        break;
    }
  });
  
  scene.onBeforeRenderObservable.add(() => {
    if (villager) {
      villager.animate();
    }

    if (inputMap['p']) {
      togglePlayer();
    }

    if (inputMap['/']) {
      lowerVolumne();
    }

    if (inputMap['\'']) {
      raiseVolume()
    }

    if (inputMap['w']) {
      houses.forEach(house => {
        house.position.z += 0.05;
      })
    }

    if (inputMap['a']) {

      houses.forEach(house => {
        house.position.x -= 0.05;
      })
      // mover.position.x -= 0.05;
    }

    if (inputMap['s']) {

      houses.forEach(house => {
        house.position.z -= 0.05;
      })
      // mover.position.z -= 0.05;
    }

    if (inputMap['d']) {

      houses.forEach(house => {
        house.position.x += 0.05;
      })
      // mover.position.x += 0.05;
    }


    houses.forEach(house => {
      if (house && box2 && house.intersectsMesh(box2)) {
        if (inputMap['w']) {
          house.position.z -= 0.1;
        }
  
        if (inputMap['a']) {
          house.position.x += 0.1;
        }
  
        if (inputMap['s']) {
          house.position.z += 0.1;
        }
  
        if (inputMap['d']) {
          house.position.x -= 0.1;
        }
      }
    });
  });

};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene: Scene) => {

};

type VillageContainerProps = {
  cameraListRef: MutableRefObject<HTMLDivElement | null>,
}

const VillageContainer = ({ cameraListRef }: VillageContainerProps) => (
    <SceneComponent style={{
      width: '100vw',
      height: '100%'
    }}
    antialias onSceneReady={(scene) => onSceneReady(scene, cameraListRef)} onRender={onRender} id="my-canvas" />
);

export default VillageContainer;