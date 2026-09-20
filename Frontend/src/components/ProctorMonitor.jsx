// ProctorMonitor.jsx
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as faceapi from "@vladmandic/face-api";

const CHECK_INTERVAL_MS = 2500;
const SUSPICIOUS_OBJECTS = ["cell phone", "laptop", "book", "remote", "tablet"];
const MATCH_DISTANCE_THRESHOLD = 0.5; // lower = stricter match

// backend serves media on a different origin than the Vite dev server
const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";

function ProctorMonitor({ interviewId, active, report, referencePhotoUrl, showPreview = false }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const mismatchStreakRef = useRef(0);
  const noFaceStreakRef = useRef(0);
  const [modelsReady, setModelsReady] = useState(false);
  const cocoModelRef = useRef(null);
  const referenceDescriptorRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        cocoModelRef.current = await cocoSsd.load();
        if (cancelled) return;

        // compute the reference descriptor once, from the photo captured
        // during ProctorSetup, so we can compare live frames against it
        if (referencePhotoUrl) {
          try {
            const fullUrl = referencePhotoUrl.startsWith("http")
              ? referencePhotoUrl
              : `${BACKEND_ORIGIN}${referencePhotoUrl}`;

            const img = await faceapi.fetchImage(fullUrl);
            const refResult = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks(true)
              .withFaceDescriptor();

            if (refResult) {
              referenceDescriptorRef.current = refResult.descriptor;
            } else {
              console.warn("No face found in reference photo — identity check disabled.");
            }
          } catch (err) {
            console.error("Failed to process reference photo:", err);
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setModelsReady(true);
      } catch (err) {
        console.error("ProctorMonitor failed to initialize:", err);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [active, referencePhotoUrl]);

  useEffect(() => {
    if (!active || !modelsReady) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      // TEMP — check raw detection first, before landmarks/descriptors
      const rawFaces = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
      );
    //  console.log("raw faces (no landmarks):", rawFaces.length);

      let results = [];
      try {
        results = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 }))
          .withFaceLandmarks(true)
          .withFaceDescriptors();
        // console.log("full chain results:", results.length);
      } catch (err) {
        console.error("FULL CHAIN ERROR:", err);
        return; // skip this tick, don't report anything based on a failed read
      }

      if (results.length === 0) {
        noFaceStreakRef.current += 1;
        if (noFaceStreakRef.current >= 2) {
          report("NO_FACE");
        }
      } else {
        noFaceStreakRef.current = 0;

        if (results.length > 1) {
          report("MULTIPLE_FACES", { count: results.length });
        } else if (referenceDescriptorRef.current) {
          const distance = faceapi.euclideanDistance(
            referenceDescriptorRef.current,
            results[0].descriptor
          );
          // console.log("face match distance:", distance);

          if (distance > MATCH_DISTANCE_THRESHOLD) {
            mismatchStreakRef.current += 1;
            if (mismatchStreakRef.current >= 2) {
              report("FACE_MISMATCH", { distance: Number(distance.toFixed(3)) });
            }
          } else {
            mismatchStreakRef.current = 0;
          }
        }
      }

      const predictions = await cocoModelRef.current.detect(video);
      // console.log("predictions:", predictions.map(p => `${p.class} (${p.score.toFixed(2)})`));
      const suspicious = predictions.find(
        (p) => SUSPICIOUS_OBJECTS.includes(p.class) && p.score > 0.6
      );
      if (suspicious) {
        report("DEVICE_DETECTED", { object: suspicious.class, confidence: suspicious.score });
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [active, modelsReady, report]);

 return (
    <>
      {!modelsReady && showPreview && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 999,
            background: "white",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          Loading proctoring...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={
          showPreview
            ? { width: 160, borderRadius: 8, position: "fixed", bottom: 16, right: 16, zIndex: 999 }
            : { display: "none" }
        }
      />
    </>
  );
}

export default ProctorMonitor;