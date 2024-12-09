import { useState, useEffect, useRef } from "react";

const useFaceRecognition = ({ userID, mcqID }) => {
  const [label, setLabel] = useState("");
  const [score, setScore] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Dynamically load face-api.js script
  const loadFaceAPI = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/libs/face-api.js"; // Assuming the script is placed under /public/libs/face-api.js
      script.async = true;
      script.onload = () => {
        console.log("face-api.js loaded");
        resolve();
      };
      script.onerror = (err) => {
        console.error("Error loading face-api.js", err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  };

  // Function to convert Base64 to Blob URL
  const base64ToBlobUrl = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: mimeString });
    return URL.createObjectURL(blob);
  };

  // Fetch user data for profile picture and last name
  const fetchUserData = async (userID) => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
      );
      const data = await response.json();
      if (data.success) {
        setLastname(data.userInfo.lastname);
        const blobUrl = base64ToBlobUrl(
          `data:image/jpeg;base64,${data.userInfo.profilepic}`
        );
        setProfilePic(blobUrl);
        setLoading(false);
      } else {
        console.error("Error fetching user data:", data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setLoading(false);
    }
  };

  // Load the necessary models for face-api.js
  const loadModels = async () => {
    try {
      console.log("Loading models...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      console.log("Models loaded successfully");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  // Start webcam stream
  const startWebcam = async () => {
    if (!modelsLoaded) {
      console.log("Models are not loaded yet!");
      return;
    }

    console.log("Starting webcam...");
    const video = videoRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      const canvas = canvasRef.current;
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const fullFaceDescriptions = await faceapi
          .detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!fullFaceDescriptions || fullFaceDescriptions.length === 0) {
          console.log("No faces detected.");
          return;
        }

        const resizedDetections = faceapi.resizeResults(
          fullFaceDescriptions,
          displaySize
        );

        const canvasContext = canvas.getContext("2d");
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        const labeledFaceDescriptors = await loadLabeledDescriptors();
        const faceMatcher = new faceapi.FaceMatcher(
          labeledFaceDescriptors,
          0.6
        );
        const results = fullFaceDescriptions.map((fd) =>
          faceMatcher.findBestMatch(fd.descriptor)
        );

        if (results.length > 0) {
          const bestMatch = results[0];
          const bestScore = bestMatch.distance;
          setLabel(bestMatch.label === lastname ? lastname : "Unknown");
          setScore(`Score: ${bestScore.toFixed(2)}`);
        } else {
          setLabel("Unknown");
        }
      }, 100);
    };
  };

  // Load labeled face descriptors (with profile picture)
  const loadLabeledDescriptors = async () => {
    const labels = [lastname];
    const labeledFaceDescriptors = await Promise.all(
      labels.map(async (label) => {
        const img = await faceapi.fetchImage(profilePic);
        const fullFaceDescription = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!fullFaceDescription) {
          throw new Error(`No faces detected for ${label}`);
        }

        const faceDescriptors = [fullFaceDescription.descriptor];
        return new faceapi.LabeledFaceDescriptors(label, faceDescriptors);
      })
    );
    return labeledFaceDescriptors;
  };

  useEffect(() => {
    // Load face-api.js script dynamically and then load models
    loadFaceAPI()
      .then(() => {
        console.log("face-api.js is loaded");
        loadModels();
      })
      .catch((err) => {
        console.error("Error loading face-api.js", err);
      });

    fetchUserData(userID); // Use the passed userID to fetch data
  }, [userID]);

  useEffect(() => {
    if (lastname && profilePic && modelsLoaded) {
      startWebcam(); // Start webcam once data and models are ready
    }
  }, [lastname, profilePic, modelsLoaded]);

  return {
    videoRef,
    canvasRef,
    label,
    score,
    loading,
    profilePic,
  };
};

export default useFaceRecognition;
