import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./viewdocs.module.css";

function Viewdocs({ docsID: propsDocsID, userID, courseID }) {
  const location = useLocation();

  // If propsDocsID is provided, use it. Otherwise, fallback to location.state
  const {
    docsID: stateDocsID,
    userID: stateUserID,
    courseID: stateCourseID,
  } = location.state || {};

  // Use docsID from props if available, otherwise fall back to location state
  const docsID = propsDocsID || stateDocsID;
  userID = userID || stateUserID;
  courseID = courseID || stateCourseID;

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (docsID) {
      // Fetch the document details from the backend
      fetch(`https://backend-bhonest-a110b63abc0c.herokuapp.com/docs/${docsID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setDocumentData(data.document);
          } else {
            setError(data.message);
          }
          setLoading(false);
        })
        .catch((error) => {
          setError("Error fetching document details");
          setLoading(false);
        });
    }
  }, [docsID]);

  if (loading) {
    return <p className={styles.loading}>Loading document details...</p>;
  }

  if (error) {
    return <p className={styles.error}>Error: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>View Document Details</h1>

      {documentData && (
        <div className={styles.documentDetails}>
          <div className={styles.documentInformation}>
            <h2 className={styles.documentTitle}>
              Document Title: {documentData.title}
            </h2>
            <p className={styles.documentDescription}>
              Description: {documentData.description}
            </p>
          </div>

          {documentData.fileData && (
            <div className={styles.filePreview}>
              <h3 className={styles.titlefile}>File Preview</h3>
              <div className={styles.embedContainer}>
                <embed
                  src={`data:application/pdf;base64,${documentData.fileData}`}
                  width="100%"
                  height="400"
                  type="application/pdf"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Viewdocs;
