import { AbstractMesh } from "@babylonjs/core";

enum Direction {
  Forward,
  Backward,
}

enum VillagerAction {
  Idle,
  Move,
};

class VillagerMesh extends AbstractMesh {
  
  public maxX: number;
  public maxY: number;
  public maxZ: number;
  public minX: number;
  public minY: number;
  public minZ: number;
  private speed: number;
  private isRotate: boolean;
  private direction: Direction;
  private action: VillagerAction = VillagerAction.Idle;
  

  constructor(mesh: AbstractMesh) {
    super(mesh.name, mesh.getScene());
    Object.assign(this, mesh);
    this.speed = 1;
    this.minX = 0;
    this.minY = 0;
    this.minZ = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.maxZ = 0;
    this.isRotate = false;
    this.direction = Direction.Forward;
  }

  setAction(action: VillagerAction) {
    this.action = action;
  }

  setSpeed(speed: number) {
    if (speed < 0) {
      console.error('Speed is not allow to below 1');
    }
    this.speed = Math.max(speed, 1);
  }

  min(minX: number, minY: number, minZ: number) {
    if (minZ > this.maxZ) {
      throw new Error("Invalid Min Z");
    } else if (minY > this.maxY) {
      throw new Error("Invalid Min Y");
    } else if (minX > this.maxX) {
      throw new Error("Invalid Min X");
    }
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
  }

  max(maxX: number, maxY: number, maxZ: number) {
    if (maxZ < this.minZ) {
      throw new Error("Invalid Max Z");
    } else if (maxY < this.minY) {
      throw new Error("Invalid Max Y");
    } else if (maxX < this.minX) {
      throw new Error("Invalid Max X");
    }
    this.maxX = maxX;
    this.maxY = maxY;
    this.maxZ = maxZ;
  }

  animate() {
    const { position: { x, y, z }, rotation, isRotate, direction, action, maxZ, minZ } = this;
    switch (action) {
      case VillagerAction.Idle:
        break;

      case VillagerAction.Move:
        if (!isRotate) {
          this.movePOV(0, 0, 0.0005 * this.speed);
          switch (direction) {
            case Direction.Forward:
              if (z <= this.minZ) {
                this.direction = Direction.Backward;
                this.isRotate = true;
              }
              break;
              
            case Direction.Backward:
              if (z >= this.maxZ) {
                this.direction = Direction.Forward;
                this.isRotate = true;
              }
              break;
          }
        } else {
          const rotateTime = direction === Direction.Forward ? 1 : -1;
          const rotateConstant = Math.PI * rotateTime * 0.001 * this.speed;
          this.rotatePOV(0, rotateConstant, 0);
          if (Math.abs(rotation.y) >= Math.PI || rotation.y >= 0) {
            this.isRotate = false;
          }
        }
        break;

    }

  }

}

export default VillagerMesh;

export {
  Direction,
  VillagerAction,
};