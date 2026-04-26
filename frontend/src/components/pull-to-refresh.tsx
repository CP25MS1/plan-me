"use client";

import { useEffect, useRef } from "react";

const PullToRefresh = () => {
    const startY = useRef<number | null>(null);

    useEffect(() => {
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (!isIOS) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                startY.current = e.touches[0].clientY;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (startY.current === null) return;

            const diff = e.changedTouches[0].clientY - startY.current;

            if (diff > 120 && window.scrollY === 0) {
                window.location.reload();
            }

            startY.current = null;
        };

        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return null;
}

export default PullToRefresh;
