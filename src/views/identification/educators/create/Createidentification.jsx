import React, { useState } from "react";
import styles from "./createidentification.module.css"; // Import the CSS module

function Createidentification({ userID, courseID, onIdentificationCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline_at, setDeadlineAt] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", correct_answer: "", case_sensitive: "no" },
  ]);
  const [message, setMessage] = useState(null);

  // Handle changes for question fields
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  // Add a new question
  const addQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      { question: "", correct_answer: "", case_sensitive: "no" },
    ]);
  };

  // Remove a question
  const removeQuestion = (questionIndex) => {
    const updatedQuestions = questions.filter(
      (_, index) => index !== questionIndex
    );
    setQuestions(updatedQuestions);
  };

  // Function to convert local time to UTC
  const convertToUTC = (localDateTime) => {
    const date = new Date(localDateTime);
    return date.toISOString(); // Converts the date to UTC in ISO format
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert the deadline to UTC before sending to the backend
    const deadlineUTC = convertToUTC(deadline_at);

    const identificationData = {
      userID,
      courseID,
      title,
      description,
      deadline_at: deadlineUTC, // Use the UTC deadline
      questions,
    };

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/createidentification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(identificationData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("Identification created successfully!");
        onIdentificationCreated();
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while creating the identification.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Identification</h1>
      {message && <p className={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Identification Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Identification Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Deadline:</label>
            <input
              type="datetime-local"
              value={deadline_at}
              onChange={(e) => setDeadlineAt(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        {questions.map((q, index) => (
          <div key={index} className={styles.questionContainer}>
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className={styles.removeButton}
            >
              Remove Question
            </button>
            <h3 className={styles.subtitle}>Question {index + 1}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Question:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(index, "question", e.target.value)
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Correct Answer:</label>
              <input
                type="text"
                value={q.correct_answer}
                onChange={(e) =>
                  handleQuestionChange(index, "correct_answer", e.target.value)
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Case Sensitive:</label>
              <select
                value={q.case_sensitive}
                onChange={(e) =>
                  handleQuestionChange(index, "case_sensitive", e.target.value)
                }
                className={styles.input}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className={styles.addButton}
        >
          Add Question
        </button>

        <div className={styles.submitContainer}>
          <button type="submit" className={styles.submitButton}>
            Create Identification
          </button>
        </div>
      </form>
    </div>
  );
}

export default Createidentification;
