import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import styles from "./login.module.css";

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({
      ...loginInfo,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Redirect based on roleID
        if (result.roleID === "educator") {
          navigate("/Educatorlayout", { state: { userID: result.userID } });
        } else if (result.roleID === "student") {
          navigate("/studentlayout", { state: { userID: result.userID } });
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again later.");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgetpass"); // Navigate to /forgetpass
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Login</h2>
        <div className={styles.squarecontainer}>
          <img src="/logo/loginbg1.png" alt="Previous" />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className={styles.forgotPasswordContainer}>
          <p
            onClick={handleForgotPassword}
            className={styles.forgotPasswordLink}
          >
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
