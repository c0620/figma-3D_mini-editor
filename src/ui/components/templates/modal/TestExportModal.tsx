import { useTransfer } from "@/app/ApplicationKernelContext";
import { Modal } from "./Modal";
import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/store/sessionStore";

 function FileLoader({data, filename, text}: { data: Promise<Blob>; filename: string; text: string }) {
    const [link, setLink] = useState<string | null>(null);
    const downloadRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        async function loadFile() {
            const link = await data.then((blob) => {
                return URL.createObjectURL(blob);
            });
            downloadRef.current!.href = link;
            setLink(link);
        }

        loadFile();

        return () => {
            if (link) {
                URL.revokeObjectURL(link);
            }
        };
    }, []);

    return <a download={filename} ref={downloadRef}>
        {text}
    </a>
}

export function TestExportModal() {
    const type = useSessionStore((s) => s.modalType);
    const transfer = useTransfer();
    transfer.exportSceneToDevice
    return type == "export" && (
        <Modal title="Export Scene">
            <p>Choose an export format:</p>
            <FileLoader data={transfer.exportSceneToDevice("PNG")} filename="scene.png" text="Export as PNG" />
            <FileLoader data={transfer.exportSceneToDevice("OBJ")} filename="scene.obj" text="Export as OBJ" />
            <FileLoader data={transfer.exportSceneToDevice("GLTF")} filename="scene.gltf" text="Export as GLTF" />
        </Modal>
    )
}