import React, { useState, useEffect } from "react";
import styles from "./studentassessment.module.css";
import Identificationdisplay from "../../identification/students/identificationdisplay/Identificationdisplay";
import QuizDisplay from "../../quizzes/students/quizdisplay/Quizdisplay";
import Viewdocs from "../../docs/view/Viewdocs";
import Warningmodal from "../../../components/warningmodal/Warningmodal";
import { useNavigate } from "react-router-dom";

function StudentAssessment({ userID, courseID }) {
  const navigate = useNavigate();
  const [mcqAssessments, setMcqAssessments] = useState([]);
  const [identificationAssessments, setIdentificationAssessments] = useState(
    []
  );
  const [mcqStatuses, setMcqStatuses] = useState({});
  const [identificationStatuses, setIdentificationStatuses] = useState({});

  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [pendingAssessmentType, setPendingAssessmentType] = useState(null);
  const [pendingAssessmentId, setPendingAssessmentId] = useState(null);

  const [docsAssessments, setDocsAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewingQuiz, setIsViewingQuiz] = useState(false);
  const [isViewingIdentification, setIsViewingIdentification] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [viewingDocID, setViewingDocID] = useState(null);
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (courseID) {
      // Fetch course assessments
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/courseassessments?courseID=${courseID}`
      )
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            setMcqAssessments(data.mcqAssessments);
            setIdentificationAssessments(data.identificationAssessments);
            setDocsAssessments(data.docsAssessments);

            // Fetch statuses
            const mcqStatuses = await Promise.all(
              data.mcqAssessments.map(async (mcq) => {
                const res = await fetch(
                  `https://backend-bhonest-a110b63abc0c.herokuapp.com/check-mcq-status?mcqID=${mcq.mcqID}&userID=${userID}`
                );
                const result = await res.json();
                return { mcqID: mcq.mcqID, taken: result.taken };
              })
            );

            const identificationStatuses = await Promise.all(
              data.identificationAssessments.map(async (ident) => {
                const res = await fetch(
                  `https://backend-bhonest-a110b63abc0c.herokuapp.com/check-identification-status?identificationID=${ident.identificationID}&userID=${userID}`
                );
                const result = await res.json();
                return {
                  identificationID: ident.identificationID,
                  taken: result.taken,
                };
              })
            );

            // Map statuses to objects for quick access
            setMcqStatuses(
              mcqStatuses.reduce((acc, status) => {
                acc[status.mcqID] = status.taken;
                return acc;
              }, {})
            );

            setIdentificationStatuses(
              identificationStatuses.reduce((acc, status) => {
                acc[status.identificationID] = status.taken;
                return acc;
              }, {})
            );
          } else {
            setError("Failed to load assessments");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching assessments:", error);
          setError("Error fetching assessments");
          setLoading(false);
        });

      // Fetch course details
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/course-details/${courseID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCourseDetails(data.course);
          } else {
            setError("Failed to load course details");
          }
        })
        .catch((error) => {
          console.error("Error fetching course details:", error);
          setError("Error fetching course details");
        });
    }
  }, [courseID, userID]);

  const handleViewQuiz = async (mcqID) => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/check-mcq-status?mcqID=${mcqID}&userID=${userID}`
      );
      const result = await response.json();

      if (result.success) {
        if (!result.taken) {
          const selectedMcq = mcqAssessments.find((mcq) => mcq.mcqID === mcqID);
          const deadline = new Date(selectedMcq.deadline_at);
          const currentDate = new Date();

          if (currentDate <= deadline) {
            // Open warning modal instead of directly viewing quiz
            setIsWarningModalOpen(true);
            setPendingAssessmentType("mcq");
            setPendingAssessmentId(mcqID);
          } else {
            alert("The deadline for this quiz has passed.");
          }
        } else {
          alert("You have already taken this quiz.");
        }
      } else {
        alert(`Error checking quiz status: ${result.message}`);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
      alert("An error occurred while checking the quiz status.");
    }
  };

  const handleViewIdentification = async (identificationID) => {
    try {
      const response = await fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/check-identification-status?identificationID=${identificationID}&userID=${userID}`
      );
      const result = await response.json();

      if (result.success) {
        if (!result.taken) {
          const selectedIdentification = identificationAssessments.find(
            (ident) => ident.identificationID === identificationID
          );
          const deadline = new Date(selectedIdentification.deadline_at);
          const currentDate = new Date();

          if (currentDate <= deadline) {
            // Open warning modal instead of directly viewing identification
            setIsWarningModalOpen(true);
            setPendingAssessmentType("identification");
            setPendingAssessmentId(identificationID);
          } else {
            alert("The deadline for this identification quiz has passed.");
          }
        } else {
          alert("You have already taken this identification quiz.");
        }
      } else {
        alert(`Error checking identification status: ${result.message}`);
      }
    } catch (error) {
      console.error("Error checking identification status:", error);
      alert("An error occurred while checking the identification quiz status.");
    }
  };

  const handleConfirmWarning = () => {
    // Close warning modal
    setIsWarningModalOpen(false);

    // Proceed with the selected assessment type
    if (pendingAssessmentType === "mcq") {
      setIsViewingQuiz(true);
      setCurrentAssessment(pendingAssessmentId);
    } else if (pendingAssessmentType === "identification") {
      setIsViewingIdentification(true);
      setCurrentAssessment(pendingAssessmentId);
    }

    // Reset pending assessment states
    setPendingAssessmentType(null);
    setPendingAssessmentId(null);
  };

  const handleCancelWarning = () => {
    // Simply close the modal and reset pending assessment states
    setIsWarningModalOpen(false);
    setPendingAssessmentType(null);
    setPendingAssessmentId(null);
  };

  const handleViewDocs = (docsID) => {
    setViewingDocID(docsID);
  };

  const handleBackToDocs = () => {
    setViewingDocID(null);
  };

  const renderQuizDisplay = () => {
    return (
      <QuizDisplay
        mcqID={currentAssessment}
        courseID={courseID}
        userID={userID}
        onClose={() => {
          setIsViewingQuiz(false);
          setCurrentAssessment(null);
        }}
      />
    );
  };

  const renderIdentificationDisplay = () => {
    return (
      <Identificationdisplay
        identificationID={currentAssessment}
        courseID={courseID}
        userID={userID}
        onClose={() => {
          setIsViewingIdentification(false);
          setCurrentAssessment(null);
        }}
      />
    );
  };

  // Loading and error handling
  if (loading) {
    return <p>Loading assessments...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div>
      {/* Warning Modal */}
      <Warningmodal
        isOpen={isWarningModalOpen}
        onClose={handleCancelWarning}
        onConfirm={handleConfirmWarning}
      />

      {isViewingQuiz ? (
        renderQuizDisplay()
      ) : isViewingIdentification ? (
        renderIdentificationDisplay()
      ) : viewingDocID ? (
        <>
          <Viewdocs docsID={viewingDocID} />
        </>
      ) : (
        <>
          <div className={styles.courseinfo}>
            <h1 className={styles.title}>
              Course Title : {courseDetails.title}
            </h1>
            <p className={styles.description}>{courseDetails.description}</p>
          </div>
          <h2 className={styles.title}>MCQ Assessments</h2>
          <table className={styles.assessmentTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Deadline At</th>
                <th>Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mcqAssessments.length > 0 ? (
                mcqAssessments.map((mcq) => (
                  <tr key={mcq.mcqID}>
                    <td>{mcq.title}</td>
                    <td>{mcq.description}</td>
                    <td>{new Date(mcq.created_at).toLocaleString()}</td>
                    <td
                      style={{
                        color:
                          new Date(mcq.deadline_at) < new Date()
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {new Date(mcq.deadline_at).toLocaleString()}
                    </td>
                    <td>{mcqStatuses[mcq.mcqID] ? "YES" : "NO"}</td>
                    <td>
                      <button
                        onClick={() => handleViewQuiz(mcq.mcqID)}
                        className={styles.actionButton}
                      >
                        Take Quiz
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No MCQ assessments available</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 className={styles.title}>Identification Assessments</h2>
          <table className={styles.assessmentTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Deadline At</th>
                <th>Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {identificationAssessments.length > 0 ? (
                identificationAssessments.map((ident) => (
                  <tr key={ident.identificationID}>
                    <td>{ident.title}</td>
                    <td>{ident.description}</td>
                    <td>{new Date(ident.created_at).toLocaleString()}</td>
                    <td
                      style={{
                        color:
                          new Date(ident.deadline_at) < new Date()
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {new Date(ident.deadline_at).toLocaleString()}
                    </td>
                    <td>
                      {identificationStatuses[ident.identificationID]
                        ? "YES"
                        : "NO"}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleViewIdentification(ident.identificationID)
                        }
                        className={styles.actionButton}
                      >
                        Take Identification
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No Identification assessments available</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 className={styles.title}>Learning Materials</h2>
          <table className={styles.assessmentTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docsAssessments.length > 0 ? (
                docsAssessments.map((doc) => (
                  <tr key={doc.docsID}>
                    <td>{doc.title}</td>
                    <td>{doc.description}</td>
                    <td>{new Date(doc.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleViewDocs(doc.docsID)}
                        className={styles.actionButton}
                      >
                        View Docs
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No Docs assessments available</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default StudentAssessment;
