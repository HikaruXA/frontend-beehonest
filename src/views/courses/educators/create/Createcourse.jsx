import React, { useState, useEffect } from "react";
import styles from "./createcourse.module.css";

const CreateCourse = ({ userID, onCourseCreated }) => {
  // Accept onCourseCreated as a prop
  const [courseData, setCourseData] = useState({
    courseCode: "",
    title: "",
    description: "",
    courseImage: null, // base64 encoded image
  });

  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset the file input

  // Function to generate a random 9-character course code
  function generateCourseCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Generate a new course code when the component mounts or refreshes
  useEffect(() => {
    setCourseData((prevData) => ({
      ...prevData,
      courseCode: generateCourseCode(),
    }));
  }, []); // Empty dependency array ensures this only runs on mount

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  // Convert image to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData({
          ...courseData,
          courseImage: reader.result.split(",")[1], // Extract base64 part of the image
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit course creation form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { courseCode, title, description, courseImage } = courseData;

    if (!courseCode || !title || !description || !courseImage) {
      setError("All fields are required.");
      return;
    }

    const formData = {
      courseCode,
      title,
      description,
      courseImage, // Base64 encoded image
      userID, // Include userID for Course_Instructors
    };

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/createcourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Course created successfully!");
        onCourseCreated(); // Notify parent component that the course was created
        // Optionally reset the form
        setCourseData({
          courseCode: generateCourseCode(),
          title: "",
          description: "",
          courseImage: null,
        });
        setFileInputKey(Date.now()); // Reset the file input
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError("Course creation failed. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create a New Course</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Course Code:</label>
        <input
          type="text"
          name="courseCode"
          value={courseData.courseCode}
          onChange={handleChange}
          readOnly // Make it read-only since it auto-generates
          className={styles.input}
        />

        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={courseData.title}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={courseData.description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />

        <label>Course Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
          key={fileInputKey} // To reset file input when needed
          className={styles.inputFile}
        />

        <button type="submit" className={styles.submitButton}>
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
