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
          <li>
            The system will monitor for the following suspicious behaviors:
          </li>
          <li>
            <strong>Detected Cheating Indicators:</strong>
            <ul>
              <li>Not looking directly at the front/screen</li>
              <li>Multiple people detected in camera view</li>
              <li>Unauthorized shortcut key usage</li>
              <li>Unexpected tab switching</li>
              <li>No person detected in camera view</li>
              <li>Smartphone or additional device use</li>
            </ul>
          </li>
          <li>
            <strong>Important:</strong> The website can verify the identity of
            the assessment taker through facial recognition.
          </li>
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
