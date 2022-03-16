import { EngineView, Scene } from "@babylonjs/core";
import { useEffect, useMemo, useState } from "react";
import CameraView from "./CameraButton";



type CameraRenderProps = {
  scene: Scene,
  activeId: string;
};
const CameraRender = ({ scene, activeId }: CameraRenderProps) => {

  const a = new EngineView()

  const [selected, select] = useState(activeId);

  const nodes = useMemo(() => (
    scene.cameras.map(camera => (<CameraView 
        camera={camera}
        key={camera.id}
        name={camera.name}
        selected={selected === camera.id}
        onClick={() => {
          select(camera.id);
          scene.setActiveCameraByID(camera.id);
          camera.attachControl(true)
        }}
      />)
    )
  ), [scene, selected]);


  return <>
    {nodes}
  </>
};

export default CameraRender;