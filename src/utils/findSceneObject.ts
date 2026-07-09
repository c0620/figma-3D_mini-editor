import type { ObjectID, ObjectRef, Scene, SceneObject } from "@/types/scene";

export function findSceneObject(
  activeObjectRef: ObjectRef,
  scene: Scene
): SceneObject | null {
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
