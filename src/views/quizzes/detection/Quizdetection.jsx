import React, { useEffect, useRef, useState } from "react";
import LoadingResource from "../../../components/LoadingResource/LoadingResource";
import html2canvas from "html2canvas";
import imageCompression from "browser-image-compression";

function Quizdetection({ userID, mcqID }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isInitialDetectionDone, setIsInitialDetectionDone] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true); // Track tab visibility
  const [capturedImage, setCapturedImage] = useState(null); // State to store captured image
  const [isAlertActive, setIsAlertActive] = useState(false); // Track if an alert is active
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  let lastLogTime = {
    noPersonDetected: 0,
    multiplePeopleDetected: 0,
  };

  const logToServerWithThrottle = async (url, body, logType) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`${logType} logged successfully`);
      } else {
        console.error(`Failed to log ${logType}`);
      }
    } catch (error) {
      console.error(`Error logging ${logType}:`, error);
    }
  };
  const logFaceMovement = async () => {
    await captureImage(); // Wait for the image capture to finish

    if (capturedImageRef.current) {
      const base64Image = capturedImageRef.current.split(",")[1]; // Extract base64 part of the image
      logToServerWithThrottle(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingfacemovement`,
        { userID, mcqID, proof: base64Image },
        "faceMovement"
      );
    } else {
      console.log("Captured image is empty.");
    }
  };

  const logNoPersonDetected = async () => {
    await captureImage(); // Wait for the image capture to finish

    if (capturedImageRef.current) {
      const base64Image = capturedImageRef.current.split(",")[1]; // Extract base64 part of the image
      logToServerWithThrottle(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingnoperson`,
        { userID, mcqID, proof: base64Image },
        "noPersonDetected"
      );
    } else {
      console.log("Captured image is empty.");
    }
  };

  const logSmartphoneDetection = async () => {
    await captureImage(); // Wait for the image capture to finish

    if (capturedImageRef.current) {
      const base64Image = capturedImageRef.current.split(",")[1]; // Extract base64 part of the image
      logToServerWithThrottle(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingsmartphone`,
        { userID, mcqID, proof: base64Image },
        "smartphoneDetection"
      );
    } else {
      console.log("Captured image is empty.");
    }
  };

  const logMultiplePeopleDetected = async () => {
    await captureImage(); // Wait for the image capture to finish

    if (capturedImageRef.current) {
      const base64Image = capturedImageRef.current.split(",")[1]; // Extract base64 part of the image
      logToServerWithThrottle(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingmultiplepeople`,
        { userID, mcqID, proof: base64Image },
        "multiplePeopleDetected"
      );
    } else {
      console.log("Captured image is empty.");
    }
  };

  const logTabSwitch = () => {
    // Remove dependency on captureImage since no proof is needed
    logToServerWithThrottle(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingswitchtabs`,
      { userID, mcqID },
      "tabSwitch"
    );
  };

  const logShortcutKey = (shortcutKey) => {
    // Remove dependency on captureImage since no proof is needed
    logToServerWithThrottle(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingshortcutkeys`,
      { userID, mcqID, shortcutKey },
      "shortcutKey"
    );
  };

  const capturedImageRef = useRef(""); // Using a ref to store the captured image

  const captureImage = async () => {
    const video = videoRef.current;

    if (video) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set the canvas size to match the video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame from the video onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the captured image as base64 PNG
      const imageData = canvas.toDataURL("image/png");
      capturedImageRef.current = imageData; // Store the image in the ref
    }
  };

  const [lastAlertTime, setLastAlertTime] = useState(0); // Track the last alert time
  const ALERT_COOLDOWN = 1000; // 1 second cooldown to prevent spam alerts

  const showAlert = async (message) => {
    const currentTime = Date.now();

    // Check if the time difference is less than the cooldown period
    if (currentTime - lastAlertTime < ALERT_COOLDOWN) {
      return; // Skip if the alert is triggered too soon
    }
    if (isTabActive) {
      setLastAlertTime(currentTime); // Update the last alert time
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setIsTabActive(false);
      showAlert("Switch tab!");
      logTabSwitch(); // Log tab switch when the tab is inactive
    } else {
      setIsTabActive(true);
    }
  };

  const handleCopy = () => {
    showAlert("Copy detected!");
    logShortcutKey("Ctrl+C");
  };

  const handlePaste = () => {
    showAlert("Paste detected!");
    logShortcutKey("Ctrl+V");
  };

  const stopCamera = () => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop(); // Stop each track
      });

      if (video) {
        video.srcObject = null; // Clear video src
      }
      streamRef.current = null; // Clear the stream reference
    }
  };

  useEffect(() => {
    const loadExternalScripts = async () => {
      try {
        await loadScript(`/libs/tfjs.min.js`);
        await loadScript(`/libs/coco-ssd.min.js`);
        await loadScript(`/libs/tfjs-core.min.js`);
        await loadScript(`/libs/tfjs-converter.min.js`);
        await loadScript(`/libs/tfjs-backend-webgl.min.js`);
        await loadScript(`/libs/face-detection.min.js`);
        main();
      } catch (error) {
        console.error("Failed to load scripts", error);
      }
    };

    loadExternalScripts();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    async function setupCamera() {
      const video = videoRef.current;

      while (true) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          video.srcObject = stream;
          streamRef.current = stream;

          return new Promise((resolve) => {
            video.onloadedmetadata = () => {
              resolve(video);
            };
          });
        } catch (error) {
          if (
            error.name === "NotAllowedError" ||
            error.name === "SecurityError"
          ) {
            alert("Camera access is required. Please allow camera access.");
          } else {
            console.error(
              "An error occurred while accessing the camera:",
              error
            );
            alert("An unexpected error occurred. Please try again.");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    let lastDetectionTime = 0; // Timestamp of the last detection
    function drawFaces(faces, ctx) {
      const currentTime = Date.now();
      if (currentTime - lastDetectionTime < 1000) {
        // If less than 1 second has passed since the last detection, ignore it
        return;
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      faces.forEach((face) => {
        const { xMin, yMin, width, height } = face.box;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(xMin, yMin, width, height);

        face.keypoints.forEach((keypoint) => {
          ctx.fillStyle = "blue";
          ctx.fillRect(keypoint.x - 2, keypoint.y - 2, 4, 4);
        });

        const leftEye = face.keypoints.find(
          (point) => point.name === "leftEye"
        );
        const rightEye = face.keypoints.find(
          (point) => point.name === "rightEye"
        );
        const noseTip = face.keypoints.find(
          (point) => point.name === "noseTip"
        );

        if (leftEye && rightEye && noseTip) {
          const faceCenterX = (leftEye.x + rightEye.x) / 2;
          const noseOffset = Math.abs(noseTip.x - faceCenterX);

          if (noseOffset > width * 0.1) {
            // Pause the video when the condition is met
            const video = videoRef.current;
            if (video) {
              video.pause(); // Pause the video
            }

            // Capture the image and log the movement
            captureImage().then(() => {
              logFaceMovement(); // Log the face movement
              showAlert("Person not looking at the front detected");

              // Resume the video after processing
              if (video) {
                video.play(); // Resume the video
              }
            });
          }
        }
      });

      lastDetectionTime = currentTime; // Update last detection time
    }

    let lastObjectDetectionTime = 0; // Timestamp for object detections

    function drawObjects(predictions, ctx) {
      const currentTime = Date.now();
      if (currentTime - lastObjectDetectionTime < 1000) {
        // If less than 1 second has passed since the last object detection, ignore it
        return;
      }

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "green";
        ctx.font = "18px Arial";
        ctx.fillText(
          `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
          x,
          y > 10 ? y - 5 : 10
        );

        if (prediction.class === "cell phone") {
          showAlert("Smartphone Detected");
          logSmartphoneDetection();
          captureImage(); // Capture the image after the event
        }
      });

      lastObjectDetectionTime = currentTime; // Update last object detection time
    }

    async function main() {
      await setupCamera();
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const model = window.faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: "tfjs",
        maxFaces: 10,
        modelType: "short",
      };
      const faceDetector = await window.faceDetection.createDetector(
        model,
        detectorConfig
      );
      const objectDetector = await window.cocoSsd.load();

      setIsModelsLoaded(true);

      async function detect() {
        if (!isTabActive) {
          return; // Stop execution if the tab is inactive
        }

        const faces = await faceDetector.estimateFaces(video, {
          flipHorizontal: false,
        });
        const objects = await objectDetector.detect(video);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFaces(faces, ctx);
        drawObjects(objects, ctx);

        const currentTime = Date.now();

        if (faces.length > 0 || objects.length > 0) {
          setIsInitialDetectionDone(true);
        }

        // Check for no person detected
        if (
          faces.length === 0 &&
          currentTime - lastLogTime.noPersonDetected > 3000
        ) {
          showAlert("No person detected");
          logNoPersonDetected();
          lastLogTime.noPersonDetected = currentTime; // Update time
        }

        // Check for multiple people detected
        if (
          faces.length > 1 &&
          currentTime - lastLogTime.multiplePeopleDetected > 3000
        ) {
          showAlert("More than one person detected");
          logMultiplePeopleDetected();
          lastLogTime.multiplePeopleDetected = currentTime; // Update time
        }

        animationFrameRef.current = requestAnimationFrame(detect);
      }

      detect();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      stopCamera();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isTabActive]);

  return (
    <>
      {!isModelsLoaded && <LoadingResource />}
      <div
        className="imagecapture"
        style={{ position: "relative", width: "320px", height: "240px" }}
      >
        <video
          className="yawa"
          ref={videoRef}
          width="320px"
          height="240px"
          autoPlay
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        />
        <canvas
          ref={canvasRef}
          width="320px"
          height="240px"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
        />
        {!isInitialDetectionDone && isModelsLoaded && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "320px",
              height: "240px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3,
            }}
          >
            <div
              style={{
                border: "8px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                borderTop: "8px solid #fff",
                width: "60px",
                height: "60px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}
        {!isInitialDetectionDone && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "320px",
              height: "240px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3,
            }}
          >
            <div
              style={{
                border: "8px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                borderTop: "8px solid #fff",
                width: "60px",
                height: "60px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}
      </div>
    </>
  );
}

export default Quizdetection;
