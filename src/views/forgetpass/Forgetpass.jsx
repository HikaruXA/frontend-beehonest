import React, { useState } from "react";
import styles from "./forgetpass.module.css";

function Forgetpass() {
  const [step, setStep] = useState(1); // To track the current step
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Request a password reset token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setStep(2); // Proceed to next step to enter token
      }
    } catch (error) {
      setMessage("Error requesting password reset token.");
      console.error("Error:", error);
    }
  };

  // Step 2: Verify the reset token and proceed to reset the password
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/verify-reset-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, resetToken }),
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setStep(3); // Proceed to next step to reset password
      }
    } catch (error) {
      setMessage("Error verifying the reset token.");
      console.error("Error:", error);
    }
  };

  // Step 3: Reset the password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, resetToken, newPassword }),
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setStep(4); // Step 4: Password reset success
      }
    } catch (error) {
      setMessage("Error resetting the password.");
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>Forgot Password</h1>
        <div className={styles.squarecontainer}>
          <img src="/logo/forgetpassword.png" alt="Previous" />
        </div>
        {message && <p className={styles.message}>{message}</p>}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className={styles.form}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.submitButton}>
              Request Reset Token
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyToken} className={styles.form}>
            <label>Reset Token:</label>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.submitButton}>
              Verify Token
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={styles.input}
            />
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.submitButton}>
              Reset Password
            </button>
          </form>
        )}

        {step === 4 && <p>Password reset successful! You can now log in.</p>}
      </div>
    </div>
  );
}

export default Forgetpass;
