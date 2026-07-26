import { useHandlers, useSceneEntities } from "@/app/ApplicationKernelContext";
import { useSceneStore } from "@/store/sceneStore";
import type { ActiveEntity, ObjectID } from "@/types/scene";
import { useState } from "react";
import { GraphItem } from "../molecules/scene/GraphItem";
import { produce } from "immer";
import { useSessionStore } from "@/store/sessionStore";
import { enableMapSet } from "immer";

enableMapSet();

export function SceneGraph({ activeObj }: { activeObj: ActiveEntity | null }) {
  const { selection } = useHandlers();
  const sceneEntities = useSceneEntities();
  const sceneThree = useSceneStore().scene!.sceneGraph.graphThree;
  const activeID = activeObj?.id;
  const [hiddenNodes, setHiddenNodes] = useState<Set<ObjectID>>(new Set());
  const graphItems = [];

  var hiddenLevel = null;

  for (const entity of sceneEntities) {
    const isHidden = entity.parentId ? hiddenNodes.has(entity.parentId) : false;
    if (isHidden) {
      hiddenLevel = entity.level;
    } else {
      if (hiddenLevel == null || entity.level <= hiddenLevel) {
        hiddenLevel = null;
        graphItems.push(
          <GraphItem
            key={entity.id}
            item={entity}
            isActive={activeID == entity.id}
            isParent={
              sceneThree[entity.id] !== undefined &&
              sceneThree[entity.id].length > 0
            }
            onSelect={() => {
              entity.id === activeID
                ? selection.execute({ id: null })
                : selection.execute({ id: entity.id });
            }}
            onToggleBranch={() => {
              if (hiddenNodes.has(entity.id))
                setHiddenNodes(
                  produce(hiddenNodes, (draft) => {
                    draft.delete(entity.id);
                  })
                );
              else
                setHiddenNodes(
                  produce(hiddenNodes, (draft) => draft.add(entity.id))
                );
            }}
            hidden={hiddenNodes.has(entity.id)}
          />
        );
      }
    }
  }
  return graphItems;
}
