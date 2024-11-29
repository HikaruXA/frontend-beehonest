import React from "react";
import styles from "./failed.module.css";

const Failed = () => {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Expired or Invalid token</h2>
        <div className={styles.squarecontainer}>
          <img src="/logo/failed.png" alt="Previous" />
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

export default Failed;
