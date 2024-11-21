import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./viewidentificationsubmission.module.css"; // Assuming you have styles
import Identificationcheatingbehavior from "../../../cheatingbehavior/identification/Identificationcheatingbehavior";

function Viewidentificationsubmission({
  userID: propUserID,
  courseID: propCourseID,
  identificationID: propIdentificationID,
}) {
  const location = useLocation();

  const [respondents, setRespondents] = useState([]); // Store respondents and their scores
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedRespondent, setSelectedRespondent] = useState(null); // State for the selected respondent

  // Fetch respondents and scores for the specific identification assessment
  useEffect(() => {
    if (propIdentificationID) {
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/identificationrespondents?identificationID=${propIdentificationID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRespondents(data.respondents);
          } else {
            setError(data.message || "Failed to fetch respondents");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching respondents:", error);
          setError("Error fetching respondents");
          setLoading(false);
        });
    }
  }, [propIdentificationID]);

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

  // Function to view cheating behavior without navigation
  const handleViewCheatingBehavior = (respondentUserID) => {
    setSelectedRespondent(respondentUserID); // Set the selected respondent to state
  };

  // Function to go back to the list view
  const handleBack = () => {
    setSelectedRespondent(null); // Reset the selected respondent to go back
  };

  return (
    <div className={styles.container}>
      {/* Conditional rendering: If a respondent is selected, show Identificationcheatingbehavior */}
      {selectedRespondent ? (
        <>
          {/* Back button to return to the list of respondents */}
          <button className={styles.backButton} onClick={handleBack}>
            Back to Respondents
          </button>

          {/* Show Identificationcheatingbehavior component */}
          <Identificationcheatingbehavior
            userID={selectedRespondent}
            identificationID={propIdentificationID}
          />
        </>
      ) : (
        <>
          <h1 className={styles.title}>
            Submission Details - Identification Assessment
          </h1>

          {/* Show loading message while data is being fetched */}
          {loading && <p>Loading respondents...</p>}

          {/* Display error message if something went wrong */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Display cheating behavior totals in cards */}
          <h2 className={styles.title}>Cheating Behavior Totals</h2>
          <div className={styles.behaviorCardsContainer}>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.faceMovement}</p>
              <p className={styles.type}>Face Movement</p>
            </div>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.multiplePeople}</p>
              <p className={styles.type}>Multiple People</p>
            </div>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.shortcutKeys}</p>
              <p className={styles.type}>Shortcut Keys</p>
            </div>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.smartphone}</p>
              <p className={styles.type}>Smartphone Use</p>
            </div>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.switchTabs}</p>
              <p className={styles.type}>Switch Tabs</p>
            </div>
            <div className={styles.behaviorCard}>
              <p className={styles.total}>{totalBehaviors.noPerson}</p>
              <p className={styles.type}>No Person Detected</p>
            </div>
          </div>

          {/* Display the respondents and their scores in a table */}
          {!loading && !error && respondents.length > 0 ? (
            <div>
              <h2 className={styles.title}>Respondents and Grades</h2>
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
                      ? respondent.score.split("/") // Split score if available
                      : [null, null];

                    // Calculate the total cheating behaviors
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
            </div>
          ) : (
            !loading && <p>No respondents available for this assessment.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Viewidentificationsubmission;
