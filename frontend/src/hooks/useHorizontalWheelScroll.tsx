import { useEffect, useRef } from "react";

export default function useHorizontalWheelScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
 
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
 
    function handleWheel(e: WheelEvent) {
      // Only hijack the scroll when the user is actually scrolling
      // vertically more than horizontally (keeps trackpad horizontal
      // swipes working normally instead of double-applying).
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
 
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);
 
  return ref;
}