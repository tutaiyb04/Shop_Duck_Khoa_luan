import { useState, useEffect, useRef } from "react";

export default function useCountdown(initialSec, isActive) {
  const [countdown, setCountdown] = useState(0);
  const countIntervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
      return;
    }

    setCountdown(initialSec);

    countIntervalRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);

    return () => {
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
    };
  }, [isActive, initialSec]);

  return countdown;
}
