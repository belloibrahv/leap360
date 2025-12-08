import { RefObject, useEffect } from "react";

export default function useClickAway(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Check if click is outside all refs
      const isOutside = refs.every((ref) => {
        return !ref.current?.contains(event.target as Node);
      });
      if (isOutside) {
        handler();
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [refs, handler]);
}
