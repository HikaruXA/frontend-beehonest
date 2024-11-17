import React, { useState, useEffect } from "react";
import Card from "../../../components/card/Card";
import styles from "./studentsdisplay.module.css"; // Import the CSS module
import AlertModal from "../../../components/alertModal/AlertModal";

function StudentDisplay({ userID, onCardClick }) {
  const [courseCode, setCourseCode] = useState("");
  const [courses, setCourses] = useState([]); // To store the joined courses
  const [loading, setLoading] = useState(true); // Loading state for fetching courses
  const [error, setError] = useState(""); // Error state
  const [reload, setReload] = useState(false); // State to trigger reload
  const [alertVisible, setAlertVisible] = useState(false); // State for alert modal visibility
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message

  // Fetch joined courses after the component is mounted or when userID or reload changes
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/usercourses/${userID}`
        );
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses); // Set the joined courses
        } else {
          setError(data.message || "Failed to fetch courses.");
        }
      } catch (err) {
        setError("Error fetching courses: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [userID, reload]); // Add reload to the dependency array

  // Handle joining a course
  const handleJoinClick = async () => {
    if (!courseCode) {
      setAlertMessage("Please enter a course code.");
      setAlertVisible(true);
      return;
    }

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/joincourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseCode, userID }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Show success message
        setAlertMessage("Successfully joined the course!");
        setReload((prev) => !prev); // Trigger reload to fetch updated course list
        setCourseCode(""); // Clear the input field after joining
      } else {
        setAlertMessage(`Failed to join course: ${result.message}`);
      }
    } catch (error) {
      console.error("Error joining course:", error);
      setAlertMessage("An error occurred while joining the course.");
    } finally {
      setAlertVisible(true); // Show alert modal at the end of the try block
    }
  };

  // Function to close the alert modal
  const closeAlertModal = () => {
    setAlertVisible(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.joinContainer}>
          <input
            type="text"
            placeholder="Enter Course Code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleJoinClick} className={styles.joinButton}>
            JOIN
          </button>
        </div>
      </div>
      <h1 className={styles.heading}>My Courses</h1>
      <hr />
      {loading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className={styles.coursesContainer}>
          <div className={styles.coursesGrid}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.courseID}
                  onClick={() => onCardClick(course.courseID)}
                >
                  <Card
                    title={course.title}
                    code={course.courseCode}
                    image={
                      course.courseImage
                        ? `data:image/jpeg;base64,${course.courseImage}`
                        : null
                    }
                    description={course.description}
                    showEdit={false} // Hide the edit button
                    showDelete={false} // Hide the delete button
                  />
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        </div>
      )}

      {/* Render AlertModal if alertVisible is true */}
      {alertVisible && (
        <AlertModal message={alertMessage} onClose={closeAlertModal} />
      )}
    </>
  );
}

export default StudentDisplay;
