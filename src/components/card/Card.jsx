import React from "react";
import styles from "./card.module.css"; // Importing CSS module

const Card = ({
  title,
  code,
  image,
  description,
  onEditClick,
  onDeleteClick,
  showEdit = true, // Default to true
  showDelete = true, // Default to true
}) => {
  return (
    <div className={styles.card}>
      {image && <img src={image} alt={title} className={styles.cardImage} />}
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardCode}>{code}</p>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardActions}>
        {/* Conditionally render the Edit button */}
        {showEdit && (
          <button
            className={styles.button} // Ensure this class exists in your CSS module
            onClick={onEditClick}
          >
            Edit Course
          </button>
        )}
        {/* Conditionally render the Delete button */}
        {showDelete && (
          <button
            className={`${styles.button} ${styles.deleteButton}`}
            onClick={onDeleteClick}
          >
            Delete Course
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
