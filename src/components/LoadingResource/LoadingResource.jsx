import React from "react";
import styles from "./loadingresource.module.css";

function LoadingResource() {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading Detection Models...</p>
      </div>
    </div>
  );
}

export default LoadingResource;
