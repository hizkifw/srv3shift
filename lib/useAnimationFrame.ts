import { useRef, useEffect, useCallback } from "react";

const useAnimationFrame = (callback: (dT: number) => any) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const animate = useCallback(
    (time) => {
      if (typeof previousTimeRef.current !== "undefined") {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [previousTimeRef, requestRef, callback]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (typeof requestRef.current !== "undefined")
        cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);
};

export default useAnimationFrame;
