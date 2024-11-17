import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./educatorassessment.module.css";
import Createidentification from "../../identification/educators/create/Createidentification";
import Createquiz from "../../quizzes/educators/create/Createquiz";
import Upload from "../../docs/educator/Upload";
import Viewdocs from "../../docs/view/Viewdocs";
import Viewsubmission from "./view/quiz/Viewsubmission";
import Viewidentificationsubmission from "./view/identification/Viewidentificationsubmission";
import Courserespondents from "../../courses/respondents/Courserespondents";
import ConfirmationModal from "../../../components/confirmationmodal/ConfirmationModal";
import AlertModal from "../../../components/alertModal/AlertModal";
import Button from "../../../components/button/Button"; // Import the Button component
import MCQanswers from "../../quizzes/educators/answers/MCQanswers";
import Identificationanswers from "../../identification/educators/answers/Identificationanswers";

function Educatorassessment({ userID, courseID }) {
  const navigate = useNavigate();
  const [mcqAssessments, setMcqAssessments] = useState([]);
  const [identificationAssessments, setIdentificationAssessments] = useState(
    []
  );
  const [docsAssessments, setDocsAssessments] = useState([]);
  const [isCreatingIdentification, setIsCreatingIdentification] =
    useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [viewingDocID, setViewingDocID] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingIdentificationSubmission, setViewingIdentificationSubmission] =
    useState(null);
  const [isViewingRespondents, setIsViewingRespondents] = useState(false);
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    description: "",
  });
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  // State for alert modal
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [viewingAnswerKey, setViewingAnswerKey] = useState(null);
  const [viewingIdentificationAnswerKey, setViewingIdentificationAnswerKey] =
    useState(null);

  useEffect(() => {
    if (courseID) {
      fetchCourseDetails();
      fetchAssessments();
    }
  }, [courseID]);

  useEffect(() => {
    if (userID && courseID) {
      fetchAssessments();
    }
  }, [userID, courseID]);
  const handleViewAnswerKey = (mcqID) => {
    setViewingAnswerKey(mcqID); // Set the current MCQ ID to view its answer key
  };

  const handleBackFromAnswerKey = () => {
    setViewingAnswerKey(null); // Reset when back is clicked
  };
  const handleViewIdentificationAnswerKey = (identificationID) => {
    setViewingIdentificationAnswerKey(identificationID); // Set the current identification ID to view its answer key
  };

  const handleBackFromIdentificationAnswerKey = () => {
    setViewingIdentificationAnswerKey(null); // Reset when back is clicked
  };

  const fetchCourseDetails = () => {
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/course-details/${courseID}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourseDetails({
            title: data.course.title,
            description: data.course.description,
          });
        } else {
          console.error("Error fetching course details:", data.message);
        }
      })
      .catch((error) => console.error("Error fetching course details:", error));
  };

  const fetchAssessments = () => {
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/assessments?userID=${userID}&courseID=${courseID}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMcqAssessments(data.mcqAssessments);
          setIdentificationAssessments(data.identificationAssessments);
          setDocsAssessments(data.docsAssessments);
        }
      })
      .catch((error) => console.error("Error fetching assessments:", error));
  };

  const handleCreateQuiz = () => {
    setIsCreatingQuiz(true);
    setIsCreatingIdentification(false);
    setIsUploadingDocs(false);
    setIsViewingRespondents(false);
  };

  const handleCreateIdentification = () => {
    setIsCreatingIdentification(true);
    setIsCreatingQuiz(false);
    setIsUploadingDocs(false);
    setIsViewingRespondents(false);
  };

  const handleUploadDocs = () => {
    setIsUploadingDocs(true);
    setIsCreatingQuiz(false);
    setIsCreatingIdentification(false);
    setIsViewingRespondents(false);
  };

  const handleViewRespondents = () => {
    setIsViewingRespondents(true);
    setIsCreatingIdentification(false);
    setIsCreatingQuiz(false);
    setIsUploadingDocs(false);
    setViewingSubmission(null);
    setViewingIdentificationSubmission(null);
    setViewingDocID(null);
  };

  const handleBackToAssessments = () => {
    // Reset all conditional states to go back to the main assessment view
    setIsUploadingDocs(false);
    setIsCreatingQuiz(false);
    setIsCreatingIdentification(false);
    setIsViewingRespondents(false);
    setViewingDocID(null);
    setViewingSubmission(null);
    setViewingIdentificationSubmission(null);
  };

  const handleIdentificationCreated = () => {
    setIsCreatingIdentification(false);
    fetchAssessments();
  };

  const handleQuizCreated = () => {
    setIsCreatingQuiz(false);
    fetchAssessments();
  };

  const handleViewSubmission = (mcqID) => {
    setViewingSubmission({ mcqID });
    setIsViewingRespondents(false);
  };

  const handleViewIdentificationSubmission = (identificationID) => {
    setViewingIdentificationSubmission({ identificationID });
    setIsViewingRespondents(false);
  };

  const handleBackToSubmissions = () => {
    setViewingSubmission(null);
  };

  const handleBackToIdentificationSubmissions = () => {
    setViewingIdentificationSubmission(null);
  };

  const confirmDeleteQuiz = (mcqID) => {
    setModalMessage("Are you sure you want to delete this quiz?");
    setDeleteAction(() => () => handleDeleteQuiz(mcqID));
    setIsModalVisible(true);
  };

  const confirmDeleteIdentification = (identificationID) => {
    setModalMessage("Are you sure you want to delete this identification?");
    setDeleteAction(() => () => handleDeleteIdentification(identificationID));
    setIsModalVisible(true);
  };

  const confirmDeleteDoc = (docsID) => {
    setModalMessage("Are you sure you want to delete this document?");
    setDeleteAction(() => () => handleDeleteDoc(docsID));
    setIsModalVisible(true);
  };

  const handleDeleteQuiz = (mcqID) => {
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/deletequiz/${mcqID}`,
      { method: "DELETE" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMcqAssessments((prev) =>
            prev.filter((mcq) => mcq.mcqID !== mcqID)
          );
          setAlertMessage("Quiz deleted successfully.");
          setIsAlertVisible(true);
        } else {
          setAlertMessage(
            "Failed to delete quiz: " + (data.message || "Unknown error")
          );
          setIsAlertVisible(true);
        }
      })
      .catch((error) => console.error("Error deleting quiz:", error));

    setIsModalVisible(false);
  };

  const handleDeleteIdentification = (identificationID) => {
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/deleteidentification/${identificationID}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIdentificationAssessments((prev) =>
            prev.filter(
              (identification) =>
                identification.identificationID !== identificationID
            )
          );
          setAlertMessage("Identification deleted successfully.");
          setIsAlertVisible(true);
        } else {
          setAlertMessage(
            "Failed to delete identification: " +
              (data.message || "Unknown error")
          );
          setIsAlertVisible(true);
        }
      })
      .catch((error) => console.error("Error deleting identification:", error));

    setIsModalVisible(false);
  };

  const handleViewDoc = (docsID) => {
    setViewingDocID(docsID);
  };

  const handleBackToDocs = () => {
    setViewingDocID(null);
  };

  const handleDeleteDoc = (docsID) => {
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/deletedoc/${docsID}`,
      { method: "DELETE" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDocsAssessments((prev) =>
            prev.filter((doc) => doc.docsID !== docsID)
          );
          setAlertMessage("Document deleted successfully.");
          setIsAlertVisible(true);
        } else {
          setAlertMessage(
            "Failed to delete document: " + (data.message || "Unknown error")
          );
          setIsAlertVisible(true);
        }
      })
      .catch((error) => console.error("Error deleting document:", error));

    setIsModalVisible(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.courseinfo}>
        <h1 className={styles.title}>Course title : {courseDetails.title}</h1>
        <p className={styles.description}>{courseDetails.description}</p>
      </div>

      {!isCreatingIdentification &&
        !isCreatingQuiz &&
        !isUploadingDocs &&
        !viewingDocID &&
        !viewingSubmission &&
        !viewingIdentificationSubmission &&
        !isViewingRespondents && (
          <Button label="View Respondents" onClick={handleViewRespondents} />
        )}

      {isViewingRespondents ? (
        <>
          <Courserespondents courseID={courseID} />
          <Button
            label="Back to Assessments"
            onClick={handleBackToAssessments}
          />
        </>
      ) : (
        <>
          {isCreatingIdentification ? (
            <>
              <Createidentification
                userID={userID}
                courseID={courseID}
                onIdentificationCreated={handleIdentificationCreated}
              />
              <Button
                label="Back"
                onClick={() => setIsCreatingIdentification(false)}
              />
            </>
          ) : isCreatingQuiz ? (
            <>
              <Createquiz
                userID={userID}
                courseID={courseID}
                onQuizCreated={handleQuizCreated}
              />
              <Button label="Back" onClick={() => setIsCreatingQuiz(false)} />
            </>
          ) : isUploadingDocs ? (
            <>
              <Upload userID={userID} courseID={courseID} />
              <Button label="Back" onClick={handleBackToAssessments} />
            </>
          ) : viewingDocID ? (
            <>
              <Viewdocs docsID={viewingDocID} />{" "}
              {/* Render Viewdocs with docsID prop */}
              <Button label="Back" onClick={handleBackToDocs} />
            </>
          ) : viewingSubmission ? (
            <>
              <Viewsubmission
                userID={userID}
                courseID={courseID}
                mcqID={viewingSubmission.mcqID}
                onBack={handleBackToSubmissions}
              />
              <Button
                label="Back to Course"
                onClick={handleBackToSubmissions}
              />
            </>
          ) : viewingIdentificationSubmission ? (
            <>
              <Viewidentificationsubmission
                userID={userID}
                courseID={courseID}
                identificationID={
                  viewingIdentificationSubmission.identificationID
                }
                onBack={handleBackToIdentificationSubmissions}
              />
              <Button
                label="Back to Submissions"
                onClick={handleBackToIdentificationSubmissions}
              />
            </>
          ) : viewingAnswerKey ? (
            <>
              <MCQanswers mcqID={viewingAnswerKey} />
              <Button label="Back" onClick={handleBackFromAnswerKey} />
            </>
          ) : viewingIdentificationAnswerKey ? ( // This is where you conditionally render Identificationanswers
            <>
              <Identificationanswers
                identificationID={viewingIdentificationAnswerKey}
              />
              <Button
                label="Back"
                onClick={handleBackFromIdentificationAnswerKey}
              />
            </>
          ) : (
            <>
              <h2 className={styles.header}>Learning Document Materials</h2>
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
                        <td className={styles.actions}>
                          <Button
                            label="View Docs"
                            onClick={() => handleViewDoc(doc.docsID)}
                          />
                          <Button
                            label="Delete"
                            variant="delete"
                            onClick={() => confirmDeleteDoc(doc.docsID)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No Documents available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <h2 className={styles.header}>MCQ Assessments</h2>
              <table className={styles.assessmentTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Deadline At</th>
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
                        <td>{new Date(mcq.deadline_at).toLocaleString()}</td>
                        <td className={styles.actions}>
                          <Button
                            label="View Submissions"
                            onClick={() => handleViewSubmission(mcq.mcqID)}
                          />
                          <Button
                            label="Answer Key"
                            onClick={() => handleViewAnswerKey(mcq.mcqID)} // Pass the specific mcqID
                          />
                          <Button
                            label="Delete"
                            variant="delete"
                            onClick={() => confirmDeleteQuiz(mcq.mcqID)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No MCQ assessments available</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h2 className={styles.header}>Identification Assessments</h2>
              <table className={styles.assessmentTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Deadline At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {identificationAssessments.length > 0 ? (
                    identificationAssessments.map((identification) => (
                      <tr key={identification.identificationID}>
                        <td>{identification.title}</td>
                        <td>{identification.description}</td>
                        <td>
                          {new Date(identification.created_at).toLocaleString()}
                        </td>
                        <td>
                          {new Date(
                            identification.deadline_at
                          ).toLocaleString()}
                        </td>
                        <td className={styles.actions}>
                          <Button
                            label="View Submissions"
                            onClick={() =>
                              handleViewIdentificationSubmission(
                                identification.identificationID
                              )
                            }
                          />
                          <Button
                            label="Answer Key" // New button for Answer Key
                            onClick={() =>
                              handleViewIdentificationAnswerKey(
                                identification.identificationID
                              )
                            } // Pass the specific identificationID
                          />
                          <Button
                            label="Delete"
                            variant="delete"
                            onClick={() =>
                              confirmDeleteIdentification(
                                identification.identificationID
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        No Identification assessments available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className={styles.floatingButtons}>
                <Button
                  label="Create Quiz"
                  variant="primary"
                  onClick={handleCreateQuiz}
                />
                <Button
                  label="Create Identification"
                  onClick={handleCreateIdentification}
                />
                <Button label="Upload Documents" onClick={handleUploadDocs} />
              </div>
            </>
          )}
        </>
      )}

      {isModalVisible && (
        <ConfirmationModal
          message={modalMessage}
          onConfirm={() => {
            if (deleteAction) deleteAction();
          }}
          onCancel={() => setIsModalVisible(false)}
        />
      )}

      {isAlertVisible && (
        <AlertModal
          message={alertMessage}
          onClose={() => setIsAlertVisible(false)}
        />
      )}
    </div>
  );
}

export default Educatorassessment;
