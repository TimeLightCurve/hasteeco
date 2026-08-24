"use client";

import "@photo-sphere-viewer/core/index.css";
import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import type { TourLink, TourScene, TourView } from "@/lib/tour-data";
import styles from "./tour-admin.module.css";

type ScreenMarker = {
  nodeId: string;
  index: number;
  placement: NonNullable<TourLink["placement"]>;
  action: NonNullable<TourLink["action"]>;
  x: number;
  y: number;
  visible: boolean;
};

type PanoramaLinkEditorProps = {
  scene: TourScene;
  rooms: TourScene[];
  selectedLink: number | null;
  onSelectLink: (index: number) => void;
  onLinksChange: (links: TourLink[]) => void;
  onArrivalViewChange: (direction: "forward" | "backward", view: TourView | undefined) => void;
};

const toRadians = (degrees: number) => degrees * Math.PI / 180;
const toDegrees = (radians: number) => radians * 180 / Math.PI;
const normalizeYaw = (degrees: number) => ((degrees + 180) % 360 + 360) % 360 - 180;

export function PanoramaLinkEditor({
  scene,
  rooms,
  selectedLink,
  onSelectLink,
  onLinksChange,
  onArrivalViewChange,
}: PanoramaLinkEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const projectMarkersRef = useRef<() => void>(() => undefined);
  const linksRef = useRef(scene.links);
  const [markers, setMarkers] = useState<ScreenMarker[]>([]);
  const [draggingLink, setDraggingLink] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let viewer: Viewer | null = null;

    const frame = window.requestAnimationFrame(() => {
      if (!container.isConnected) return;
      setIsReady(false);
      viewer = new Viewer({
        container,
        panorama: scene.panorama,
        defaultYaw: `${scene.initialYaw}deg`,
        defaultPitch: `${scene.initialPitch}deg`,
        defaultZoomLvl: 10,
        navbar: false,
        mousewheelCtrlKey: false,
        touchmoveTwoFingers: false,
      });
      viewerRef.current = viewer;

      const projectMarkers = () => {
        if (!viewer?.state.ready) return;
        setMarkers(linksRef.current.map((link, index) => {
          const position = { yaw: toRadians(link.yaw), pitch: toRadians(link.pitch ?? -18) };
          const point = viewer!.dataHelper.sphericalCoordsToViewerCoords(position);
          return {
            nodeId: link.nodeId,
            index,
            placement: link.placement ?? "ground",
            action: link.action ?? "move",
            x: point.x,
            y: point.y,
            visible: viewer!.dataHelper.isPointVisible(position),
          };
        }));
      };

      projectMarkersRef.current = projectMarkers;
      viewer.addEventListener("ready", () => {
        setIsReady(true);
        projectMarkers();
      }, { once: true });
      viewer.addEventListener("render", projectMarkers);
      if (viewer.state.ready) {
        setIsReady(true);
        projectMarkers();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      projectMarkersRef.current = () => undefined;
      viewerRef.current = null;
      viewer?.destroy();
    };
  }, [scene.id, scene.panorama, scene.initialPitch, scene.initialYaw]);

  useEffect(() => {
    linksRef.current = scene.links;
    projectMarkersRef.current();
  }, [scene.links]);

  useEffect(() => {
    if (draggingLink === null) return;

    const move = (event: PointerEvent) => {
      const viewer = viewerRef.current;
      const container = containerRef.current;
      if (!viewer || !container) return;
      const bounds = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      const position = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });
      const links = linksRef.current.map((link, index) => index === draggingLink
        ? {
            ...link,
            yaw: Number(normalizeYaw(toDegrees(position.yaw)).toFixed(2)),
            pitch: Number(toDegrees(position.pitch).toFixed(2)),
          }
        : link);
      linksRef.current = links;
      onLinksChange(links);
      projectMarkersRef.current();
    };

    const stop = () => setDraggingLink(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
  }, [draggingLink, onLinksChange]);

  const captureArrivalView = (direction: "forward" | "backward") => {
    const position = viewerRef.current?.getPosition();
    if (!position) return;
    onArrivalViewChange(direction, {
      yaw: Number(normalizeYaw(toDegrees(position.yaw)).toFixed(2)),
      pitch: Number(toDegrees(position.pitch).toFixed(2)),
    });
  };

  return (
    <div className={styles.editorStage}>
      <div ref={containerRef} className={styles.editorViewer} aria-label={`360 editor for ${scene.name}`} />
      <div className={styles.markerLayer}>
        {markers.map((marker) => {
          const roomName = rooms.find((room) => room.id === marker.nodeId)?.name ?? marker.nodeId;
          return (
            <button
              type="button"
              key={`${marker.nodeId}-${marker.index}`}
              className={`${styles.editorMarker} ${styles[`editorMarker${marker.placement[0].toUpperCase()}${marker.placement.slice(1)}`]} ${marker.action === "light" ? styles.editorMarkerLight : ""} ${selectedLink === marker.index ? styles.editorMarkerSelected : ""}`}
              style={{ left: marker.x, top: marker.y, display: marker.visible ? "grid" : "none" }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelectLink(marker.index);
                setDraggingLink(marker.index);
              }}
              aria-label={`Move link to ${roomName}`}
              title={`Drag link to ${roomName}`}
            >
              <span />
              <b>{marker.index + 1}</b>
            </button>
          );
        })}
      </div>
      <div className={styles.editorHint}>
        {isReady ? "Drag a numbered pin onto the exact door or entrance" : "Loading panorama editor…"}
      </div>
      <div className={styles.arrivalCapture}>
        <span>Rotate the panorama, then save the target view</span>
        <div>
          <button type="button" onClick={() => captureArrivalView("forward")} disabled={!isReady}>
            {scene.arrivalViews?.forward ? "Update forward view" : "Set forward view"}
          </button>
          {scene.arrivalViews?.forward && (
            <button type="button" className={styles.clearArrivalView} onClick={() => onArrivalViewChange("forward", undefined)}>Clear</button>
          )}
          <button type="button" onClick={() => captureArrivalView("backward")} disabled={!isReady}>
            {scene.arrivalViews?.backward ? "Update backward view" : "Set backward view"}
          </button>
          {scene.arrivalViews?.backward && (
            <button type="button" className={styles.clearArrivalView} onClick={() => onArrivalViewChange("backward", undefined)}>Clear</button>
          )}
        </div>
      </div>
    </div>
  );
}
