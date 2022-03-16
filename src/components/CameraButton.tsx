import { Camera, Scene } from "@babylonjs/core";
import { useEffect, useRef } from "react";

type CameraButtonProps = {
  name: string;
  onClick: () => void;
  selected: boolean;
  camera: Camera;
}

const CameraView = ({ name, camera, onClick, selected }: CameraButtonProps) => {
  return (
    <div
      style={{
        padding: '0 20px',
        height: 40,
        margin: '5px',
        minWidth: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '1px solid black',
        color: selected ? 'whitesmoke' : 'black',
        borderRadius: 10,
        cursor: 'pointer',
        background: selected ? 'blue' : 'whitesmoke',
      }}
      onClick={onClick}>
        {name}
        {/* <canvas
          onClick={onClick}
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          id={canvasId}
       /> */}
    </div>
  );
};

export default CameraView;