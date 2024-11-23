import React, { useState } from "react";
import styles from "./upload.module.css";

function Upload({ userID, courseID }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null); // State for the selected file

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    // Read the file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64File = reader.result.split(",")[1]; // Get the base64 part

      // Prepare form data
      const formData = {
        userID,
        courseID,
        title,
        description,
        file: base64File, // Use the base64 file
      };

      // Send the request to upload the document
      try {
        const response = await fetch(
          "https://backend-bhonest-a110b63abc0c.herokuapp.com/upload",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Set content type to JSON
            },
            body: JSON.stringify(formData), // Stringify the JSON data
          }
        );

        const data = await response.json();
        if (data.success) {
          alert("Document uploaded successfully!");
        } else {
          alert("Failed to upload document: " + data.message);
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("An error occurred while uploading the document.");
      }
    };

    reader.readAsDataURL(file); // Read the file as base64
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the selected file
    const maxFileSize = 16 * 1024 * 1024; // 16 MB in bytes

    // Check if the selected file is a PDF
    if (selectedFile && selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      setFile(null); // Reset the file state
      e.target.value = ""; // Clear the file input
      return;
    }

    // Check if the selected file exceeds the maximum size
    if (selectedFile.size > maxFileSize) {
      alert("File size exceeds 16MB limit. Please upload a smaller file.");
      setFile(null); // Reset the file state
      e.target.value = ""; // Clear the file input
    } else {
      setFile(selectedFile); // Set the selected file
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h1>Upload Documents</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="file">Upload a file:</label>
          <input
            type="file"
            id="file"
            name="file"
            required
            onChange={handleFileChange} // Handle file selection
          />
        </div>

        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default Upload;
