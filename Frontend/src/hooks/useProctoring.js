// useProctoring.js
import { useEffect, useRef, useState, useCallback } from "react";
import { reportViolation } from "../api/interviews";

// active: only wire up listeners once the test has actually started
// (i.e. after ProctorSetup finishes) — no point flagging tab switches
// while someone's still on the camera-permission screen
export function useProctoring(interviewId, active) {
  const [warning, setWarning] = useState(null); // { eventType, count } | null
  const [terminated, setTerminated] = useState(false);
  const terminatedRef = useRef(false); // avoid duplicate reports after termination

  const report = useCallback(
    async (eventType, meta = {}) => {
      if (!active || terminatedRef.current) return;
      try {
        const res = await reportViolation(interviewId, eventType, meta);
        const { status: violationStatus, count } = res.data;

        if (violationStatus === "terminated") {
          terminatedRef.current = true;
          setTerminated(true);
        } else if (violationStatus === "warn") {
          setWarning({ eventType, count });
        }
      } catch (err) {
        // interview was already terminated in a previous session — stop polling
        if (err.response?.status === 403) {
          terminatedRef.current = true;
          setTerminated(true);
        }
      }
    },
    [interviewId, active]
  );

  useEffect(() => {
    if (!active) return;

    const handleVisibility = () => {
      if (document.hidden) report("TAB_SWITCH");
    };
    const handleBlur = () => report("TAB_SWITCH", { source: "window_blur" });
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) report("FULLSCREEN_EXIT");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [active, report]);

  const dismissWarning = () => setWarning(null);

  return { warning, terminated, dismissWarning, report};
}