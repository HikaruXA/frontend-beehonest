import React, { useState, useEffect } from "react";

const CheatingBehaviorImages = () => {
  const [cheatingBehaviors, setCheatingBehaviors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the cheating behaviors data from the backend (logfacemovement images)
  useEffect(() => {
    const fetchCheatingBehaviors = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/testmcqfacemovement`
        );
        const data = await response.json();

        if (data.success) {
          setCheatingBehaviors(data.images); // Assuming 'images' contains the list of images from the backend
        } else {
          alert("Error fetching cheating behaviors: " + data.message);
        }
      } catch (error) {
        console.error("Error fetching cheating behaviors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheatingBehaviors();
  }, []);

  // Function to display images with the required base64 format
  const displayImage = (proof, logFM_ID) => {
    // Log the proof to verify the format
    console.log(`proof for logFM_ID: ${logFM_ID}`, proof);

    // Check if the proof data is empty or malformed
    if (
      !proof ||
      (!proof.startsWith("data:image/png;base64,") &&
        !proof.startsWith("data:image/jpeg;base64,"))
    ) {
      console.error(`Invalid or missing proof for logFM_ID: ${logFM_ID}`);
      return null; // Return null if invalid proof
    }

    return (
      <div key={logFM_ID} style={{ margin: "10px" }}>
        <img
          src={proof} // Use the base64 format here
          alt={`Cheating behavior for logFM_ID: ${logFM_ID}`}
          style={{ maxWidth: "300px", height: "auto", borderRadius: "8px" }}
        />
      </div>
    );
  };

  // Render images from the fetched cheating behaviors
  const renderImages = () => {
    return cheatingBehaviors.map((behavior) =>
      behavior.proof ? displayImage(behavior.proof, behavior.logFM_ID) : null
    );
  };

  return (
    <div>
      <h2>Cheating Behaviors Images</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderImages()}
        </div>
      )}
    </div>
  );
};

export default CheatingBehaviorImages;
