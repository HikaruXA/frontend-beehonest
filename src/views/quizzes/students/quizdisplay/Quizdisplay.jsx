import React, { useState, useEffect } from "react";
import styles from "./quizdisplay.module.css"; // Import the CSS module
import Quizdetection from "../../detection/Quizdetection"; // Import the Quizdetection component

function QuizDisplay({ mcqID, courseID, userID, onClose }) {
  const [mcqDetails, setMcqDetails] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [userAnswers, setUserAnswers] = useState({}); // Track user-selected answers
  const [submitted, setSubmitted] = useState(false); // Track if the quiz is submitted
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(""); // Store the calculated score
  const [isVisible, setIsVisible] = useState(true); // New state to track visibility

  // Fetch MCQ quiz details when the component is mounted
  useEffect(() => {
    if (mcqID) {
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/get-mcq-questions?mcqID=${mcqID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Fetched MCQ details:", data); // Log the full response
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

  // Handle user answer selection
  const handleAnswerChange = (questionId, choiceId) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: choiceId,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    let correctAnswers = 0;

    // Count correct answers based on user selections
    mcqDetails.forEach((question) => {
      const correctChoice = question.choices.find(
        (choice) => choice.is_correct === "yes"
      );
      if (
        correctChoice &&
        userAnswers[question.mcqquestionID] === correctChoice.mcqchoicesID
      ) {
        correctAnswers++;
      }
    });

    // Calculate score as "correctAnswers / totalQuestions"
    const totalQuestions = mcqDetails.length;
    const calculatedScore = `${correctAnswers}/${totalQuestions}`;
    setScore(calculatedScore);

    // Send the score to the backend
    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/submit-mcq-grade",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mcqID,
            userID,
            score: calculatedScore, // Send the score in "correct/total" format
          }),
        }
      );

      const responseData = await response.json();
      if (responseData.success) {
        console.log("Score submitted successfully");

        // Add a timer before redirecting or reloading the page
        setTimeout(() => {
          window.location.reload(); // Force reload the page
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
    const currentQuestion = mcqDetails[currentQuestionIndex];
    return (
      <div>
        <p className={styles.question}>
          <strong>Question {currentQuestionIndex + 1}:</strong>{" "}
          {currentQuestion.question}
        </p>
        {/* Display the choices with radio buttons */}
        <ul className={styles.choicesList}>
          {currentQuestion.choices.map((choice) => (
            <li key={choice.mcqchoicesID}>
              <label>
                <input
                  type="radio"
                  name={`question-${currentQuestion.mcqquestionID}`} // Radio buttons group by question ID
                  value={choice.mcqchoicesID}
                  onChange={() =>
                    handleAnswerChange(
                      currentQuestion.mcqquestionID,
                      choice.mcqchoicesID
                    )
                  }
                  disabled={submitted} // Disable selection after form submission
                />
                {choice.choice}
              </label>
            </li>
          ))}
        </ul>
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
      <h1>MCQ Quiz Display</h1>

      {loading && <p className={styles.loading}>Loading MCQ details...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {mcqDetails && (
        <div>
          <h3>
            Question {currentQuestionIndex + 1} of {mcqDetails.length}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Render the current question */}
            {renderCurrentQuestion()}

            {/* Display the Next button if it's not the last question */}
            {currentQuestionIndex < mcqDetails.length - 1 && (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextQuestion}
                disabled={
                  submitted ||
                  !userAnswers[mcqDetails[currentQuestionIndex].mcqquestionID]
                } // Disable if no answer selected
              >
                Next
              </button>
            )}

            {/* Display the Submit button on the last question */}
            {currentQuestionIndex === mcqDetails.length - 1 && !submitted && (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  !userAnswers[mcqDetails[currentQuestionIndex].mcqquestionID]
                } // Disable if no answer selected
              >
                Submit Quiz
              </button>
            )}

            {submitted && <p>Your Score: {score}</p>}
          </form>
        </div>
      )}

      {/* Floating Quizdetection component with visibility state */}
      <div className={styles.floatingDetection}>
        <Quizdetection mcqID={mcqID} userID={userID} isVisible={isVisible} />
      </div>
    </div>
  );
}

export default QuizDisplay;
