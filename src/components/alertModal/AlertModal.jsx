// components/alertmodal/AlertModal.js
import React from "react";
import styles from "./AlertModal.module.css"; // Import your CSS for the modal

const AlertModal = ({ message, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Alert</h2>
        <p>{message}</p>
        <button onClick={onClose} className="button">
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
