import React, { useEffect, useState } from "react";
import styles from "./courserespondents.module.css";
import Studentcheatingbehavior from "../../studentcheatingbehavior/Studentcheatingbehavior";
import ConfirmationModal from "../../../components/confirmationmodal/ConfirmationModal";
import AlertModal from "../../../components/alertModal/AlertModal";

function Courserespondents({ courseID }) {
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false); // State for alert visibility
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message

  useEffect(() => {
    const fetchRespondents = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/course-respondents/${courseID}`
        );
        const data = await response.json();

        if (data.success) {
          setRespondents(data.respondents);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error("Error fetching respondents:", err);
        setError("An error occurred while fetching respondents.");
      } finally {
        setLoading(false);
      }
    };

    fetchRespondents();
  }, [courseID]);

  const handleRemove = (userID) => {
    // Set the user to remove and show the confirmation modal
    setUserToRemove(userID);
    setIsModalVisible(true);
  };

  const confirmRemove = async () => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/course-respondents/${courseID}/remove/${userToRemove}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        setRespondents((prevRespondents) =>
          prevRespondents.filter(
            (respondent) => respondent.userID !== userToRemove
          )
        );
        setAlertMessage("Respondent removed successfully."); // Success message
      } else {
        setAlertMessage("Failed to remove respondent."); // Failure message
      }
    } catch (err) {
      console.error("Error removing respondent:", err);
      setAlertMessage(
        "An error occurred while trying to remove the respondent."
      );
    } finally {
      setIsModalVisible(false); // Close the confirmation modal
      setUserToRemove(null); // Reset user to remove
      setIsAlertVisible(true); // Show the alert modal
    }
  };

  const cancelRemove = () => {
    setIsModalVisible(false); // Close the modal without removing
    setUserToRemove(null); // Reset user to remove
  };

  const handleView = (userID) => {
    setSelectedUserID(userID);
  };

  const closeAlert = () => {
    setIsAlertVisible(false); // Close the alert modal
  };

  if (loading) {
    return <p className={styles.loading}>Loading respondents...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (selectedUserID) {
    return <Studentcheatingbehavior userID={selectedUserID} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Course Respondents</h1>
      {respondents.length === 0 ? (
        <p className={styles.noRespondents}>
          No respondents found for this course.
        </p>
      ) : (
        <ul className={styles.respondentList}>
          {respondents.map((respondent) => (
            <li key={respondent.userID} className={styles.respondentItem}>
              {respondent.profilepic && (
                <img
                  src={`data:image/jpeg;base64,${respondent.profilepic}`}
                  alt={`${respondent.firstname} ${respondent.lastname}`}
                  className={styles.profilePic}
                />
              )}
              <div className={styles.respondentInfo}>
                <strong className={styles.respondentName}>
                  {respondent.firstname} {respondent.lastname}
                </strong>
                <div className={styles.actions}>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(respondent.userID)}
                  >
                    Remove
                  </button>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleView(respondent.userID)}
                  >
                    View
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Render ConfirmationModal if it's visible */}
      {isModalVisible && (
        <ConfirmationModal
          message="Are you sure you want to remove this respondent?"
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
        />
      )}

      {/* Render AlertModal if it's visible */}
      {isAlertVisible && (
        <AlertModal message={alertMessage} onClose={closeAlert} />
      )}
    </div>
  );
}

export default Courserespondents;
