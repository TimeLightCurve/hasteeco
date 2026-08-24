import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function FullscreenIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 5v14M5 12h14" /></svg>;
}

export function MinusIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14" /></svg>;
}

export function InfoIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
}

export function CompassIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" /></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 7-7 7 7M12 5v14" /></svg>;
}

export function BackIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m15 18-6-6 6-6M9 12h11" /></svg>;
}
