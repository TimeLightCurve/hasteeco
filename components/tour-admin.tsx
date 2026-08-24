"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { PanoramaLinkEditor } from "@/components/panorama-link-editor";
import { sanitizeTourScenes } from "@/lib/tour-config";
import { sceneZones, tourScenes, type TourLink, type TourScene, type TourView } from "@/lib/tour-data";
import {
  DEFAULT_VIRTUAL_TOUR_IFRAME_URL,
  type VirtualTourDisplayMode,
  type VirtualTourProject,
} from "@/lib/virtual-tour-schema";
import styles from "./tour-admin.module.css";

type PropertyOption = {
  listingId: number;
  slug: string;
  title: string;
  titleFa: string;
};

type EditableProject = VirtualTourProject & { isNew?: boolean };

type TourAdminProps = {
  initialProjects: VirtualTourProject[];
  properties: PropertyOption[];
};

const panoramaOptions = tourScenes.map((scene) => ({
  panorama: scene.panorama,
  thumbnail: scene.thumbnail,
  label: `${String(scene.index).padStart(2, "0")} · ${scene.sourceLabel}`,
}));

const isManagedTourImage = (path: string) => /^\/api\/uploads\/[a-f\d]{24}$/i.test(path);

const getManagedImagePaths = (scenes: TourScene[]) => scenes
  .flatMap((scene) => [scene.panorama, scene.thumbnail])
  .filter(isManagedTourImage);

async function deleteManagedImages(paths: string[]) {
  const managedPaths = [...new Set(paths.filter(isManagedTourImage))];
  if (!managedPaths.length) return;
  await fetch("/api/admin/virtual-tours/images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: managedPaths }),
  }).catch(() => undefined);
}

function createDraftProject(slug = "new-virtual-tour"): EditableProject {
  const firstRoom = structuredClone(tourScenes[0]);
  firstRoom.links = [];
  return {
    slug,
    name: "New virtual tour",
    propertySlug: null,
    displayMode: "native",
    iframeUrl: DEFAULT_VIRTUAL_TOUR_IFRAME_URL,
    scenes: [firstRoom],
    isNew: true,
  };
}

