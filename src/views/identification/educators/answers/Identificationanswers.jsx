import React, { useState, useEffect } from "react";
import jsPDF from "jspdf"; // Import jsPDF
import styles from "./Identificationanswers.module.css"; // Ensure this file exists

function Identificationanswers({ identificationID }) {
  const [identificationDetails, setIdentificationDetails] = useState(null);
  const [identificationInfo, setIdentificationInfo] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch identification details when the component is mounted
  useEffect(() => {
    if (identificationID) {
      // Fetching identification details
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/identification/${identificationID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIdentificationDetails(data.data);
          } else {
            setError("Failed to load identification details");
          }
        })
        .catch((err) => {
          setError("Error fetching identification details");
        });

      // Fetching title and description
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-identification-title-description?identificationID=${identificationID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIdentificationInfo({
              title: data.title,
              description: data.description,
            });
          } else {
            setError("Failed to load identification info");
          }
        })
        .catch((err) => {
          setError("Error fetching identification info");
        })
        .finally(() => setLoading(false)); // Set loading to false at the end
    }
  }, [identificationID]);

  // Function to generate PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);

    // Center the title
    const title = "Identification Answer Key";
    const titleWidth = doc.getTextWidth(title);
    const xCenter = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xCenter, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Add identification title and description
    if (identificationInfo) {
      doc.text(`Title: ${identificationInfo.title}`, 14, 30);
      doc.text(`Description: ${identificationInfo.description}`, 14, 40);
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);
    }

    if (identificationDetails) {
      identificationDetails.questions.forEach((qa, index) => {
        // Add question number and text
        doc.setFont("helvetica", "bold");
        doc.text(`Question ${index + 1}: ${qa.question}`, 14, 50 + index * 40);
        doc.setFont("helvetica", "normal");

        // Add correct answer
        doc.setFont("helvetica", "bold");
        doc.text(`Correct Answer: ${qa.correct_answer}`, 14, 55 + index * 40);
        doc.setFont("helvetica", "normal");

        // Add a horizontal line
        doc.setLineWidth(0.5);
        doc.line(10, 60 + index * 40, 200, 60 + index * 40); // Horizontal line
      });
    }

    // Save the PDF with the identification title as the file name
    const fileName = identificationInfo.title
      ? `${identificationInfo.title}.pdf`
      : "Identification_Answer_Key.pdf";
    doc.save(fileName);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Identification Answers</h1>
        <button onClick={downloadPDF} className={styles.downloadButton}>
          Download PDF
        </button>
      </div>

      {loading && (
        <p className={styles.loading}>Loading identification details...</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {identificationInfo.title && (
        <div className={styles.identificationInfo}>
          <h2 className={styles.title}>Title: {identificationInfo.title}</h2>
          <p className={styles.description}>{identificationInfo.description}</p>
        </div>
      )}

      {identificationDetails && (
        <div>
          <h3>Questions and Correct Answers</h3>
          <ul className={styles.questionsList}>
            {identificationDetails.questions.map((qa, index) => (
              <li key={qa.identificationqaID} className={styles.questionItem}>
                <p className={styles.questionText}>
                  <strong className={styles.title}>
                    Question {index + 1}:
                  </strong>{" "}
                  {qa.question}
                </p>
                <p className={styles.correctAnswer}>
                  <strong className={styles.description}>
                    Correct Answer:
                  </strong>{" "}
                  {qa.correct_answer}
                </p>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Identificationanswers;
