import React, { useState, useEffect } from "react";
import Card from "../../../../components/card/Card";
import Updatecourse from "../update/Updatecourse";
import styles from "./educatorsdisplay.module.css";
import ConfirmationModal from "../../../../components/confirmationmodal/ConfirmationModal";
import AlertModal from "../../../../components/alertModal/AlertModal";

function EducatorsDisplay({ userID, onCardClick, onAddCourseClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCourseID, setEditingCourseID] = useState(null);
  const [cheatingCounts, setCheatingCounts] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State to control confirmation modal visibility
  const [courseToDelete, setCourseToDelete] = useState(null); // Store the ID of the course to delete
  const [showAlertModal, setShowAlertModal] = useState(false); // State for alert modal
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message

  // Function to fetch courses for the logged-in educator
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/courses/${userID}`
      );
      const data = await response.json();

      if (data.success) {
        setCourses(data.courses);
      } else {
        setError(data.message || "Failed to fetch courses");
      }
    } catch (err) {
      setError("Error fetching courses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch cheating counts for the educator
  const fetchCheatingCounts = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/cheating-count/${userID}`
      );
      const data = await response.json();

      if (data.success) {
        setCheatingCounts(data.cheatingCounts);
      } else {
        setError(data.message || "Failed to fetch cheating counts");
      }
    } catch (err) {
      setError("Error fetching cheating counts: " + err.message);
    }
  };

  // Fetch courses and cheating counts when the component mounts or userID changes
  useEffect(() => {
    fetchCourses();
    fetchCheatingCounts();
  }, [userID]);

  // Handle the course edit button click
  const handleEditCourse = (e, courseID) => {
    e.stopPropagation();
    setEditingCourseID(courseID);
  };

  // Handle the course delete button click
  const handleDeleteCourse = (e, courseID) => {
    e.stopPropagation(); // Prevent triggering onCardClick
    setCourseToDelete(courseID); // Set the course ID to delete
    setShowConfirmationModal(true); // Show the confirmation modal
  };

  // Function to confirm deletion of the course
  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/courses/${courseToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourses(
          courses.filter((course) => course.courseID !== courseToDelete)
        );
        setAlertMessage("Course deleted successfully!");
      } else {
        setAlertMessage("Failed to delete course: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      setAlertMessage("An error occurred while deleting the course.");
    } finally {
      setShowConfirmationModal(false); // Hide the confirmation modal after confirming
      setCourseToDelete(null); // Reset course to delete
      setShowAlertModal(true); // Show the alert modal
    }
  };

  // Function to cancel the deletion action
  const cancelDelete = () => {
    setShowConfirmationModal(false); // Hide the confirmation modal
    setCourseToDelete(null); // Reset course to delete
  };

  // Function to handle going back from edit mode
  const handleBackClick = () => {
    setEditingCourseID(null); // Cancel editing
    fetchCourses(); // Re-fetch courses to get the updated list
  };

  // Function to close the alert modal
  const closeAlert = () => {
    setShowAlertModal(false); // Hide the alert modal
  };

  if (editingCourseID) {
    return (
      <div>
        <button
          onClick={handleBackClick}
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <Updatecourse
          courseID={editingCourseID}
          onCancelEdit={() => setEditingCourseID(null)} // Pass handler to cancel editing
        />
      </div>
    );
  }

  return (
    <>
      <h1>BeeHonest's Learning Management System</h1>
      <h3 className={styles.title}>Cheating Behavior Counts</h3>
      <div className={styles.behaviorCardsContainer}>
        {cheatingCounts.length > 0 ? (
          cheatingCounts.map((behavior, index) => (
            <div key={index} className={styles.behaviorCard}>
              <h3>{behavior.cheatingType}</h3>
              <p>{behavior.totalOccurrences}</p>
            </div>
          ))
        ) : (
          <p>No cheating behaviors recorded.</p>
        )}
      </div>
      <hr></hr>
      <h2 className={styles.title}>Educator's Courses</h2>
      <hr></hr>
      <button onClick={onAddCourseClick} className={styles.addCourseButton}>
        Add Courses
      </button>
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
                  onClick={() => onCardClick(course.courseID)} // Card click handler
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
                    onEditClick={(e) => handleEditCourse(e, course.courseID)} // Handle edit button
                    onDeleteClick={(e) =>
                      handleDeleteCourse(e, course.courseID)
                    } // Handle delete button
                  />
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this course? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      {showAlertModal && (
        <AlertModal message={alertMessage} onClose={closeAlert} />
      )}
    </>
  );
}

export default EducatorsDisplay;
