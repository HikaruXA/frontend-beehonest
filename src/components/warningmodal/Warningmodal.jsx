import React from "react";
import styles from "./warningmodal.module.css";

function Warningmodal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Cheating Behavior Detection</h2>
        <p>
          For this assessment, camera monitoring is required to detect potential
          academic dishonesty.
        </p>
        <ul>
          <li>
            Your webcam must be turned on throughout the entire assessment
          </li>
          <li>The system will monitor for suspicious behaviors</li>
          <li>Any detected irregularities may result in academic penalties</li>
        </ul>
        <div className={styles.modalButtons}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            I Understand, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default Warningmodal;