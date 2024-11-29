import React from "react";
import styles from "./verify.module.css";

const Verify = () => {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.squarecontainer}>
          <img src="/logo/verify.png" alt="Previous" />
        </div>
        <p className={styles.message}>
          <a href="https://beehonest.netlify.app/login" className={styles.link}>
            Click here to login your account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Verify;
