import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipWrapperProps {
    children: React.ReactNode;
    message?: string;
    fullWidth?: boolean;
    show: boolean;
    side?: "top" | "bottom";
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
    children,
    message,
    show,
    fullWidth,
    side = "top",
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const offset = 8;
            const top = side === "bottom" ? rect.bottom + offset : rect.top - offset;
            const left = rect.left + rect.width / 2;
            setPosition({ top, left });
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        updatePosition();
    };

    useEffect(() => {
        if (!isHovered) return;

        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isHovered, side]);

    const tooltipElement =
        show &&
        isHovered &&
        message &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
            <div
                className="fixed z-[9999] pointer-events-none whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md"
                style={{
                    top: position.top,
                    left: position.left,
                    transform:
                        side === "bottom"
                            ? "translate(-50%, 0)"
                            : "translate(-50%, -100%)",
                }}
            >
                {message}
            </div>,
            document.body
        );

    return (
        <div
            ref={triggerRef}
            className={`inline-block ${fullWidth ? "w-full" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {tooltipElement}
        </div>
    );
};

export default TooltipWrapper;
