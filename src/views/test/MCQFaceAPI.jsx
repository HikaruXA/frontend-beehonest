import React, { useState, useEffect } from "react";

// Loading Spinner Component
const LoadingSpinner = ({ size = 50, color = "#007bff" }) => {
  const styles = {
    spinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    },
    spinnerCircle: {
      width: `${size}px`,
      height: `${size}px`,
      border: `4px solid ${color}`,
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  // Inject keyframes animation
  const styleSheet = document.styleSheets[0];
  const animationName = "spin";

  try {
    styleSheet.insertRule(
      `@keyframes ${animationName} {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }`,
      styleSheet.cssRules.length
    );
  } catch (e) {
    console.warn("Could not insert keyframes", e);
  }

  return (
    <div style={styles.spinner}>
      <div style={styles.spinnerCircle} />
    </div>
  );
};

const FaceAPI = () => {
  const [userData, setUserData] = useState(null);
  const [mcqImages, setMcqImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Styles object
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
    },
    mcqImages: {
      display: "flex", // Use flexbox for horizontal layout
      gap: "10px", // Add some spacing between images
      overflowX: "auto", // Enable horizontal scrolling
      whiteSpace: "nowrap", // Prevent wrapping of children
      border: "1px solid #ddd", // Optional border for clarity
    },
    imageWrapper: {
      position: "relative",
      display: "inline-block",
      flex: "0 0 auto", // Prevent shrinking
      maxWidth: "300px", // Set a reasonable width
      margin: "0 10px", // Horizontal spacing, no vertical spacing
      textAlign: "center", // Center-align the content
      gap: "5px", // Minimal gap between elements
    },
    mcqImage: {
      width: "100%",
      height: "300px",
      objectFit: "contain",
      margin: "0", // Reset margin
      padding: "0", // Reset padding
    },
    result: {
      textAlign: "center",
      margin: "0", // Reset margin
      padding: "0", // Reset padding
      fontSize: "14px", // Keep text size consistent
      lineHeight: "1.2", // Control line height for better spacing
    },
    profile: {
      image: {
        width: "100%",
        height: "300px",
        objectFit: "contain",
        borderRadius: "0",
      },
      heading: {
        fontSize: "20px",
      },
    },
  };

  const loadFaceAPI = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/libs/face-api.js";
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

  const fetchUserData = async () => {
    const userID = 25;
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
      );
      const data = await response.json();

      if (data.success) {
        const { lastname, profilepic } = data.userInfo;
        const userInfo = {
          lastname,
          profilepic: profilepic ? `data:image/jpeg;base64,${profilepic}` : "",
        };
        setUserData(userInfo);
        return userInfo;
      } else {
        console.error("Error fetching user data:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const fetchMCQImages = async () => {
    const mcqID = 30;
    const userID = 25;
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-mcq-user-images?mcqID=${mcqID}&userID=${userID}`
      );
      const data = await response.json();

      if (data.success) {
        setMcqImages(data.images);
        return data.images;
      } else {
        console.error("Error fetching MCQ images:", data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching MCQ images:", error);
      return [];
    }
  };

  const loadLabeledDescriptors = async (profileImage) => {
    const faceapi = window.faceapi;
    const faceDescription = await faceapi
      .detectSingleFace(profileImage)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!faceDescription) {
      throw new Error("No face detected in profile picture.");
    }

    const descriptors = [faceDescription.descriptor];
    return new faceapi.LabeledFaceDescriptors("Profile Picture", descriptors);
  };

  const compareImages = async (profilepic, mcqImages) => {
    const faceapi = window.faceapi;
    try {
      const profileImage = await faceapi.fetchImage(profilepic);
      const labeledDescriptors = await loadLabeledDescriptors(profileImage);
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

      const processedImages = await Promise.all(
        mcqImages.map(async (imageData) => {
          const mcqImage = await faceapi.fetchImage(
            `data:image/jpeg;base64,${imageData.image}`
          );

          const fullFaceDescription = await faceapi
            .detectSingleFace(mcqImage)
            .withFaceLandmarks()
            .withFaceDescriptor();

          let verificationResult = {
            image: imageData.image,
            status: "Not Verified",
            color: "red",
          };

          if (fullFaceDescription) {
            const bestMatch = faceMatcher.findBestMatch(
              fullFaceDescription.descriptor
            );
            const score = bestMatch.distance;

            if (score < 0.6) {
              verificationResult = {
                ...verificationResult,
                status: "Verified User",
                color: "green",
              };
            }
          }

          return verificationResult;
        })
      );

      return processedImages;
    } catch (error) {
      console.error("Error comparing images:", error);
      return mcqImages.map((imageData) => ({
        image: imageData.image,
        status: "Not Verified",
        color: "red",
      }));
    }
  };

  const loadModels = async () => {
    const faceapi = window.faceapi;
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  };

  useEffect(() => {
    const initFaceDetection = async () => {
      try {
        setIsLoading(true);
        await loadFaceAPI();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await loadModels();
        const userData = await fetchUserData();
        if (!userData) {
          setIsLoading(false);
          return;
        }

        const mcqImages = await fetchMCQImages();
        if (mcqImages.length === 0) {
          console.log("No MCQ images found.");
          setIsLoading(false);
          return;
        }

        const processedImages = await compareImages(
          userData.profilepic,
          mcqImages
        );
        setMcqImages(processedImages);
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    };

    initFaceDetection();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      <div id="mcqImages" style={styles.mcqImages}>
        {mcqImages.map((imageData, index) => (
          <div key={index} style={styles.imageWrapper}>
            <img
              src={`data:image/jpeg;base64,${imageData.image}`}
              alt={`MCQ Image ${index + 1}`}
              style={styles.mcqImage}
            />
            <div
              style={{
                ...styles.result,
                color: imageData.color,
              }}
            >
              {imageData.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaceAPI;
