import React, { useState, useEffect, useRef } from "react";
import styles from "./updatecourse.module.css"; // Import the CSS module for styling

function Updatecourse({ courseID, onCancelEdit }) {
  // Added onCancelEdit prop for the back button
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    courseImage: null,
  });
  const fileInputRef = useRef(null); // Reference for the file input

  // Fetch course info from the backend when the component mounts
  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/course-details/${courseID}`
      );
      const data = await response.json();

      if (data.success) {
        const fetchedCourseImage = data.course.courseImage
          ? `data:image/jpeg;base64,${data.course.courseImage}`
          : null;

        setCourseInfo({
          title: data.course.title,
          description: data.course.description,
          courseImage: fetchedCourseImage, // Store fetched course image
        });
      } else {
        console.error("Error fetching course info:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchCourseInfo(); // Fetch course info on mount
  }, [courseID]);

  // Handle course image change
  const handleCourseImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1]; // Remove the data URL prefix
        setCourseInfo((prevInfo) => ({
          ...prevInfo,
          courseImage: base64String, // Store only base64 string
        }));

        // Call the new endpoint to update the course image
        try {
          const response = await fetch(
            `https://backend-bhonest-a110b63abc0c.herokuapp.com/courses/${courseID}/image`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ courseImage: base64String }),
            }
          );

          const data = await response.json();
          if (data.success) {
            alert("Course image updated successfully!");
            // Reload the component to fetch the updated course info
            fetchCourseInfo();
          } else {
            console.error("Error updating course image:", data.message);
            alert("Failed to update course image. Please try again.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while updating the course image.");
        }
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  // Handle form submission for updating course details
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description } = courseInfo;

    // Create a request body
    const requestBody = {
      title,
      description,
    };

    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/courses/${courseID}`,
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
        alert("Course updated successfully!");
        // Reload the component to fetch the updated course info
        fetchCourseInfo();
      } else {
        console.error("Error updating course:", data.message);
        alert("Failed to update course. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Function to trigger file input click
  const handleCourseImageClick = () => {
    fileInputRef.current.click(); // Trigger the file input click
  };

  return (
    <div className={styles.updateCourseContainer}>
      <h1 className={styles.header}>Update Course</h1>
      <div
        className={styles.courseImageContainer}
        onClick={handleCourseImageClick} // Open file dialog on click
      >
        {courseInfo.courseImage ? (
          <img
            src={courseInfo.courseImage}
            alt="Course"
            className={styles.courseImage}
          />
        ) : (
          <div className={styles.defaultImage}>No Image</div>
        )}
      </div>

      {/* Hidden file input for uploading course image */}
      <input
        type="file"
        accept="image/*"
        onChange={handleCourseImageChange}
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the input
      />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>
            Course Title:
            <input
              type="text"
              name="title"
              value={courseInfo.title}
              onChange={(e) =>
                setCourseInfo({ ...courseInfo, title: e.target.value })
              }
              required
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>
            Description:
            <textarea
              name="description"
              value={courseInfo.description}
              onChange={(e) =>
                setCourseInfo({ ...courseInfo, description: e.target.value })
              }
              required
              className={styles.textarea}
            />
          </label>
        </div>
        <button type="submit" className={styles.submitButton}>
          Update Course
        </button>
      </form>
    </div>
  );
}

export default Updatecourse;
