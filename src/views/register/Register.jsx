import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Termsandcondition from "../../components/termsandcondition/Termsandcondition";
import AlertModal from "../../components/alertModal/AlertModal";
import styles from "./register.module.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleID, setRoleID] = useState("student");
  const [profilepic, setProfilepic] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [acceptedTerms, setAcceptedTerms] = useState(false); // State for the checkbox
  const [modalMessage, setModalMessage] = useState(""); // State for modal message
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilepic(reader.result.split(",")[1]); // Base64 encoded string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setModalMessage("You must accept the terms and conditions to register.");
      setModalVisible(true);
      return;
    }

    const formData = {
      email,
      password,
      firstname: firstName,
      lastname: lastName,
      roleID,
      profilepic, // Base64 encoded image
    };

    try {
      const response = await fetch(
        "https://backend-bhonest-a110b63abc0c.herokuapp.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setModalMessage(
          "Registration successful! Please verify your email account at Gmail."
        );
        setModalVisible(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRoleID("student");
        setProfilepic(null);
        setFileInputKey(Date.now());
        setAcceptedTerms(false); // Reset checkbox state

        // Navigate to the Landing page
        navigate("/"); // Redirect to the landing page
      } else {
        setModalMessage(data.message || "Registration failed!");
        setModalVisible(true);
      }
      console.log(data);
    } catch (error) {
      setModalMessage("Error: " + error.message);
      setModalVisible(true);
      console.error("Error:", error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Create an Account</h2>
        <div className={styles.squarecontainer}>
          <img src="/logo/loginbg.png" alt="Previous" />
        </div>
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="firstname" className={styles.label}>
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lastname" className={styles.label}>
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="roleID" className={styles.label}>
              Role
            </label>
            <select
              name="roleID"
              value={roleID}
              onChange={(e) => setRoleID(e.target.value)}
              className={styles.select}
            >
              <option value="student">Student</option>
              <option value="educator">Educator</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="profilepic" className={styles.label}>
              Profile Picture
            </label>
            <input
              type="file"
              name="profilepic"
              onChange={handleFileChange}
              accept="image/*"
              className={styles.inputFile}
              key={fileInputKey} // To reset file input
            />
          </div>

          <div className={styles.inputcheckbox}>
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className={styles.checkbox}
              required
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              I accept the{" "}
              <a href="/termsandconditions">terms and conditions</a>.
            </label>
          </div>

          <button type="submit" className={styles.submitButton}>
            Register
          </button>
        </form>
      </div>
      {isModalVisible && (
        <AlertModal message={modalMessage} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Register;
