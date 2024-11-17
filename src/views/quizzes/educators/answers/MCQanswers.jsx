import React, { useState, useEffect } from "react";
import jsPDF from "jspdf"; // Import jsPDF
import styles from "./MCQanswers.module.css"; // Import styles

function MCQanswers({ mcqID }) {
  const [mcqDetails, setMcqDetails] = useState(null);
  const [mcqInfo, setMcqInfo] = useState(null); // State for title and description
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch MCQ title and description when the component is mounted
  useEffect(() => {
    if (mcqID) {
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-mcq-title-description?mcqID=${mcqID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMcqInfo(data); // Store the title and description
          } else {
            setError("Failed to load MCQ title and description");
          }
        })
        .catch((err) => {
          console.error("Error fetching MCQ title and description:", err);
          setError("Error fetching MCQ title and description");
        });
    }
  }, [mcqID]);

  // Fetch MCQ quiz details
  useEffect(() => {
    if (mcqID) {
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-mcq-questions?mcqID=${mcqID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Fetched MCQ answers:", data); // Log the full response
            setMcqDetails(data.questions); // Store the MCQ details
          } else {
            setError("Failed to load MCQ details");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching MCQ details:", err);
          setError("Error fetching MCQ details");
          setLoading(false);
        });
    }
  }, [mcqID]);

  // Function to generate PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);

    // Center the title
    const title = "MCQ Answer Key";
    const titleWidth = doc.getTextWidth(title);
    const xCenter = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xCenter, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Add MCQ title and description
    if (mcqInfo) {
      doc.text(`Title: ${mcqInfo.title}`, 14, 30);
      doc.text(`Description: ${mcqInfo.description}`, 14, 40);
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);
    }

    if (mcqDetails) {
      mcqDetails.forEach((question, index) => {
        const correctChoice = question.choices.find(
          (choice) => choice.is_correct === "yes"
        );
        const correctChoiceIndex = question.choices.findIndex(
          (choice) => choice.is_correct === "yes"
        );

        // Add question number and text
        doc.setFont("helvetica", "bold");
        doc.text(
          `Question ${index + 1}: ${question.question}`,
          14,
          50 + index * 60
        );
        doc.setFont("helvetica", "normal");

        // Add choices heading
        doc.text("Choices:", 14, 60 + index * 60);

        // Add choices as A, B, C, ...
        question.choices.forEach((choice, choiceIndex) => {
          const answerText = `${String.fromCharCode(65 + choiceIndex)}. ${
            choice.choice
          }`; // Converts 0, 1, 2... to A, B, C...
          doc.text(answerText, 20, 70 + index * 60 + choiceIndex * 10);
        });

        // Add correct answer with letter
        doc.setFont("helvetica", "bold");
        doc.text(
          `Correct Answer: ${String.fromCharCode(65 + correctChoiceIndex)}. ${
            correctChoice.choice
          }`,
          14,
          70 + index * 60 + question.choices.length * 10
        );
        doc.setFont("helvetica", "normal");

        // Add a horizontal line
        doc.setLineWidth(0.5);
        doc.line(
          10,
          75 + index * 60 + question.choices.length * 10,
          200,
          75 + index * 60 + question.choices.length * 10
        ); // Horizontal line
      });
    }

    // Save the PDF with the MCQ title as the file name
    const fileName = mcqInfo.title
      ? `${mcqInfo.title}.pdf`
      : "MCQ_Answer_Key.pdf";
    doc.save(fileName);
  };

  // Render the MCQ answers
  const renderMCQAnswers = () => {
    return mcqDetails.map((question, index) => {
      const correctChoice = question.choices.find(
        (choice) => choice.is_correct === "yes"
      );
      const correctChoiceIndex = question.choices.findIndex(
        (choice) => choice.is_correct === "yes"
      );

      return (
        <div key={question.mcqquestionID} className={styles.questionBlock}>
          <p className={styles.question}>
            <strong>Question {index + 1}: </strong> {question.question}
          </p>
          <p className={styles.description}>Choices:</p>
          <ul className={styles.choicesList}>
            {question.choices.map((choice, choiceIndex) => (
              <li
                key={choice.mcqchoicesID}
                className={
                  choice.is_correct === "yes"
                    ? styles.correctChoice
                    : styles.incorrectChoice
                }
              >
                {String.fromCharCode(65 + choiceIndex)}. {choice.choice}
              </li>
            ))}
          </ul>
          <p className={styles.correctAnswer}>
            <strong>
              Correct Answer: {String.fromCharCode(65 + correctChoiceIndex)}.{" "}
              {correctChoice.choice}
            </strong>
          </p>
          <hr />
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>MCQ Answer Key</h1>
        <button onClick={downloadPDF} className={styles.downloadButton}>
          Download PDF
        </button>
      </div>

      {loading && <p className={styles.loading}>Loading MCQ details...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {mcqInfo && (
        <div>
          <h2 className={styles.title}>Title: {mcqInfo.title}</h2>
          <p className={styles.description}>{mcqInfo.description}</p>
        </div>
      )}

      {mcqDetails && <div>{renderMCQAnswers()}</div>}
    </div>
  );
}

export default MCQanswers;
