import React, { useEffect, useState } from "react";

// Loading Spinner Component (reused from MCQFaceAPI)
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

const IdentificationFaceAPI = ({ userID, identificationID }) => {
  const [userData, setUserData] = useState(null);
  const [mcqImages, setMcqImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Styles object (copied from MCQFaceAPI)
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
    },
    mcqImages: {
      display: "flex",
      gap: "10px",
      overflowX: "auto",
      whiteSpace: "nowrap",
      border: "1px solid #ddd",
    },
    imageWrapper: {
      position: "relative",
      display: "inline-block",
      flex: "0 0 auto",
      maxWidth: "300px",
      margin: "0 10px",
      textAlign: "center",
      gap: "5px",
    },
    mcqImage: {
      width: "100%",
      height: "300px",
      objectFit: "contain",
      margin: "0",
      padding: "0",
    },
    result: {
      textAlign: "center",
      margin: "0",
      padding: "0",
      fontSize: "14px",
      lineHeight: "1.2",
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

  // Existing methods from the original component...
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
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
      );
      const data = await response.json();
      if (data.success) {
        const { lastname, profilepic } = data.userInfo;
        return {
          lastname,
          profilepic: profilepic
            ? `data:image/jpeg;base64,${profilepic}`
            : null,
        };
      } else {
        console.error("Error fetching user data:", data.message);
        return null;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  const fetchMCQImages = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-identification-user-images?identificationID=${identificationID}&userID=${userID}`
      );
      const data = await response.json();
      if (data.success && data.images) {
        return data.images.map((img) => ({
          id: img.identificationuserimageID,
          proof: `data:image/jpeg;base64,${img.proof}`,
        }));
      }
      return [];
    } catch (err) {
      console.error("Error fetching MCQ images:", err);
      return [];
    }
  };

  const loadLabeledDescriptors = async (profileImage) => {
    const faceDescription = await faceapi
      .detectSingleFace(profileImage)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!faceDescription) {
      throw new Error("No face detected in profile picture.");
    }

    return new faceapi.LabeledFaceDescriptors("Profile Picture", [
      faceDescription.descriptor,
    ]);
  };

  const compareImages = async (profilepic, mcqImages) => {
    const profileImage = await faceapi.fetchImage(profilepic);
    const labeledDescriptors = await loadLabeledDescriptors(profileImage);

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    // Return an array of promises
    return mcqImages.map(async (image) => {
      try {
        const mcqImage = await faceapi.fetchImage(image.proof);
        const faceDescription = await faceapi
          .detectSingleFace(mcqImage)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!faceDescription) {
          return {
            ...image,
            match: false,
            color: "red",
            status: "Not Verified",
          };
        }

        const bestMatch = faceMatcher.findBestMatch(faceDescription.descriptor);
        return {
          ...image,
          match: bestMatch.label === "Profile Picture",
          color: bestMatch.label === "Profile Picture" ? "green" : "red",
          status:
            bestMatch.label === "Profile Picture"
              ? "Verified User"
              : "Not Verified",
          distance: bestMatch.distance,
        };
      } catch (err) {
        console.error("Error comparing image:", err);
        return { ...image, match: false, color: "red", status: "Not Verified" };
      }
    });
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      try {
        await loadFaceAPI();
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

        const user = await fetchUserData();
        if (user) {
          setUserData(user);

          const images = await fetchMCQImages();
          if (images.length > 0) {
            // Wait for all image comparison results
            const results = await Promise.all(
              await compareImages(user.profilepic, images)
            );
            setMcqImages(results);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [userID, identificationID]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      <div id="mcqImages" style={styles.mcqImages}>
        {mcqImages.length > 0 ? (
          mcqImages.map((img) => (
            <div key={img.id} style={styles.imageWrapper}>
              <img
                src={img.proof}
                alt={`Identification Image ${img.id}`}
                style={styles.mcqImage}
              />
              <div
                style={{
                  ...styles.result,
                  color: img.color,
                }}
              >
                {img.status}
              </div>
            </div>
          ))
        ) : (
          <p>No Identification images found.</p>
        )}
      </div>
    </div>
  );
};

export default IdentificationFaceAPI;
