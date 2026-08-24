"use client";

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "./villa-tour.css";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { sceneZones, tourScenes, type TourScene } from "@/lib/tour-data";
import {
  ArrowIcon,
  BackIcon,
  CloseIcon,
  CompassIcon,
  FullscreenIcon,
  InfoIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
} from "./icons";

const degreesToRadians = (degrees: number) => degrees * Math.PI / 180;
const TOUR_TRANSITION_DURATION = 760;
const LIGHT_TRANSITION_DURATION = 720;
const DEFAULT_TOUR_ZOOM = 10;

const zoneLabels: Record<TourScene["zone"], string> = {
  Exterior: "محوطه بیرونی",
  "Ground floor": "طبقه همکف",
  "Upper floor": "طبقه بالا",
};

const formatSceneNumber = (value: number, minimumIntegerDigits = 1) => new Intl.NumberFormat("fa-IR", {
  minimumIntegerDigits,
  useGrouping: false,
}).format(value);

function createFloorArrow(action: "move" | "light" = "move") {
  const arrow = document.createElement("button");
  arrow.type = "button";
  arrow.className = `floor-target floor-target--${action}`;
  arrow.setAttribute("aria-label", action === "light" ? "روشن یا خاموش کردن چراغ" : "حرکت به فضای بعدی");

  for (const className of ["floor-target__pulse", "floor-target__ring", "floor-target__dot"]) {
    const layer = document.createElement("span");
    layer.className = className;
    arrow.appendChild(layer);
  }

  if (action === "light") {
    const light = document.createElement("span");
    light.className = "floor-target__light";
    light.setAttribute("aria-hidden", "true");
    arrow.appendChild(light);
  }

  return arrow;
}

type VillaTourProps = {
  initialScenes?: TourScene[];
  projectName?: string;
};

