import { useRef, type TouchEventHandler } from "react";

export function useHorizontalSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 45) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart: TouchEventHandler<HTMLElement> = (event) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd: TouchEventHandler<HTMLElement> = (event) => {
    if (!start.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.current.x;
    const deltaY = touch.clientY - start.current.y;
    start.current = null;
    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX < 0) onSwipeLeft();
    else onSwipeRight();
  };
  const onTouchCancel: TouchEventHandler<HTMLElement> = () => { start.current = null; };
  return { onTouchStart, onTouchEnd, onTouchCancel };
}
