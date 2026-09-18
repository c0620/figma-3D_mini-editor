import { IDs } from "@/io/sceneEncoder";
import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";
import { threeAssetRegistry } from "@/store/threeAssetRegistry";

import { TEST_IDS, createBasicScene } from "./sceneFixtures";

export function resetStores(): void {
  useSceneStore.setState({ scene: null });
  useSessionStore.setState({
    colorTheme: "Dark",
    windowSize: "Large",
    activeObjectRef: null,
    activeCameraID: IDs.PluginCamera,
    projectName: "",
    notifications: [],
    decisions: [],
    canUndo: false,
    canRedo: false,
    activeObjectTool: null,
    isCameraPreview: false,
    isParamsClosed: false,
    cameraCustomAngle: null,
    modalType: null,
  });
  threeAssetRegistry.clear();
  threeAssetRegistry.materials = {};
}

export function loadBasicScene() {
  const scene = createBasicScene();
  useSceneStore.getState().loadScene(scene);
  useSessionStore.getState().setActiveCameraID(TEST_IDS.camera);
  return scene;
}
