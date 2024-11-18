import React from "react";
import styles from "./sidenav.module.css";

const SideNav = ({ menuItems, logo, onMenuItemClick, onClose }) => {
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
                onClick={() => onMenuItemClick(item)} // Call the passed function
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
