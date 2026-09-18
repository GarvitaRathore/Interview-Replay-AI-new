// ProctorSetup.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import { uploadReferencePhoto } from "../api/interviews";
import "./ProctorSetup.css";

// Shown once, right before the interview questions load.
// onVerified() is called after the reference photo is successfully uploaded —
// the parent (Interview.jsx) should only render the actual test after that.
function ProctorSetup({ interviewId, onVerified }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("requesting"); // requesting | ready | captured | uploading | error
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 480, height: 360 }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("ready");
      })
      .catch(() => {
        setErrorMsg("Camera access is required to start this test. Please allow camera permission and reload.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
      setStatus("captured");
    }, "image/jpeg", 0.9);
  }, []);
   // the <video> element unmounts while showing the captured photo, so when
  // we go back to "ready" (Retake) it's a fresh DOM node with no stream
  // attached yet — reattach it here
  useEffect(() => {
    if (status === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);
  const handleRetake = () => {
    setCapturedBlob(null);
    setStatus("ready");
  };
  const handleConfirm = async () => {
    if (!capturedBlob) return;
    setStatus("uploading");
    // fire this FIRST, synchronously within the click, before any await —
    // otherwise the browser may reject it as no longer "user-initiated"
    document.documentElement.requestFullscreen?.().catch(() => {});
    try {
      const res = await uploadReferencePhoto(interviewId, capturedBlob);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      await document.documentElement.requestFullscreen?.().catch(() => {});
      onVerified(res.data.photo_url); // pass the URL up
    } catch {
      setErrorMsg("Couldn't save your photo. Please try again.");
      setStatus("captured");
    }
  };

  return (
    <div className="proctor-setup card">
      <h2>Identity Verification</h2>
      <p className="proctor-sub">
        We need a quick photo before you start. This confirms it's you taking the test —
        keep your face centered and well-lit.
      </p>

      {status === "error" && <p className="proctor-error">{errorMsg}</p>}

      <div className="proctor-video-wrap">
        {status !== "captured" && status !== "uploading" && (
          <video ref={videoRef} autoPlay playsInline muted className="proctor-video" />
        )}
        {(status === "captured" || status === "uploading") && capturedBlob && (
          <img
            src={URL.createObjectURL(capturedBlob)}
            alt="Captured reference"
            className="proctor-video"
          />
        )}
      </div>

      {errorMsg && status !== "error" && <p className="proctor-error">{errorMsg}</p>}

      <div className="proctor-actions">
        {status === "ready" && (
          <button onClick={handleCapture}>Capture Photo</button>
        )}
        {status === "captured" && (
          <>
            <button onClick={handleRetake} className="proctor-secondary">Retake</button>
            <button onClick={handleConfirm}>Confirm & Continue</button>
          </>
        )}
        {status === "uploading" && <button disabled>Saving...</button>}
        {status === "requesting" && <p>Requesting camera access...</p>}
      </div>
    </div>
  );
}

export default ProctorSetup;