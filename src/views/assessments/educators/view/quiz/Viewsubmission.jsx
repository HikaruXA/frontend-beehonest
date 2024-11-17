import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./viewsubmission.module.css";
import Cheatingbehavior from "../../../cheatingbehavior/quiz/Cheatingbehavior";

function Viewsubmission({ userID: propUserID, courseID: propCourseID, mcqID }) {
  const location = useLocation();

  // Use the mcqID prop if available, or fallback to assessmentID from location state
  const {
    userID: stateUserID,
    courseID: stateCourseID,
    assessmentID = mcqID, // Set assessmentID to mcqID if it's not provided in location state
  } = location.state || {};

  const [respondents, setRespondents] = useState([]);
  const [selectedRespondent, setSelectedRespondent] = useState(null); // State for the selected respondent

  useEffect(() => {
    // Fetch respondents for the specific assessmentID (MCQ ID)
    fetch(`http://localhost:8081/mcqrespondents?mcqID=${assessmentID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRespondents(data.respondents);
        } else {
          console.error("Error fetching respondents:", data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  }, [assessmentID]);

  // Function to view cheating behavior without navigation
  const handleViewCheatingBehavior = (respondentUserID) => {
    setSelectedRespondent(respondentUserID); // Set the selected respondent to state
  };

  // Function to go back to the list view
  const handleBack = () => {
    setSelectedRespondent(null); // Reset the selected respondent to go back
  };

  // Calculate totals for each cheating behavior
  const totalBehaviors = {
    faceMovement: 0,
    multiplePeople: 0,
    shortcutKeys: 0,
    smartphone: 0,
    switchTabs: 0,
    noPerson: 0,
  };

  respondents.forEach((respondent) => {
    totalBehaviors.faceMovement += respondent.totalFaceMovement || 0;
    totalBehaviors.multiplePeople += respondent.totalMultiplePeople || 0;
    totalBehaviors.shortcutKeys += respondent.totalShortcutKeys || 0;
    totalBehaviors.smartphone += respondent.totalSmartphone || 0;
    totalBehaviors.switchTabs += respondent.totalSwitchTabs || 0;
    totalBehaviors.noPerson += respondent.totalNoPerson || 0;
  });

  return (
    <div className={styles.container}>
      {/* Conditional rendering: If a respondent is selected, show Cheatingbehavior */}
      {selectedRespondent ? (
        <>
          {/* Back button to return to the list of respondents */}
          <button className={styles.backButton} onClick={handleBack}>
            Back to Respondents
          </button>

          {/* Show Cheatingbehavior component */}
          <Cheatingbehavior userID={selectedRespondent} mcqID={assessmentID} />
        </>
      ) : (
        <>
          <h1 className={styles.title}>Submission Details Quiz</h1>

          {/* Display cheating behavior totals in cards */}
          <h2 className={styles.title}>Cheating Behavior Totals</h2>
          <div className={styles.behaviorCardsContainer}>
            <div className={styles.behaviorCard}>
              <h3>Face Movement</h3>
              <p>{totalBehaviors.faceMovement}</p>
            </div>
            <div className={styles.behaviorCard}>
              <h3>Multiple People</h3>
              <p>{totalBehaviors.multiplePeople}</p>
            </div>
            <div className={styles.behaviorCard}>
              <h3>Shortcut Keys</h3>
              <p>{totalBehaviors.shortcutKeys}</p>
            </div>
            <div className={styles.behaviorCard}>
              <h3>Smartphone Use</h3>
              <p>{totalBehaviors.smartphone}</p>
            </div>
            <div className={styles.behaviorCard}>
              <h3>Switch Tabs</h3>
              <p>{totalBehaviors.switchTabs}</p>
            </div>
            <div className={styles.behaviorCard}>
              <h3>No Person Detected</h3>
              <p>{totalBehaviors.noPerson}</p>
            </div>
          </div>

          {/* Display Respondents and their grades in a table */}
          <h2 className={styles.title}>Respondents and Grades</h2>
          {respondents.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Total Cheating Behavior</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {respondents.map((respondent, index) => {
                  const [correct, total] = respondent.score
                    ? respondent.score.split("/") // Assuming the score is stored as "correct/total"
                    : [null, null];

                  const totalCheating =
                    (respondent.totalMultiplePeople || 0) +
                    (respondent.totalShortcutKeys || 0) +
                    (respondent.totalSmartphone || 0) +
                    (respondent.totalSwitchTabs || 0) +
                    (respondent.totalNoPerson || 0) +
                    (respondent.totalFaceMovement || 0);

                  return (
                    <tr key={index}>
                      <td>
                        {typeof respondent.firstname === "string" &&
                        typeof respondent.lastname === "string"
                          ? `${respondent.firstname} ${respondent.lastname}`
                          : "Invalid respondent data"}
                      </td>
                      <td>
                        {correct !== null && total !== null
                          ? `${correct} out of ${total} questions`
                          : "Score data unavailable"}
                      </td>
                      <td>{totalCheating}</td>
                      <td>
                        <button
                          className={styles.cheatingButton}
                          onClick={() =>
                            handleViewCheatingBehavior(respondent.userID)
                          }
                        >
                          View Cheating Behavior
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No respondents available for this assessment.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Viewsubmission;
