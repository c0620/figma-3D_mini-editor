import { create } from "zustand";
import type { AmbientLight, Object3D, PointLight, SpotLight } from "three";
import type { ObjectID } from "@/types/scene";

interface ViewportObjectState {
  byId: Record<ObjectID, Object3D>;
  lights: Record<ObjectID, SpotLight | AmbientLight | PointLight>;
}

interface ViewportObjectActions {
  register(id: ObjectID, object: Object3D): void;
  unregister(id: ObjectID): void;
  registerLight(
    id: ObjectID,
    object: SpotLight | AmbientLight | PointLight
  ): void;
  unregisterLight(id: ObjectID): void;
}

export const useViewportObjectStore = create<
  ViewportObjectState & ViewportObjectActions
>((set) => ({
  byId: {},
  lights: {},

  register: (id, object) =>
    set((state) => ({ byId: { ...state.byId, [id]: object } })),

  unregister: (id) =>
    set((state) => {
      if (!(id in state.byId)) return state;
      const { [id]: _, ...byId } = state.byId;
      return { byId };
    }),

  registerLight: (id, object) =>
    set((state) => ({ lights: { ...state.lights, [id]: object } })),

  unregisterLight: (id) =>
    set((state) => {
      if (!(id in state.lights)) return state;
      const { [id]: _, ...lights } = state.lights;
      return { lights };
    }),
}));
