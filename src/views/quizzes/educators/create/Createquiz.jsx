import React, { useState } from "react";
import styles from "./createquiz.module.css"; // Importing the CSS module

function Createquiz({ userID, courseID, onQuizCreated }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", choices: [{ choice: "", is_correct: "no" }] },
  ]);
  const [message, setMessage] = useState(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", choices: [{ choice: "", is_correct: "no" }] },
    ]);
  };

  const addChoice = (questionIndex) => {
    const updatedQuestions = questions.map((q, index) => {
      if (index === questionIndex) {
        return {
          ...q,
          choices: [...q.choices, { choice: "", is_correct: "no" }],
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const updatedChoices = q.choices.filter((_, ci) => ci !== choiceIndex);
        return { ...q, choices: updatedChoices };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, question: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleChoiceChange = (questionIndex, choiceIndex, value, isCorrect) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const updatedChoices = q.choices.map((c, ci) =>
          ci === choiceIndex
            ? { ...c, choice: value, is_correct: isCorrect || c.is_correct }
            : c
        );
        return { ...q, choices: updatedChoices };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  // Function to convert local time to UTC
  const convertToUTC = (localDateTime) => {
    const date = new Date(localDateTime);
    return date.toISOString(); // Converts the date to UTC in ISO format
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert the deadline to UTC before sending to the backend
    const deadlineUTC = convertToUTC(deadline);

    const mcqData = {
      userID,
      courseID,
      title: quizTitle,
      description: quizDescription,
      deadline_at: deadlineUTC, // Use the UTC deadline
      questions,
    };

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/createquiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mcqData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("Quiz created successfully!");
        onQuizCreated();
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while creating the quiz.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create a New Quiz</h1>
      {message && <p className={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.quizForm}>
        <div className={styles.quizInfoContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Quiz Title:</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Quiz Description:</label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className={styles.textarea}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Deadline:</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className={styles.questionContainer}>
            <h3 className={styles.subtitle}>Question {qIndex + 1}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Question:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className={styles.input}
                required
              />
            </div>

            {q.choices.map((choice, cIndex) => (
              <div key={cIndex} className={styles.choiceContainer}>
                <label className={styles.label}>Choice {cIndex + 1}:</label>
                <input
                  type="text"
                  value={choice.choice}
                  onChange={(e) =>
                    handleChoiceChange(qIndex, cIndex, e.target.value)
                  }
                  className={styles.input}
                  required
                />
                <label className={styles.label}>
                  Is Correct?
                  <select
                    value={choice.is_correct}
                    onChange={(e) =>
                      handleChoiceChange(
                        qIndex,
                        cIndex,
                        choice.choice,
                        e.target.value
                      )
                    }
                    className={styles.select}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => removeChoice(qIndex, cIndex)}
                  className={styles.removeButton}
                >
                  Remove Choice
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addChoice(qIndex)}
              className={styles.addButton}
            >
              Add Choice
            </button>
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
            Submit Quiz
          </button>
        </div>
      </form>
    </div>
  );
}

export default Createquiz;
