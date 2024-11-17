import React, { useState, useEffect, useRef } from "react";
import styles from "./profile.module.css"; // Import the CSS module for styling

function Profile({ userID }) {
  const [userInfo, setUserInfo] = useState({
    firstname: "",
    lastname: "",
    profilepic: null,
    roleID: "", // Add roleID to the userInfo state
  });
  const fileInputRef = useRef(null); // Reference for the file input

  // Fetch user info from the backend when the component mounts
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
      );
      const data = await response.json();

      if (data.success) {
        const fetchedProfilePic = data.userInfo.profilepic
          ? `data:image/jpeg;base64,${data.userInfo.profilepic}`
          : null;

        setUserInfo({
          firstname: data.userInfo.firstname,
          lastname: data.userInfo.lastname,
          profilepic: fetchedProfilePic, // Store fetched profile picture
          roleID: data.userInfo.roleID || "", // Fetch and set the roleID
        });
      } else {
        console.error("Error fetching user info:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo(); // Fetch user info on mount
  }, [userID]);

  // Handle profile picture change
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1]; // Remove the data URL prefix
        setUserInfo((prevInfo) => ({
          ...prevInfo,
          profilepic: base64String, // Store only base64 string
        }));

        // Call the new endpoint to update the profile picture
        try {
          const response = await fetch(
            `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}/profilepic`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ profilepic: base64String }),
            }
          );

          const data = await response.json();
          if (data.success) {
            alert("Profile picture updated successfully!");
            // Re-fetch the user info to get the updated profile picture
            fetchUserInfo();
          } else {
            console.error("Error updating profile picture:", data.message);
            alert("Failed to update profile picture. Please try again.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while updating the profile picture.");
        }
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstname, lastname } = userInfo;

    // Create a request body
    const requestBody = {
      firstname,
      lastname,
    };

    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully!");
      } else {
        console.error("Error updating profile:", data.message);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Function to trigger file input click
  const handleProfilePicClick = () => {
    fileInputRef.current.click(); // Trigger the file input click
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.header}>Profile</h1>
      <div
        className={styles.profilePicContainer}
        onClick={handleProfilePicClick} // Open file dialog on click
      >
        {userInfo.profilepic ? (
          <img
            src={userInfo.profilepic}
            alt="Profile"
            className={styles.profilePic}
          />
        ) : (
          <div className={styles.defaultPic}>No Image</div>
        )}
      </div>

      {/* Hidden file input for uploading profile picture */}
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePicChange}
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the input
      />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>
            First Name:
            <input
              type="text"
              name="firstname"
              value={userInfo.firstname}
              onChange={(e) =>
                setUserInfo({ ...userInfo, firstname: e.target.value })
              }
              required
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>
            Last Name:
            <input
              type="text"
              name="lastname"
              value={userInfo.lastname}
              onChange={(e) =>
                setUserInfo({ ...userInfo, lastname: e.target.value })
              }
              required
              className={styles.input}
            />
          </label>
        </div>
        <button type="submit" className={styles.submitButton}>
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