export function VillaTour({ initialScenes = tourScenes, projectName = "Haste Eco" }: VillaTourProps) {
  const viewerElementRef = useRef<HTMLDivElement>(null);
  const transitionSnapshotRef = useRef<HTMLCanvasElement>(null);
  const floorReticleRef = useRef<HTMLDivElement>(null);
  const lightOverlayRef = useRef<HTMLDivElement>(null);
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
    let snapshotAnimation: Animation | null = null;
    let lightAnimation: Animation | null = null;
    let lightFrame = 0;
    let lightTransitionPending = false;
    let movementFadePending = false;
    let viewerIsReady = false;
    let pointerIsDown = false;

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
          const action = link.action ?? "move";
          return {
            nodeId: link.nodeId,
            position: {
              yaw: `${link.yaw}deg`,
              pitch: `${link.pitch ?? -18}deg`,
            },
            arrowStyle: {
              className: `villa-link villa-link--${placement} villa-link--${action}`,
              size: placement === "ground" ? { width: 72, height: 38 } : { width: 64, height: 64 },
            },
            data: {
              action,
              direction: link.direction,
            },
          };
        }),
      }));

      viewer = new Viewer({
        container,
        defaultYaw: `${startScene.initialYaw}deg`,
        defaultPitch: `${startScene.initialPitch}deg`,
        defaultZoomLvl: DEFAULT_TOUR_ZOOM,
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
            // Manual 2D projection preserves each admin-defined yaw and pitch.
            // The 3D link renderer places arrows relative to the camera/floor.
            renderMode: "2d",
            nodes,
            startNodeId: startScene.id,
            // Start loading every adjacent panorama as soon as a scene opens.
            // This keeps 8K files off the critical path after the source zoom.
            preload: true,
            showLinkTooltip: true,
            transitionOptions: (node, fromNode, fromLink) => {
              if (!fromNode) {
                return {
                  showLoader: false,
                  speed: 50,
                  effect: "fade" as const,
                  rotation: false,
                  zoomTo: DEFAULT_TOUR_ZOOM,
                };
              }

              const currentZoom = viewer?.getZoomLevel() ?? DEFAULT_TOUR_ZOOM;
              const currentPosition = viewer?.getPosition();
              const sourceScene = configuredScenesById.get(fromNode.id);
              const destinationScene = configuredScenesById.get(node.id);
              const action = fromLink?.data?.action === "light" ? "light" : "move";

              if (action === "light") {
                movementFadePending = false;
                lightTransitionPending = !reducedMotion;
                return {
                  showLoader: false,
                  speed: reducedMotion ? 1 : LIGHT_TRANSITION_DURATION,
                  effect: reducedMotion ? "none" : "fade",
                  rotation: false,
                  rotateTo: currentPosition,
                  zoomTo: currentZoom,
                };
              }

              lightTransitionPending = false;
              movementFadePending = !reducedMotion;
              const automaticDirection = sourceScene && destinationScene && destinationScene.index < sourceScene.index
                ? "backward"
                : "forward";
              const direction: "forward" | "backward" = fromLink?.data?.direction === "forward" || fromLink?.data?.direction === "backward"
                ? fromLink.data.direction
                : automaticDirection;
              const oppositeDirection = direction === "forward" ? "backward" : "forward";
              const declaredView = destinationScene?.arrivalViews?.[direction]
                ?? destinationScene?.arrivalViews?.[oppositeDirection];
              const entrancePosition = destinationScene
                ? {
                    yaw: degreesToRadians(declaredView?.yaw ?? destinationScene.initialYaw),
                    pitch: degreesToRadians(declaredView?.pitch ?? destinationScene.initialPitch),
                  }
                : currentPosition;
              return {
                showLoader: false,
                speed: reducedMotion ? 1 : TOUR_TRANSITION_DURATION,
                effect: reducedMotion ? "none" : "fade",
                rotation: false,
                rotateTo: entrancePosition,
                // Preserve the camera zoom. The source-only overlay below
                // supplies the forward movement without changing destination.
                zoomTo: currentZoom,
              };
            },
            arrowStyle: {
              element: (link) => createFloorArrow(link.data?.action === "light" ? "light" : "move"),
              size: { width: 72, height: 38 },
              className: "villa-link",
            },
          }),
        ],
      });

      const tourPlugin = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;
      viewerRef.current = viewer;
      tourPluginRef.current = tourPlugin;

      const hideTransitionSnapshot = () => {
        const snapshot = transitionSnapshotRef.current;
        snapshotAnimation?.cancel();
        snapshotAnimation = null;
        if (snapshot) {
          snapshot.style.opacity = "0";
          snapshot.style.visibility = "hidden";
        }
      };

      const captureTransitionSnapshot = () => {
        const source = container.querySelector<HTMLCanvasElement>(".psv-canvas-container canvas");
        const snapshot = transitionSnapshotRef.current;
        if (!source || !snapshot || !source.width || !source.height) return false;

        const context = snapshot.getContext("2d");
        if (!context) return false;
        try {
          snapshot.width = source.width;
          snapshot.height = source.height;
          context.drawImage(source, 0, 0, snapshot.width, snapshot.height);
          snapshot.style.visibility = "visible";
          snapshot.style.opacity = "1";
          return true;
        } catch {
          hideTransitionSnapshot();
          return false;
        }
      };

      const fadeTransitionSnapshot = () => {
        const snapshot = transitionSnapshotRef.current;
        if (!snapshot || snapshot.style.visibility !== "visible") return;
        snapshotAnimation?.cancel();
        snapshotAnimation = snapshot.animate([
          { opacity: 1, transform: "scale(1)", filter: "blur(0) saturate(1) contrast(1)", offset: 0 },
          { opacity: 0.94, transform: "scale(1.075)", filter: "blur(0.15px) saturate(1.04) contrast(1.015)", offset: 0.46 },
          { opacity: 0, transform: "scale(1.19)", filter: "blur(0.7px) saturate(1.1) contrast(1.035)", offset: 1 },
        ], {
          duration: TOUR_TRANSITION_DURATION,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          fill: "forwards",
        });
        snapshotAnimation.addEventListener("finish", hideTransitionSnapshot, { once: true });
      };

      const playLightTransition = () => {
        const overlay = lightOverlayRef.current;
        if (!overlay || reducedMotion) return;
        lightAnimation?.cancel();
        lightAnimation = overlay.animate([
          { opacity: 0, offset: 0 },
          { opacity: 0.18, offset: 0.2 },
          { opacity: 0.88, offset: 0.48 },
          { opacity: 0.24, offset: 0.72 },
          { opacity: 0, offset: 1 },
        ], {
          duration: LIGHT_TRANSITION_DURATION,
          easing: "ease-in-out",
          fill: "none",
        });
        lightAnimation.addEventListener("finish", () => {
          lightAnimation = null;
        }, { once: true });
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
        if (movementFadePending) {
          movementFadePending = false;
          // panorama-loaded fires before PSV starts its destination fade, so
          // this captures only the current panorama at its exact camera view.
          if (captureTransitionSnapshot()) fadeTransitionSnapshot();
        } else if (lightTransitionPending) {
          lightTransitionPending = false;
          lightFrame = window.requestAnimationFrame(playLightTransition);
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
        window.cancelAnimationFrame(lightFrame);
        hideTransitionSnapshot();
        lightAnimation?.cancel();
        hideFloorReticle();
        container.removeEventListener("pointermove", updateFloorReticle);
        container.removeEventListener("pointerleave", hideFloorReticle);
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
      }, { once: true });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(lightFrame);
      snapshotAnimation?.cancel();
      lightAnimation?.cancel();
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
    <main className="tour-shell" dir="rtl">
      {/* PSV's projected hotspot layer must remain LTR. Inheriting the Persian
          RTL direction mirrors its screen-coordinate calculations and makes
          links appear to slide away from their saved panorama positions. */}
      <div ref={viewerElementRef} className="viewer" dir="ltr" aria-label="نمای ۳۶۰ درجه ویلا" />
      <canvas ref={transitionSnapshotRef} className="tour-transition-snapshot" aria-hidden="true" />
      <div ref={floorReticleRef} className="floor-reticle" aria-hidden="true"><span /></div>

      <div className="viewer-vignette" aria-hidden="true" />
      <div ref={lightOverlayRef} className="light-transition-overlay" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigateTo(scenes[0]?.id ?? "scene-1")} aria-label="بازگشت به فضای نخست">
          <span className="brand-mark">H</span>
          <span className="brand-copy">
            <strong>{projectName}</strong>
            <small>ویلای اختصاصی · تور ۳۶۰ درجه</small>
          </span>
        </button>

        <div className="topbar-actions">
          <span className="scene-counter"><b>{formatSceneNumber(currentScene.index, 2)}</b> / {formatSceneNumber(scenes.length)}</span>
          <Link className="round-button home-back-button" href="/" aria-label="بازگشت به صفحه اصلی">
            <BackIcon />
          </Link>
          <button className="round-button menu-button" type="button" onClick={() => setIsMenuOpen(true)} aria-label="باز کردن فهرست فضاها">
            <MenuIcon />
          </button>
        </div>
      </header>

      <aside className="viewer-controls" aria-label="کنترل‌های تور مجازی">
        <button type="button" onClick={() => changeZoom(12)} aria-label="بزرگ‌نمایی"><PlusIcon /></button>
        <button type="button" onClick={() => changeZoom(-12)} aria-label="کوچک‌نمایی"><MinusIcon /></button>
        <span className="control-rule" />
        <button type="button" onClick={toggleFullscreen} aria-label="نمایش تمام‌صفحه"><FullscreenIcon /></button>
        <button type="button" onClick={() => setIsInfoOpen(true)} aria-label="راهنمای تور"><InfoIcon /></button>
      </aside>

      <section className="scene-card" aria-live="polite">
        <span className="scene-zone">{zoneLabels[currentScene.zone]}</span>
        <h1>{currentScene.name}</h1>
        <div className="scene-card-footer">
          <span><CompassIcon /> نمای ۳۶۰ درجه</span>
          <span className="swipe-hint">برای مشاهده بکشید</span>
        </div>
      </section>

      <div className="interaction-hint" aria-hidden="true">
        <span className="mouse-symbol" />
        <span>برای نگاه کردن به اطراف بکشید</span>
      </div>

      <div className={`loading-screen ${isReady ? "is-hidden" : ""}`} aria-hidden={isReady}>
        <div className="loader-brand">
          <span className="loader-mark">H</span>
          <p>Haste Eco</p>
          <small>در حال آماده‌سازی تور اختصاصی شما</small>
        </div>
        <div className="loader-track"><span /></div>
        <span className="loader-caption">در حال بارگذاری نمای ۳۶۰ درجه</span>
      </div>

      <div className={`drawer-backdrop ${isMenuOpen ? "is-open" : ""}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`scene-drawer ${isMenuOpen ? "is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">گشت‌وگذار در ویلا</span>
            <h2>یک فضا را انتخاب کنید</h2>
          </div>
          <button className="round-button" type="button" onClick={() => setIsMenuOpen(false)} aria-label="بستن فهرست فضاها"><CloseIcon /></button>
        </div>

        <div className="scene-list">
          {sceneZones.map((zone) => (
            <section className="scene-group" key={zone}>
              <div className="group-heading"><h3>{zoneLabels[zone]}</h3><span>{formatSceneNumber(scenes.filter((item) => item.zone === zone).length)} فضا</span></div>
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
                      <span className="tile-index">{formatSceneNumber(item.index, 2)}</span>
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
        <section className="info-modal" role="dialog" aria-modal="true" aria-label="راهنمای استفاده از تور" onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setIsInfoOpen(false)} aria-label="بستن راهنما"><CloseIcon /></button>
          <span className="eyebrow">راهنمای سریع</span>
          <h2>در ویلا حرکت کنید</h2>
          <p>برای نگاه کردن به اطراف، تصویر را بکشید. برای رفتن به فضای بعدی، دایره‌های درخشان روی درها و مسیرها را انتخاب کنید.</p>
          <div className="guide-link-demo"><span><ArrowIcon /></span><small>برای حرکت انتخاب کنید</small></div>
          <button className="primary-button" type="button" onClick={() => setIsInfoOpen(false)}>ادامه گشت‌وگذار</button>
        </section>
      </div>
    </main>
  );
}