export function TourAdmin({ initialProjects, properties }: TourAdminProps) {
  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);
  const panoramaUploadRef = useRef<HTMLInputElement>(null);
  const startingProjects = useMemo(
    () => initialProjects.length ? initialProjects : [createDraftProject()],
    [initialProjects],
  );
  const [projects, setProjects] = useState<EditableProject[]>(startingProjects);
  const [selectedProjectKey, setSelectedProjectKey] = useState(startingProjects[0].slug);
  const [projectName, setProjectName] = useState(startingProjects[0].name);
  const [projectSlug, setProjectSlug] = useState(startingProjects[0].slug);
  const [propertySlug, setPropertySlug] = useState(startingProjects[0].propertySlug ?? "");
  const [displayMode, setDisplayMode] = useState<VirtualTourDisplayMode>(startingProjects[0].displayMode ?? "native");
  const [iframeUrl, setIframeUrl] = useState(startingProjects[0].iframeUrl ?? DEFAULT_VIRTUAL_TOUR_IFRAME_URL);
  const [rooms, setRooms] = useState<TourScene[]>(startingProjects[0].scenes);
  const [selectedRoomId, setSelectedRoomId] = useState(startingProjects[0].scenes[0].id);
  const [selectedLink, setSelectedLink] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [imageState, setImageState] = useState<"idle" | "uploading">("idle");
  const [pendingImageDeletes, setPendingImageDeletes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedProject = projects.find((project) => project.slug === selectedProjectKey) ?? projects[0];
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId],
  );

  const markDirty = useCallback(() => {
    setSaveState("dirty");
    setErrorMessage("");
  }, []);

  const loadProjectIntoEditor = (project: EditableProject) => {
    void deleteManagedImages([...getManagedImagePaths(rooms), ...pendingImageDeletes]);
    const nextRooms = structuredClone(project.scenes);
    setSelectedProjectKey(project.slug);
    setProjectName(project.name);
    setProjectSlug(project.slug);
    setPropertySlug(project.propertySlug ?? "");
    setDisplayMode(project.displayMode ?? "native");
    setIframeUrl(project.iframeUrl ?? DEFAULT_VIRTUAL_TOUR_IFRAME_URL);
    setRooms(nextRooms);
    setSelectedRoomId(nextRooms[0].id);
    setSelectedLink(null);
    setSaveState(project.isNew ? "dirty" : "saved");
    setPendingImageDeletes([]);
    setErrorMessage("");
  };

  const selectProject = (slug: string) => {
    const project = projects.find((candidate) => candidate.slug === slug);
    if (!project) return;
    if (saveState === "dirty" && !window.confirm("Discard unsaved changes and open another project?")) return;
    loadProjectIntoEditor(project);
  };

  const addProject = () => {
    if (saveState === "dirty" && !window.confirm("Discard unsaved changes and create a new project?")) return;
    const draft = createDraftProject(`virtual-tour-${Date.now().toString(36)}`);
    setProjects((current) => [...current, draft]);
    loadProjectIntoEditor(draft);
  };

  const deleteProject = async () => {
    if (!selectedProject || !window.confirm(`Delete “${selectedProject.name}” and all of its rooms?`)) return;
    setErrorMessage("");

    if (!selectedProject.isNew) {
      const response = await fetch(`/api/admin/virtual-tours/${encodeURIComponent(selectedProject.slug)}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        router.push("/login?callbackUrl=/admin/virtual-tour");
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        setErrorMessage(body?.error ?? "Could not delete the project.");
        setSaveState("error");
        return;
      }
    }

    void deleteManagedImages([...getManagedImagePaths(rooms), ...pendingImageDeletes]);
    setPendingImageDeletes([]);

    const remaining = projects.filter((project) => project.slug !== selectedProject.slug);
    if (remaining.length) {
      setProjects(remaining);
      loadProjectIntoEditor(remaining[0]);
    } else {
      const draft = createDraftProject();
      setProjects([draft]);
      loadProjectIntoEditor(draft);
    }
  };

  const updateRoom = useCallback((roomId: string, update: (room: TourScene) => TourScene) => {
    markDirty();
    setRooms((current) => current.map((room) => room.id === roomId ? update(room) : room));
  }, [markDirty]);

  const updateSelectedRoom = useCallback((update: (room: TourScene) => TourScene) => {
    if (selectedRoom) updateRoom(selectedRoom.id, update);
  }, [selectedRoom, updateRoom]);

  const replaceSelectedRoomImage = (panorama: string, thumbnail: string) => {
    const removed = [selectedRoom.panorama, selectedRoom.thumbnail]
      .filter((path) => path !== panorama && path !== thumbnail && isManagedTourImage(path));
    if (removed.length) setPendingImageDeletes((current) => [...new Set([...current, ...removed])]);
    updateSelectedRoom((room) => ({ ...room, panorama, thumbnail }));
  };

  const addRoom = () => {
    const suffix = Date.now().toString(36);
    const next: TourScene = {
      id: `room-${suffix}`,
      index: rooms.length + 1,
      name: "New room",
      sourceLabel: "New room",
      zone: "Ground floor",
      panorama: "/panos/p1.webp",
      thumbnail: "/panos/p1-thumb.webp",
      initialYaw: 0,
      initialPitch: 0,
      links: [],
    };
    setRooms((current) => [...current, next]);
    setSelectedRoomId(next.id);
    setSelectedLink(null);
    markDirty();
  };

  const removeRoom = () => {
    if (!selectedRoom || rooms.length === 1) return;
    if (!window.confirm(`Remove “${selectedRoom.name}” and every link pointing to it?`)) return;
    const removedImages = getManagedImagePaths([selectedRoom]);
    if (removedImages.length) setPendingImageDeletes((current) => [...new Set([...current, ...removedImages])]);
    const remaining = rooms
      .filter((room) => room.id !== selectedRoom.id)
      .map((room, index) => ({
        ...room,
        index: index + 1,
        links: room.links.filter((link) => link.nodeId !== selectedRoom.id),
      }));
    setRooms(remaining);
    setSelectedRoomId(remaining[0].id);
    setSelectedLink(null);
    markDirty();
  };

  const save = async () => {
    if (!selectedProject) return;
    setSaveState("saving");
    setErrorMessage("");

    let cleanRooms: TourScene[];
    try {
      cleanRooms = sanitizeTourScenes(rooms);
    } catch (error) {
      setSaveState("error");
      setErrorMessage(error instanceof Error ? error.message : "The room configuration is invalid.");
      return;
    }

    const payload = {
      slug: projectSlug.trim(),
      name: projectName.trim(),
      propertySlug: propertySlug || null,
      displayMode,
      iframeUrl: iframeUrl.trim(),
      scenes: cleanRooms,
    };
    const response = await fetch(
      selectedProject.isNew
        ? "/api/admin/virtual-tours"
        : `/api/admin/virtual-tours/${encodeURIComponent(selectedProject.slug)}`,
      {
        method: selectedProject.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (response.status === 401) {
      router.push("/login?callbackUrl=/admin/virtual-tour");
      return;
    }

    const body = await response.json().catch(() => null) as { data?: VirtualTourProject; error?: string } | null;
    if (!response.ok || !body?.data) {
      setSaveState("error");
      setErrorMessage(body?.error ?? "Could not save the virtual tour project.");
      return;
    }

    const saved = body.data;
    setProjects((current) => current.map((project) => project.slug === selectedProject.slug ? saved : project));
    setSelectedProjectKey(saved.slug);
    setProjectName(saved.name);
    setProjectSlug(saved.slug);
    setPropertySlug(saved.propertySlug ?? "");
    setDisplayMode(saved.displayMode ?? "native");
    setIframeUrl(saved.iframeUrl ?? DEFAULT_VIRTUAL_TOUR_IFRAME_URL);
    setRooms(saved.scenes);
    setSelectedRoomId((current) => saved.scenes.some((room) => room.id === current) ? current : saved.scenes[0].id);
    setSaveState("saved");
    if (pendingImageDeletes.length) {
      const pathsToDelete = pendingImageDeletes;
      setPendingImageDeletes([]);
      void deleteManagedImages(pathsToDelete);
    }
  };

  const resetRooms = () => {
    if (!window.confirm("Replace this project’s rooms and hotspots with the original villa tour?")) return;
    const removedImages = getManagedImagePaths(rooms);
    if (removedImages.length) setPendingImageDeletes((current) => [...new Set([...current, ...removedImages])]);
    const defaults = structuredClone(tourScenes);
    setRooms(defaults);
    setSelectedRoomId(defaults[0].id);
    setSelectedLink(null);
    markDirty();
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(rooms, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${projectSlug || "virtual-tour"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imported = sanitizeTourScenes(JSON.parse(await file.text()));
      setRooms(imported);
      setSelectedRoomId(imported[0].id);
      setSelectedLink(null);
      markDirty();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "This configuration file is invalid.");
    }
  };

  const uploadPanorama = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || imageState === "uploading") return;

    const targetRoom = selectedRoom;
    setImageState("uploading");
    setErrorMessage("");

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/virtual-tours/images", { method: "POST", body: form });
      if (response.status === 401) {
        router.push("/login?callbackUrl=/admin/virtual-tour");
        return;
      }

      const body = await response.json().catch(() => null) as {
        data?: { panorama: string; thumbnail: string };
        error?: string;
      } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error ?? "The panorama could not be uploaded.");

      const removed = [targetRoom.panorama, targetRoom.thumbnail]
        .filter((path) => path !== body.data?.panorama && path !== body.data?.thumbnail && isManagedTourImage(path));
      if (removed.length) setPendingImageDeletes((current) => [...new Set([...current, ...removed])]);
      updateRoom(targetRoom.id, (room) => ({
        ...room,
        panorama: body.data!.panorama,
        thumbnail: body.data!.thumbnail,
        sourceLabel: file.name,
      }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The panorama could not be uploaded.");
    } finally {
      setImageState("idle");
    }
  };

  const removeUploadedPanorama = () => {
    if (!isManagedTourImage(selectedRoom.panorama)) return;
    if (!window.confirm("Remove this uploaded panorama from the room? The bundled default will be restored.")) return;
    const fallback = panoramaOptions[0];
    replaceSelectedRoomImage(fallback.panorama, fallback.thumbnail);
  };

  const addLink = () => {
    if (!selectedRoom) return;
    const target = rooms.find((room) => room.id !== selectedRoom.id);
    if (!target) return;
    const link: TourLink = {
      nodeId: target.id,
      yaw: selectedRoom.initialYaw,
      pitch: -18,
      placement: "ground",
      action: "move",
    };
    updateSelectedRoom((room) => ({ ...room, links: [...room.links, link] }));
    setSelectedLink(selectedRoom.links.length);
  };

  const updateLink = (index: number, update: Partial<TourLink>) => {
    updateSelectedRoom((room) => ({
      ...room,
      links: room.links.map((link, linkIndex) => linkIndex === index ? { ...link, ...update } : link),
    }));
  };

  const updateArrivalView = (direction: "forward" | "backward", view: TourView | undefined) => {
    updateSelectedRoom((room) => {
      const arrivalViews = { ...room.arrivalViews };
      if (view) arrivalViews[direction] = view;
      else delete arrivalViews[direction];
      return {
        ...room,
        arrivalViews: arrivalViews.forward || arrivalViews.backward ? arrivalViews : undefined,
      };
    });
  };

  const removeLink = (index: number) => {
    updateSelectedRoom((room) => ({ ...room, links: room.links.filter((_, linkIndex) => linkIndex !== index) }));
    setSelectedLink(null);
  };

  if (!selectedProject || !selectedRoom) {
    return <main className={styles.adminLoading}>Preparing tour studio…</main>;
  }

  const saveLabel = saveState === "saved"
    ? "Saved to database"
    : saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed"
        : "Unsaved changes";

  return (
    <main className={styles.adminShell} dir="ltr">
      <header className={styles.adminHeader}>
        <div>
          <span>Haste Eco</span>
          <h1>Virtual tour studio</h1>
          <div className={styles.projectSwitcher}>
            <select value={selectedProjectKey} onChange={(event) => selectProject(event.target.value)} aria-label="Virtual tour project">
              {projects.map((project) => <option key={project.slug} value={project.slug}>{project.name}</option>)}
            </select>
            <button type="button" className={styles.secondaryButton} onClick={addProject}>+ New project</button>
            <button type="button" className={styles.projectDeleteButton} onClick={deleteProject}>Delete project</button>
          </div>
        </div>
        <div className={styles.headerActions}>
          <span className={`${styles.saveStatus} ${saveState === "saved" ? styles.saved : ""}`}>{saveLabel}</span>
          <button type="button" className={styles.secondaryButton} onClick={exportConfig}>Export rooms</button>
          <button type="button" className={styles.secondaryButton} onClick={() => importRef.current?.click()}>Import rooms</button>
          <input ref={importRef} className={styles.hiddenInput} type="file" accept="application/json" onChange={importConfig} />
          {!selectedProject.isNew && (
            <Link className={styles.secondaryButton} href={`/virtual-tour/${selectedProject.slug}`} target="_blank">View tour</Link>
          )}
          <button type="button" className={styles.saveButton} onClick={save} disabled={saveState === "saving"}>Save project</button>
        </div>
      </header>

      {errorMessage && <div className={styles.projectError} role="alert">{errorMessage}</div>}

      <div className={styles.adminBody}>
        <aside className={styles.roomSidebar}>
          <div className={styles.sidebarHeading}>
            <div><span>Structure</span><h2>Rooms</h2></div>
            <button type="button" onClick={addRoom} aria-label="Add room">+</button>
          </div>
          <div className={styles.roomList}>
            {rooms.map((room) => (
              <button
                type="button"
                key={room.id}
                className={`${styles.roomItem} ${room.id === selectedRoom.id ? styles.roomItemActive : ""}`}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setSelectedLink(null);
                }}
              >
                <span>{String(room.index).padStart(2, "0")}</span>
                <div><b dir="auto">{room.name}</b><small>{room.zone} · {room.links.length} pins</small></div>
              </button>
            ))}
          </div>
          <button type="button" className={styles.resetButton} onClick={resetRooms}>Load original villa rooms</button>
        </aside>

        <section className={styles.workspace}>
          <div className={styles.workspaceHeading}>
            <div><span>Visual editor</span><h2 dir="auto">{selectedRoom.name}</h2></div>
            <p>Look around normally, then drag a numbered pin to its exact door or entrance.</p>
          </div>
          <PanoramaLinkEditor
            scene={selectedRoom}
            rooms={rooms}
            selectedLink={selectedLink}
            onSelectLink={setSelectedLink}
            onLinksChange={(links) => updateSelectedRoom((room) => ({ ...room, links }))}
            onArrivalViewChange={updateArrivalView}
          />

          <div className={styles.linkSection}>
            <div className={styles.sectionHeading}>
              <div><span>Navigation</span><h3>Pinned buttons</h3></div>
              <button type="button" className={styles.secondaryButton} onClick={addLink} disabled={rooms.length < 2}>+ Add button</button>
            </div>
            {selectedRoom.links.length === 0 ? (
              <div className={styles.emptyState}>This room has no navigation buttons yet.</div>
            ) : (
              <div className={styles.linkGrid}>
                {selectedRoom.links.map((link, index) => (
                  <article
                    key={`${link.nodeId}-${index}`}
                    className={`${styles.linkCard} ${selectedLink === index ? styles.linkCardActive : ""}`}
                    onClick={() => setSelectedLink(index)}
                  >
                    <span className={styles.linkNumber}>{index + 1}</span>
                    <label>
                      Destination
                      <select dir="auto" value={link.nodeId} onChange={(event) => updateLink(index, { nodeId: event.target.value })}>
                        {rooms.filter((room) => room.id !== selectedRoom.id).map((room) => (
                          <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                      </select>
                    </label>
                    <div className={styles.coordinateFields}>
                      <label>
                        Button action
                        <select
                          value={link.action ?? "move"}
                          onChange={(event) => updateLink(index, { action: event.target.value as NonNullable<TourLink["action"]> })}
                        >
                          <option value="move">Move to location</option>
                          <option value="light">Turn lights on / off</option>
                        </select>
                      </label>
                      <label>
                        Target view
                        <select
                          value={link.direction ?? "auto"}
                          disabled={(link.action ?? "move") === "light"}
                          onChange={(event) => updateLink(index, {
                            direction: event.target.value === "auto"
                              ? undefined
                              : event.target.value as NonNullable<TourLink["direction"]>,
                          })}
                        >
                          <option value="auto">Auto by room order</option>
                          <option value="forward">Forward view</option>
                          <option value="backward">Backward view</option>
                        </select>
                      </label>
                    </div>
                    <small className={styles.linkActionHint}>
                      {(link.action ?? "move") === "light"
                        ? "Light buttons crossfade with a soft flash and keep the current camera angle."
                        : "Auto uses the forward view for a higher room number and backward for a lower one."}
                    </small>
                    <div className={styles.placementPicker}>
                      <span>Button surface</span>
                      <div role="group" aria-label="Button surface">
                        {(["ground", "wall", "air"] as const).map((value) => (
                          <button
                            type="button"
                            key={value}
                            className={(link.placement ?? "ground") === value ? styles.placementActive : ""}
                            onClick={() => updateLink(index, { placement: value })}
                          >
                            {value[0].toUpperCase() + value.slice(1)}
                          </button>
                        ))}
                      </div>
                      <small>
                        {(link.placement ?? "ground") === "ground"
                          ? "Flattened toward the floor with a contact shadow."
                          : link.placement === "wall"
                            ? "Front-facing marker with a soft wall shadow."
                            : "Floating marker with no shadow."}
                      </small>
                    </div>
                    <div className={styles.coordinateFields}>
                      <label>Yaw<input type="number" step="0.1" value={link.yaw} onChange={(event) => updateLink(index, { yaw: Number(event.target.value) })} /></label>
                      <label>Pitch<input type="number" step="0.1" value={link.pitch ?? -18} onChange={(event) => updateLink(index, { pitch: Number(event.target.value) })} /></label>
                    </div>
                    <button type="button" className={styles.removeLink} onClick={(event) => { event.stopPropagation(); removeLink(index); }}>Remove</button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className={styles.propertiesPanel}>
          <div className={styles.propertiesHeading}><span>Selected project</span><h2>Project</h2></div>
          <label>
            Project name
            <input value={projectName} onChange={(event) => { setProjectName(event.target.value); markDirty(); }} />
          </label>
          <label>
            Project slug
            <input dir="ltr" value={projectSlug} onChange={(event) => { setProjectSlug(event.target.value.toLowerCase()); markDirty(); }} />
            <small>Lowercase letters, numbers, and hyphens only.</small>
          </label>
          <label>
            Related property
            <select value={propertySlug} onChange={(event) => { setPropertySlug(event.target.value); markDirty(); }}>
              <option value="">No property</option>
              {properties.map((property) => (
                <option key={property.slug} value={property.slug}>{property.titleFa} · {property.slug}</option>
              ))}
            </select>
            <small>The tour section appears automatically on the assigned property page.</small>
          </label>
          <div className={styles.displayModePicker}>
            <span className={styles.fieldLabel}>Published tour type</span>
            <div role="group" aria-label="Published virtual tour type">
              <button
                type="button"
                className={displayMode === "native" ? styles.displayModeActive : ""}
                aria-pressed={displayMode === "native"}
                onClick={() => { setDisplayMode("native"); markDirty(); }}
              >
                Haste Eco tour
              </button>
              <button
                type="button"
                className={displayMode === "iframe" ? styles.displayModeActive : ""}
                aria-pressed={displayMode === "iframe"}
                onClick={() => { setDisplayMode("iframe"); markDirty(); }}
              >
                External iframe
              </button>
            </div>
            <small>
              {displayMode === "native"
                ? "Visitors see the Photo Sphere Viewer tour configured below."
                : "Visitors see the external tour URL instead of the Haste Eco viewer."}
            </small>
          </div>
          {displayMode === "iframe" && (
            <label>
              External iframe URL
              <input
                dir="ltr"
                type="url"
                inputMode="url"
                value={iframeUrl}
                onChange={(event) => { setIframeUrl(event.target.value); markDirty(); }}
                placeholder={DEFAULT_VIRTUAL_TOUR_IFRAME_URL}
              />
              <small>Only secure HTTPS URLs are accepted. This setting is saved through the virtual-tour API.</small>
            </label>
          )}

          <div className={styles.panelDivider} />
          <div className={styles.propertiesHeading}><span>Selected room</span><h2>Room</h2></div>
          <label>
            Room display name
            <input dir="auto" value={selectedRoom.name} onChange={(event) => updateSelectedRoom((room) => ({ ...room, name: event.target.value }))} />
            <small>This exact editable name is shown in the tour title, menu, and button tooltips.</small>
          </label>
          <label>
            Zone
            <select value={selectedRoom.zone} onChange={(event) => updateSelectedRoom((room) => ({ ...room, zone: event.target.value as TourScene["zone"] }))}>
              {sceneZones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </label>
          <div className={styles.imageManager}>
            <span className={styles.fieldLabel}>Panorama image</span>
            <div className={styles.imagePreview}>
              <Image src={selectedRoom.thumbnail} alt={`Preview of ${selectedRoom.name}`} fill sizes="280px" unoptimized />
            </div>
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.uploadButton}
                disabled={imageState === "uploading"}
                onClick={() => panoramaUploadRef.current?.click()}
              >
                {imageState === "uploading" ? <LoaderCircle className={styles.spinningIcon} aria-hidden /> : <ImagePlus aria-hidden />}
                {imageState === "uploading" ? "Processing image…" : "Upload panorama"}
              </button>
              <button
                type="button"
                className={styles.imageDeleteButton}
                disabled={!isManagedTourImage(selectedRoom.panorama) || imageState === "uploading"}
                onClick={removeUploadedPanorama}
              >
                <Trash2 aria-hidden /> Delete
              </button>
            </div>
            <input
              ref={panoramaUploadRef}
              className={styles.hiddenInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={uploadPanorama}
            />
            <small>Uploads are converted to 4096×2048 WebP. A 512×256 thumbnail is generated automatically.</small>
          </div>
          <label>
            Bundled panorama library
            <select
              value={panoramaOptions.some((option) => option.panorama === selectedRoom.panorama) ? selectedRoom.panorama : ""}
              onChange={(event) => {
                const image = panoramaOptions.find((option) => option.panorama === event.target.value);
                if (image) replaceSelectedRoomImage(image.panorama, image.thumbnail);
              }}
            >
              {!panoramaOptions.some((option) => option.panorama === selectedRoom.panorama) && <option value="">Uploaded panorama</option>}
              {panoramaOptions.map((option) => <option key={option.panorama} value={option.panorama}>{option.label}</option>)}
            </select>
          </label>
          <div className={styles.coordinateFields}>
            <label>Initial yaw<input type="number" step="0.1" value={selectedRoom.initialYaw} onChange={(event) => updateSelectedRoom((room) => ({ ...room, initialYaw: Number(event.target.value) }))} /></label>
            <label>Initial pitch<input type="number" step="0.1" value={selectedRoom.initialPitch} onChange={(event) => updateSelectedRoom((room) => ({ ...room, initialPitch: Number(event.target.value) }))} /></label>
          </div>
          <div className={styles.arrivalViewFields}>
            <span className={styles.fieldLabel}>Directional target views</span>
            <small>Set these visually above. If only one is set, it is used as the fallback for both directions.</small>
            {(["forward", "backward"] as const).map((direction) => {
              const view = selectedRoom.arrivalViews?.[direction];
              return (
                <div key={direction} className={styles.arrivalViewRow}>
                  <b>{direction === "forward" ? "Forward arrival" : "Backward arrival"}</b>
                  {view ? (
                    <div className={styles.coordinateFields}>
                      <label>Yaw<input type="number" step="0.1" value={view.yaw} onChange={(event) => updateArrivalView(direction, { ...view, yaw: Number(event.target.value) })} /></label>
                      <label>Pitch<input type="number" step="0.1" value={view.pitch} onChange={(event) => updateArrivalView(direction, { ...view, pitch: Number(event.target.value) })} /></label>
                    </div>
                  ) : <em>Not set — initial room view is used.</em>}
                </div>
              );
            })}
          </div>
          <div className={styles.persistenceNote}>
            <b>Database-backed project</b>
            <p>Saving publishes this project and its property assignment for every visitor.</p>
          </div>
          <button type="button" className={styles.dangerButton} disabled={rooms.length === 1} onClick={removeRoom}>Delete room</button>
        </aside>
      </div>
    </main>
  );
}
