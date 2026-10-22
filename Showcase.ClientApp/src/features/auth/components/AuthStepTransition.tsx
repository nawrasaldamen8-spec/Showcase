import React, { useEffect, useRef, useState } from "react";

export interface AuthStepTransitionProps {
  stepKey: string | number;
  direction: "forward" | "backward";
  children: React.ReactNode;
  className?: string;
}

export const AuthStepTransition: React.FC<AuthStepTransitionProps> = ({
  stepKey,
  direction,
  children,
  className = "",
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!contentRef.current) return;

    const measuredHeight = contentRef.current.offsetHeight;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setHeight(measuredHeight);
    } else {
      setHeight(measuredHeight);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (nextHeight > 0) {
          setHeight(Math.ceil(nextHeight));
        }
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [stepKey]);

  return (
    <div
      className={`relative -m-1.5 p-1.5 overflow-hidden transition-[height] duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{ height: height !== undefined ? `${height + 12}px` : "auto" }}
    >
      <div
        key={stepKey}
        ref={contentRef}
        className={`${
          direction === "forward" ? "kinetic-push-forward" : "kinetic-push-backward"
        } kinetic-stagger w-full`}
      >
        {children}
      </div>
    </div>
  );
};
