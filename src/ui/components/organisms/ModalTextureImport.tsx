import { useHandlers } from "@/app/ApplicationKernelContext";
import type { MaterialID, TextureSlot } from "@/types/scene";
import { Children, useState } from "react";

export function ModalMini({
  open,
  changeOpen,
  children,
}: {
  //   materialId: MaterialID;
  //   slot: TextureSlot;
  open: boolean;
  changeOpen: () => void;
  children: React.ReactNode;
}) {
  return open ? (
    <div
      style={{
        backgroundColor: "blue",
        opacity: "50%",
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "1000",
      }}
      onClick={changeOpen}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "blue" }}
      >
        {children}
      </div>
    </div>
  ) : null;
}
