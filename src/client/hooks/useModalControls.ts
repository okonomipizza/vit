import { useEffect, useState, useRef } from "react";
import { CONTROL_HIDE_DELAY } from "../constants/layout";

export function useModalControls(isSlideshow: boolean) {
  const [showControls, setShowControls] = useState(!isSlideshow);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSlideshow) {
      setShowControls(true);
      return;
    }

    setShowControls(false);

    const handleMouseMove = () => {
      setShowControls(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROL_HIDE_DELAY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSlideshow]);

  return showControls;
}
