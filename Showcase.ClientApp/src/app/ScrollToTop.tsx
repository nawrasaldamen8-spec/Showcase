import React, { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // If navigating to a specific hash element, scroll it into view smoothly
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // When pushing or replacing a new route (not browser back/forward POP), reset scroll to top
    if (navigationType !== "POP") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [pathname, hash, navigationType]);

  return null;
};
