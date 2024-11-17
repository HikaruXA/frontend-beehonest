import React, { useState, useEffect } from "react";
import styles from "./identificationdisplay.module.css"; // Import the CSS module
import Identificationdetection from "../../detection/Identificationdetection";

function Identificationdisplay({ identificationID, courseID, userID }) {
  const [identificationDetails, setIdentificationDetails] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [isVisible, setIsVisible] = useState(true); // Track visibility state

  // Fetch identification details when the component is mounted
  useEffect(() => {
    if (identificationID) {
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
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching identification details");
          setLoading(false);
        });
    }
  }, [identificationID]);

  // Handle user input change
  const handleInputChange = (event, questionId) => {
    const { value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    let correctAnswers = 0;

    // Compare user answers with the correct answers
    identificationDetails.questions.forEach((qa) => {
      const userAnswer = userAnswers[qa.identificationqaID] || "";
      const correctAnswer = qa.correct_answer || "";
      const isCorrect =
        qa.case_sensitive === "yes"
          ? userAnswer === correctAnswer
          : userAnswer.toLowerCase() === correctAnswer.toLowerCase();

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const totalQuestions = identificationDetails.questions.length;
    const calculatedScore = `${correctAnswers}/${totalQuestions}`;
    setScore(calculatedScore);

    // Submit score to backend
    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/submit-grade",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identificationID,
            userID,
            score: calculatedScore,
          }),
        }
      );

      const responseData = await response.json();
      if (responseData.success) {
        // Display score briefly, then redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/studentlayout";
        }, 3000); // 3-second delay
      } else {
        console.error("Failed to submit score:", responseData.message);
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  // Handle moving to the next question
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  // Render the current question
  const renderCurrentQuestion = () => {
    const currentQuestion =
      identificationDetails.questions[currentQuestionIndex];
    return (
      <div>
        <p className={styles.questionText}>{currentQuestion.question}</p>
        <p className={styles.caseSensitiveInfo}>
          <strong>Case Sensitive:</strong>{" "}
          {currentQuestion.case_sensitive === "yes" ? "Yes" : "No"}
        </p>
        <input
          type="text"
          placeholder="Your answer"
          value={userAnswers[currentQuestion.identificationqaID] || ""}
          onChange={(event) =>
            handleInputChange(event, currentQuestion.identificationqaID)
          }
          className={styles.answerInput}
        />
      </div>
    );
  };

  // Handle visibility change
  const handleVisibilityChange = () => {
    setIsVisible(!document.hidden);
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1>Identification Assessment Display</h1>
      {loading && (
        <p className={styles.loading}>Loading identification details...</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {identificationDetails && (
        <div>
          <h3>
            Question {currentQuestionIndex + 1} of{" "}
            {identificationDetails.questions.length}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Render the current question */}
            {renderCurrentQuestion()}

            {/* Display Next button if it's not the last question */}
            {currentQuestionIndex <
              identificationDetails.questions.length - 1 && (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextQuestion}
                disabled={
                  submitted ||
                  !userAnswers[
                    identificationDetails.questions[currentQuestionIndex]
                      .identificationqaID
                  ]
                }
              >
                Next
              </button>
            )}

            {/* Display Submit button on the last question */}
            {currentQuestionIndex ===
              identificationDetails.questions.length - 1 &&
              !submitted && (
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={
                    !userAnswers[
                      identificationDetails.questions[currentQuestionIndex]
                        .identificationqaID
                    ]
                  }
                >
                  Submit Answers
                </button>
              )}

            {submitted && <p>Your Score: {score}</p>}
          </form>
        </div>
      )}

      {/* Floating Identificationdetection component */}
      <div className={styles.floatingDetection}>
        <Identificationdetection
          identificationID={identificationID}
          userID={userID}
          isVisible={isVisible} // Pass the visibility state to the Identificationdetection component
        />
      </div>
    </div>
  );
}

export default Identificationdisplay;
