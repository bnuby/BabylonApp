import { Color4, Mesh, MeshBuilder as DefaultMeshBuilder, Nullable, Scene, Vector4 } from '@babylonjs/core';



export class MeshBuilder extends DefaultMeshBuilder {
  static CreateBox: typeof DefaultMeshBuilder.CreateBox = (name: string, options: {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    faceUV?: Vector4[];
    faceColors?: Color4[];
    sideOrientation?: number;
    frontUVs?: Vector4;
    backUVs?: Vector4;
    wrap?: boolean;
    topBaseAt?: number;
    bottomBaseAt?: number;
    updatable?: boolean;
}, scene?: Nullable<Scene>): Mesh => {
  const result = DefaultMeshBuilder.CreateBox(name, options, scene);

  // console.log(options);
  // console.log(result.scaling.x);
  // console.log(result.getAbsolutePosition());
  // console.log(result.scaling.y);
  // result.getPositions = function() {
  //   return [];
  // };
  return result;
  }
}

console.log(Object.getOwnPropertyNames(MeshBuilder));