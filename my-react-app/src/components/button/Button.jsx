import React from "react";
import styles from "./Button.module.css"; // Importing CSS module

const Button = ({ variant = "primary", label, onClick, disabled }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
