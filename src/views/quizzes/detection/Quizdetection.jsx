import React, { useEffect, useRef, useState } from "react";

function Quizdetection({ userID, mcqID }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isInitialDetectionDone, setIsInitialDetectionDone] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true); // Track tab visibility

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

  const logToServer = async (url, body, logType) => {
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

  const logFaceMovement = () => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingfacemovement`,
      { userID, mcqID },
      "faceMovement"
    );
  };

  const logNoPersonDetected = () => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingnoperson`,
      { userID, mcqID },
      "noPersonDetected"
    );
  };

  const logSmartphoneDetection = () => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingsmartphone`,
      { userID, mcqID },
      "smartphoneDetection"
    );
  };

  const logMultiplePeopleDetected = () => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingmultiplepeople`,
      { userID, mcqID },
      "multiplePeopleDetected"
    );
  };

  const logTabSwitch = () => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingswitchtabs`,
      { userID, mcqID },
      "tabSwitch"
    );
  };

  const logShortcutKey = (shortcutKey) => {
    logToServer(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/MCQ_usercheatingshortcutkeys`,
      { userID, mcqID, shortcutKey },
      "shortcutKey"
    );
  };

  const showAlert = (message) => {
    if (isTabActive) {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
      alert(message);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      streamRef.current = stream; // Save stream reference
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    }

    function drawFaces(faces, ctx) {
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
            showAlert("Person not looking at the front detected");
            logFaceMovement();
          }
        }
      });
    }

    function drawObjects(predictions, ctx) {
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
        }
      });
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

        if (faces.length > 0 || objects.length > 0) {
          setIsInitialDetectionDone(true);
        }

        // Check for no person detected
        if (faces.length === 0) {
          showAlert("No person detected");
          logNoPersonDetected();
        }

        // Check for multiple people detected
        if (faces.length > 1) {
          showAlert("More than one person detected");
          logMultiplePeopleDetected();
        }

        // Request the next animation frame
        animationFrameRef.current = requestAnimationFrame(detect);
      }

      detect();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      stopCamera(); // Stop the camera on component unmount
      cancelAnimationFrame(animationFrameRef.current); // Cancel the animation frame
    };
  }, [isTabActive]); // Add isTabActive to dependency array

  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        height: "240px",
        margin: "0 auto",
      }}
    >
      <video
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
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "5px",
          borderRadius: "5px",
          zIndex: 4,
        }}
      >
        <p>User ID: {userID}</p>
        <p>MCQ ID: {mcqID}</p>
      </div>
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
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Quizdetection;
