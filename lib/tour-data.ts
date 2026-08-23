export type TourLink = {
  nodeId: string;
  yaw: number;
  pitch?: number;
  placement?: "ground" | "wall" | "air";
};

export type TourScene = {
  id: string;
  index: number;
  name: string;
  sourceLabel: string;
  zone: "Exterior" | "Ground floor" | "Upper floor";
  panorama: string;
  thumbnail: string;
  initialYaw: number;
  initialPitch: number;
  links: TourLink[];
};

const scene = (
  index: number,
  name: string,
  sourceLabel: string,
  zone: TourScene["zone"],
  initialYaw: number,
  initialPitch: number,
  links: Array<[number, number, number?]>,
): TourScene => ({
  id: `scene-${index}`,
  index,
  name,
  sourceLabel,
  zone,
  panorama: `/panos/p${index}.webp`,
  thumbnail: `/panos/p${index}-thumb.webp`,
  initialYaw,
  initialPitch,
  links: links.map(([target, yaw, pitch = -12]) => ({
    nodeId: `scene-${target}`,
    yaw,
    pitch,
    placement: "ground",
  })),
});

// Scene order, camera headings, and connections are extracted from the original tour export.
export const tourScenes: TourScene[] = [
  scene(1, "Courtyard · Arrival", "Courtyard 01", "Exterior", 2.68, -5.37, [[4, -176.41], [5, 5.9]]),
  scene(2, "Villa Entrance", "Exterior Entrance", "Exterior", -53.03, -0.52, [[3, -42.76]]),
  scene(3, "Courtyard · Garden", "Courtyard 03", "Exterior", -54.21, -5.05, [[4, -62.84], [2, -154.69]]),
  scene(4, "Courtyard · Terrace", "Courtyard 02", "Exterior", -42.49, -0.09, [[1, -42.02], [3, 68.91]]),
  scene(5, "Ground Floor · Foyer", "Ground Floor Entrance 01", "Ground floor", 43.15, -3.47, [[6, 46.52], [1, -95.63]]),
  scene(6, "Ground Floor · Hall", "Ground Floor Entrance 02", "Ground floor", 117.96, -8, [[5, -52.81], [9, 118.56], [7, -151.1], [8, 118.56]]),
  scene(7, "Ground Floor · Landing", "Ground Floor Entrance 03", "Ground floor", 44.16, -11.27, [[6, 159.04]]),
  scene(8, "Kitchen · Island", "Kitchen 03", "Ground floor", 86.83, -6.1, [[6, -63.06], [9, -32.02], [10, 43.95], [11, -132.19]]),
  scene(9, "Kitchen · Dining", "Kitchen 02", "Ground floor", 87.35, -3.15, [[6, -63.06], [11, -132.19], [10, 43.95], [8, -32.02]]),
  scene(10, "Kitchen · Worktop", "Kitchen 01", "Ground floor", -178.85, -6.42, [[9, -100.8], [8, -100.8]]),
  scene(11, "Living Room", "Small Living Area", "Ground floor", -30.93, -21.81, [[8, -132.28], [9, -132.28], [12, 17.15]]),
  scene(12, "Ground Bedroom · Entry", "Bedroom – Ground Floor p4", "Ground floor", 45.93, -3.68, [[13, 50.44], [16, 149.78], [11, 121.21], [14, 50.44]]),
  scene(13, "Ground Bedroom · Window", "Bedroom – Ground Floor p1", "Ground floor", 147.65, -9.87, [[15, 0.65], [14, 28.59], [12, -128.35]]),
  scene(14, "Ground Bedroom · Lounge", "Bedroom – Ground Floor p2", "Ground floor", 147.8, -10.31, [[15, 0.65], [13, 27.42], [12, -128.35]]),
  scene(15, "Ground Bedroom · Ensuite", "Bedroom – Ground Floor p3", "Ground floor", 13.22, -5.89, [[14, -152.66], [13, -152.66]]),
  scene(16, "Upper Bedroom 01 · Entry", "Upstairs Bedroom 01 p3", "Upper floor", -78.06, -2.84, [[17, -72.32], [12, -169.15]]),
  scene(17, "Upper Bedroom 01 · Suite", "Upstairs Bedroom 01 p2", "Upper floor", 84.25, -2.94, [[19, 6.58], [20, -105.77], [18, 84.42], [16, -164.35]]),
  scene(18, "Upper Bedroom 01 · Bath", "Upstairs Bedroom 01 p1", "Upper floor", 1.67, -2.41, [[17, -43.26]]),
  scene(19, "Upper Floor · Balcony", "Upper Floor Balcony", "Upper floor", -17.39, 1.05, [[17, -171.75]]),
  scene(20, "Upper Bedroom 02 · Suite", "Upstairs Bedroom 02 p2", "Upper floor", 18.46, -3.89, [[17, 119.15], [21, 12.27], [22, -55.89]]),
  scene(21, "Upper Bedroom 02 · Bath", "Upstairs Bedroom 02 p1", "Upper floor", -72.61, -14.85, [[20, -141.27]]),
  scene(22, "Upper Bedroom 03 · Suite", "Upstairs Bedroom 03 p2", "Upper floor", -39.81, -4.73, [[23, -55.91], [20, 120.46]]),
  scene(23, "Upper Bedroom 03 · Bath", "Upstairs Bedroom 03 p1", "Upper floor", 0.92, -14.11, [[22, -146.44]]),
];

export const tourScenesById = new Map(tourScenes.map((item) => [item.id, item]));

export const sceneZones = ["Exterior", "Ground floor", "Upper floor"] as const;
