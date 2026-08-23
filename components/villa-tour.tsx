"use client";

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "./villa-tour.css";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Viewer, utils } from "@photo-sphere-viewer/core";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { sceneZones, tourScenes, type TourScene } from "@/lib/tour-data";
import {
  ArrowIcon,
  CloseIcon,
  CompassIcon,
  FullscreenIcon,
  InfoIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
} from "./icons";

const degreesToRadians = (degrees: number) => degrees * Math.PI / 180;
const normalizeRadians = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

function createFloorArrow() {
  const arrow = document.createElement("button");
  arrow.type = "button";
  arrow.className = "floor-target";
  arrow.setAttribute("aria-label", "Move to the next space");

  for (const className of ["floor-target__pulse", "floor-target__ring", "floor-target__dot"]) {
    const layer = document.createElement("span");
    layer.className = className;
    arrow.appendChild(layer);
  }

  return arrow;
}

type VillaTourProps = {
  initialScenes?: TourScene[];
  projectName?: string;
};

export function VillaTour({ initialScenes = tourScenes, projectName = "Haste Eco" }: VillaTourProps) {
  const viewerElementRef = useRef<HTMLDivElement>(null);
  const floorReticleRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const tourPluginRef = useRef<VirtualTourPlugin | null>(null);
  const [scenes, setScenes] = useState(initialScenes);
  const [currentSceneId, setCurrentSceneId] = useState(initialScenes[0]?.id ?? "scene-1");
  const [isReady, setIsReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const scenesById = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  const currentScene = scenesById.get(currentSceneId) ?? scenes[0] ?? initialScenes[0] ?? tourScenes[0];

  useEffect(() => {
    if (!viewerElementRef.current || viewerRef.current) return;
    const container = viewerElementRef.current;
    let viewer: Viewer | null = null;
    let entranceAnimation: { cancel: () => void } | null = null;
    let entranceFrame = 0;
    let entrancePending = false;
    let viewerIsReady = false;
    let pointerIsDown = false;
    let entranceStartZoom = 18;
    let entranceTargetZoom = 40;

    // Deferring initialization avoids leaving an in-flight panorama request behind
    // when React development mode performs its intentional mount/unmount check.
    const frameId = window.requestAnimationFrame(() => {
      if (!container.isConnected || viewerRef.current) return;

      const hashSceneId = window.location.hash.slice(1);
      const configuredScenes = structuredClone(initialScenes);
      const configuredScenesById = new Map(configuredScenes.map((scene) => [scene.id, scene]));
      const startScene = configuredScenesById.get(hashSceneId) ?? configuredScenes[0];
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setScenes(configuredScenes);
      setCurrentSceneId(startScene.id);

      const nodes = configuredScenes.map((item) => ({
        id: item.id,
        panorama: item.panorama,
        thumbnail: item.thumbnail,
        name: item.name,
        caption: item.name,
        links: item.links.map((link) => {
          const placement = link.placement ?? "ground";
          return {
            nodeId: link.nodeId,
            position: {
              yaw: `${link.yaw}deg`,
              pitch: `${link.pitch ?? -18}deg`,
            },
            arrowStyle: {
              className: `villa-link villa-link--${placement}`,
              size: placement === "ground" ? { width: 62, height: 32 } : { width: 54, height: 54 },
            },
          };
        }),
      }));

      viewer = new Viewer({
        container,
        defaultYaw: `${startScene.initialYaw}deg`,
        defaultPitch: `${startScene.initialPitch}deg`,
        defaultZoomLvl: 18,
        fisheye: 0,
        navbar: false,
        keyboard: "always",
        mousewheelCtrlKey: false,
        touchmoveTwoFingers: false,
        moveSpeed: 1.15,
        zoomSpeed: 1.25,
        plugins: [
          VirtualTourPlugin.withConfig({
            dataMode: "client",
            positionMode: "manual",
            // Pinned markers use exact spherical coordinates edited in /admin.
            renderMode: "2d",
            nodes,
            startNodeId: startScene.id,
            preload: (node) => (node.links?.length ?? 0) <= 2,
            showLinkTooltip: true,
            transitionOptions: (node, fromNode, fromLink) => {
              if (!fromNode) {
                return {
                  showLoader: true,
                  speed: 1,
                  effect: "none" as const,
                  rotation: false,
                  zoomTo: 18,
                };
              }

              entranceStartZoom = viewer?.getZoomLevel() ?? 18;
              const currentPosition = viewer?.getPosition();
              let destinationYaw = currentPosition?.yaw;

              // Panorama files do not necessarily share the same zero heading.
              // Align the clicked doorway with the reciprocal doorway in the
              // destination and preserve how far the user was looking to its
              // left or right. This keeps the physical travel direction stable.
              if (currentPosition && fromNode && fromLink) {
                const sourceScene = configuredScenesById.get(fromNode.id);
                const destinationScene = configuredScenesById.get(node.id);
                const outgoingLink = sourceScene?.links.find((link) => link.nodeId === node.id);
                const returnLink = destinationScene?.links.find((link) => link.nodeId === fromNode.id);

                if (outgoingLink && returnLink) {
                  const relativeLookYaw = normalizeRadians(
                    currentPosition.yaw - degreesToRadians(outgoingLink.yaw),
                  );
                  destinationYaw = normalizeRadians(
                    degreesToRadians(returnLink.yaw) + Math.PI + relativeLookYaw,
                  );
                }
              }

              const entrancePosition = currentPosition && {
                yaw: destinationYaw ?? currentPosition.yaw,
                pitch: currentPosition.pitch,
              };
              // Reverse the previous 0 -> peak -> 0 pulse. The destination now
              // starts with a wide fisheye and progressively contracts while
              // the camera zooms forward, matching PSV's entrance animation.
              entranceTargetZoom = Math.min(52, Math.max(40, entranceStartZoom + 18));
              entrancePending = !reducedMotion;
              return {
                showLoader: false,
                speed: reducedMotion ? 1 : 2200,
                effect: reducedMotion ? "none" : "fade",
                // Keep both panorama layers locked to the camera direction at
                // the instant navigation begins. Otherwise the virtual-tour
                // plugin rotates toward the link's fixed yaw before fading.
                rotation: false,
                rotateTo: entrancePosition,
                // Zoom and fisheye are driven by the synchronized entrance
                // animation below, while PSV owns the panorama crossfade.
                zoomTo: entranceStartZoom,
              };
            },
            arrowStyle: {
              element: () => createFloorArrow(),
              size: { width: 62, height: 32 },
              className: "villa-link",
            },
          }),
        ],
      });

      const tourPlugin = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;
      viewerRef.current = viewer;
      tourPluginRef.current = tourPlugin;

      const playEntranceAnimation = () => {
        if (!viewer || reducedMotion) return;
        entranceAnimation?.cancel();
        container.classList.add("is-entering");
        const animation = new utils.Animation({
          properties: {
            fisheye: { start: 1.9, end: 0 },
            zoom: { start: entranceStartZoom, end: entranceTargetZoom },
          },
          duration: 2200,
          easing: "inOutQuad",
          onTick: ({ fisheye, zoom }) => {
            if (!viewer) return;
            viewer.setOptions({ fisheye });
            viewer.zoom(zoom);
          },
        });
        entranceAnimation = animation;
        animation.then((completed) => {
          container.classList.remove("is-entering");
          if (completed && viewer) {
            viewer.setOptions({ fisheye: 0 });
            viewer.zoom(entranceTargetZoom);
          }
          entranceAnimation = null;
        });
      };

      const hideFloorReticle = () => {
        floorReticleRef.current?.classList.remove("is-visible");
        container.classList.remove("has-floor-reticle");
      };

      const updateFloorReticle = (event: PointerEvent) => {
        const reticle = floorReticleRef.current;
        if (!reticle || !viewer || !viewerIsReady || pointerIsDown || event.pointerType === "touch") {
          hideFloorReticle();
          return;
        }

        const eventTarget = event.target;
        if (eventTarget instanceof Element && eventTarget.closest(".psv-virtual-tour-link")) {
          hideFloorReticle();
          return;
        }

        const bounds = container.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const position = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y });
        if (position.pitch > -0.08) {
          hideFloorReticle();
          return;
        }

        const scale = Math.min(1.18, Math.max(0.78, 0.84 + Math.abs(position.pitch) * 0.28));
        reticle.style.left = `${x}px`;
        reticle.style.top = `${y}px`;
        reticle.style.setProperty("--floor-reticle-scale", String(scale));
        reticle.classList.add("is-visible");
        container.classList.add("has-floor-reticle");
      };

      const onPointerDown = () => {
        pointerIsDown = true;
        hideFloorReticle();
      };
      const onPointerUp = () => {
        pointerIsDown = false;
      };

      container.addEventListener("pointermove", updateFloorReticle);
      container.addEventListener("pointerleave", hideFloorReticle);
      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);

      const markViewerReady = () => {
        viewerIsReady = true;
        setIsReady(true);
      };

      viewer.addEventListener("ready", markViewerReady, { once: true });
      viewer.addEventListener("panorama-loaded", () => {
        markViewerReady();
        if (entrancePending) {
          entrancePending = false;
          // Let PSV create its native fade first, then run our animation after
          // its frame so the zoom/fisheye values are the final camera values.
          entranceFrame = window.requestAnimationFrame(playEntranceAnimation);
        }
      });
      if (viewer.state.ready) markViewerReady();
      tourPlugin.addEventListener("node-changed", ({ node }) => {
        setCurrentSceneId(node.id);
        window.history.replaceState(null, "", `#${node.id}`);
      });

      container.dataset.tourReady = "true";

      // Store DOM cleanup with the container because initialization is deferred.
      container.addEventListener("tour-cleanup", () => {
        window.cancelAnimationFrame(entranceFrame);
        entranceAnimation?.cancel();
        container.classList.remove("is-entering");
        hideFloorReticle();
        container.removeEventListener("pointermove", updateFloorReticle);
        container.removeEventListener("pointerleave", hideFloorReticle);
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
      }, { once: true });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(entranceFrame);
      entranceAnimation?.cancel();
      if (container.dataset.tourReady) {
        container.dispatchEvent(new Event("tour-cleanup"));
        delete container.dataset.tourReady;
      }
      tourPluginRef.current = null;
      viewerRef.current = null;
      viewer?.destroy();
    };
  }, [initialScenes]);

  const navigateTo = useCallback((sceneId: string) => {
    setIsMenuOpen(false);
    void tourPluginRef.current?.setCurrentNode(sceneId);
  }, []);

  const changeZoom = (amount: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoom(Math.max(0, Math.min(100, viewer.getZoomLevel() + amount)));
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  };

  return (
    <main className="tour-shell" dir="ltr">
      <div ref={viewerElementRef} className="viewer" aria-label="360 degree villa panorama" />
      <div ref={floorReticleRef} className="floor-reticle" aria-hidden="true"><span /></div>

      <div className="viewer-vignette" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigateTo(scenes[0]?.id ?? "scene-1")} aria-label="Return to the first scene">
          <span className="brand-mark">H</span>
          <span className="brand-copy">
            <strong>{projectName}</strong>
            <small>Private villa · 360° tour</small>
          </span>
        </button>

        <div className="topbar-actions">
          <span className="scene-counter"><b>{String(currentScene.index).padStart(2, "0")}</b> / {scenes.length}</span>
          <button className="round-button menu-button" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Open scene menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      <aside className="viewer-controls" aria-label="Tour controls">
        <button type="button" onClick={() => changeZoom(12)} aria-label="Zoom in"><PlusIcon /></button>
        <button type="button" onClick={() => changeZoom(-12)} aria-label="Zoom out"><MinusIcon /></button>
        <span className="control-rule" />
        <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen"><FullscreenIcon /></button>
        <button type="button" onClick={() => setIsInfoOpen(true)} aria-label="Tour help"><InfoIcon /></button>
      </aside>

      <section className="scene-card" aria-live="polite">
        <span className="scene-zone">{currentScene.zone}</span>
        <h1>{currentScene.name}</h1>
        <div className="scene-card-footer">
          <span><CompassIcon /> 360° view</span>
          <span className="swipe-hint">Drag to explore</span>
        </div>
      </section>

      <div className="interaction-hint" aria-hidden="true">
        <span className="mouse-symbol" />
        <span>Drag to look around</span>
      </div>

      <div className={`loading-screen ${isReady ? "is-hidden" : ""}`} aria-hidden={isReady}>
        <div className="loader-brand">
          <span className="loader-mark">H</span>
          <p>Haste Eco</p>
          <small>Preparing your private tour</small>
        </div>
        <div className="loader-track"><span /></div>
        <span className="loader-caption">Loading 360° experience</span>
      </div>

      <div className={`drawer-backdrop ${isMenuOpen ? "is-open" : ""}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`scene-drawer ${isMenuOpen ? "is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Explore the villa</span>
            <h2>Choose a space</h2>
          </div>
          <button className="round-button" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close scene menu"><CloseIcon /></button>
        </div>

        <div className="scene-list">
          {sceneZones.map((zone) => (
            <section className="scene-group" key={zone}>
              <div className="group-heading"><h3>{zone}</h3><span>{scenes.filter((item) => item.zone === zone).length} spaces</span></div>
              <div className="scene-grid">
                {scenes.filter((item) => item.zone === zone).map((item) => (
                  <button
                    className={`scene-tile ${item.id === currentSceneId ? "is-active" : ""}`}
                    type="button"
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                  >
                    <span className="tile-image">
                      <Image src={item.thumbnail} alt="" fill sizes="(max-width: 640px) 44vw, 180px" />
                      <span className="tile-index">{String(item.index).padStart(2, "0")}</span>
                    </span>
                    <span className="tile-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <div className={`info-modal-wrap ${isInfoOpen ? "is-open" : ""}`} onClick={() => setIsInfoOpen(false)}>
        <section className="info-modal" role="dialog" aria-modal="true" aria-label="How to use this tour" onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setIsInfoOpen(false)} aria-label="Close help"><CloseIcon /></button>
          <span className="eyebrow">A quick guide</span>
          <h2>Move through the villa</h2>
          <p>Drag anywhere to look around. Select the glowing circles placed on doors and pathways to walk into the next space.</p>
          <div className="guide-link-demo"><span><ArrowIcon /></span><small>Select to move</small></div>
          <button className="primary-button" type="button" onClick={() => setIsInfoOpen(false)}>Continue exploring</button>
        </section>
      </div>
    </main>
  );
}
