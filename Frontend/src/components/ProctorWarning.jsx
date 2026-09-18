function ProctorWarning({ warning, onDismiss }) {
  if (!warning) return null;

  const messages = {
    TAB_SWITCH: "You switched away from the test window.",
    FULLSCREEN_EXIT: "You exited fullscreen mode.",
    NO_FACE: "We couldn't detect your face.",
    MULTIPLE_FACES: "More than one person was detected.",
    DEVICE_DETECTED: "An electronic device was detected on camera.",
    FACE_MISMATCH: "The person in frame doesn't match your verification photo.",
  };
const handleAcknowledge = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    onDismiss();
  };

  return (
    <div className="proctor-warning-overlay">
      <div className="proctor-warning-box">
        <h3>⚠ Warning</h3>
        <p>{messages[warning.eventType] || "A test policy violation was detected."}</p>
        <p className="proctor-warning-count">Violation {warning.count} — the test will end automatically if this continues.</p>
        <button onClick={handleAcknowledge}>I understand</button>
      </div>
    </div>
  );
}

export default ProctorWarning;