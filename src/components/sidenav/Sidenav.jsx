import React from "react";
import styles from "./sidenav.module.css";

const SideNav = ({ menuItems, logo, onMenuItemClick, onClose }) => {
  const handleMenuItemClick = (item) => {
    // Check if the screen width is less than 768px (mobile devices)
    if (window.innerWidth <= 768) {
      // Close the sidenav after the menu item click
      onClose();
    }
    // Call the passed function to handle menu item click
    onMenuItemClick(item);
  };

  return (
    <div className={styles.sideNavContainer}>
      <div className={styles.logoContainer}>
        <img src="/logo/bee.svg" alt="Logo" className={styles.logo} />
      </div>
      {/* Close Button */}
      <button onClick={onClose} className={styles.closeButton}>
        ❌ {/* X icon for closing */}
      </button>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.navItem}>
              <button
                className={styles.navLink}
                onClick={() => handleMenuItemClick(item)} // Use the new handler
              >
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                <span className={styles.linkText}>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;
