import type { ObjectID, ObjectRef, Scene } from "@/types/scene";

export function findSceneObject(activeObjectRef: ObjectRef, scene: Scene) {
  switch (activeObjectRef.kind) {
    case "Environment":
      throw new Error("useActiveObject: not Implemented");
    case "Camera":
      return scene.cameras[activeObjectRef.id];
    case "Light":
    case "Mesh":
    case "Group":
      return scene.sceneGraph.objects[activeObjectRef.id];
    default:
      return null;
  }
}
