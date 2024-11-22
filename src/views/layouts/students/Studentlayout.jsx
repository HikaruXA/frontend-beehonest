// Import necessary modules and components
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../../../components/sidenav/Sidenav";
import StudentDisplay from "../../courses/students/Studentsdisplay";
import StudentAssessment from "../../assessments/students/Studentassessment";
import Studentcheatingbehavior from "../../studentcheatingbehavior/Studentcheatingbehavior";
import Profile from "../../profile/Profile";
import styles from "./studentlayout.module.css";

function StudentLayout() {
  const navigate = useNavigate();

  // Initialize userID and state management
  const [userID, setUserID] = useState(null);
  const [selectedCourseID, setSelectedCourseID] = useState(null);
  const [currentView, setCurrentView] = useState("courses");
  const [isSidenavVisible, setIsSidenavVisible] = useState(false);
  const logo = "path/to/your/logo.png";

  // Menu items
  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Profile", icon: "👤" },
    { name: "Cheating Behaviors", icon: "📋" },
    { name: "Logout", icon: "🚪" },
  ];

  // Load userID from localStorage on component mount
  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");

    if (storedUserID) {
      setUserID(storedUserID);
    } else {
      // Redirect to login if no userID is found in localStorage
      navigate("/login");
    }
  }, [navigate]);

  // Handle course card click
  const handleCardClick = (courseID) => {
    setSelectedCourseID(courseID);
    setCurrentView("assessment");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userID");
    navigate("/");
  };

  // Handle menu item clicks
  const handleMenuClick = (item) => {
    switch (item.name) {
      case "Profile":
        setCurrentView("profile");
        break;
      case "Dashboard":
        setCurrentView("courses");
        break;
      case "Cheating Behaviors":
        setCurrentView("cheating");
        break;
      case "Logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Toggle sidenav visibility
  const toggleSidenav = () => {
    setIsSidenavVisible((prev) => !prev);
  };

  // Ensure userID is set before rendering dependent components
  if (userID === null) {
    return null;
  }

  return (
    <div
      className={`${styles.appContainer} ${
        isSidenavVisible ? styles.sidenavOpen : ""
      }`}
    >
      <div
        className={`${styles.sidenav} ${
          isSidenavVisible ? styles.visible : styles.hidden
        }`}
      >
        <SideNav
          menuItems={menuItems}
          logo={logo}
          onMenuItemClick={handleMenuClick}
          onClose={toggleSidenav}
        />
      </div>

      <div
        className={`${styles.content} ${
          isSidenavVisible ? styles.contentShifted : ""
        }`}
      >
        {/* Top Navigation */}
        <div className={styles.topNav}>
          <button onClick={toggleSidenav} className={styles.toggleButton}>
            {isSidenavVisible ? "❌" : "☰"}
          </button>
          <h2 className={styles.currentView}>
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </h2>
        </div>

        {currentView === "courses" && (
          <StudentDisplay userID={userID} onCardClick={handleCardClick} />
        )}

        {currentView === "assessment" && selectedCourseID && (
          <StudentAssessment userID={userID} courseID={selectedCourseID} />
        )}

        {currentView === "cheating" && (
          <Studentcheatingbehavior userID={userID} />
        )}

        {currentView === "profile" && <Profile userID={userID} />}
      </div>
    </div>
  );
}

export default StudentLayout;
