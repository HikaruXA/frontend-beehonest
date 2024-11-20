import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideNav from "../../../components/sidenav/Sidenav";
import StudentDisplay from "../../courses/students/Studentsdisplay";
import StudentAssessment from "../../assessments/students/Studentassessment";
import Studentcheatingbehavior from "../../studentcheatingbehavior/Studentcheatingbehavior";
import Profile from "../../profile/Profile";
import styles from "./studentlayout.module.css";
import axios from "axios"; // Import axios for making HTTP requests

function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate to landing page

  // Initialize userID and roleID as null
  const [userID, setUserID] = useState(null);
  const [roleID, setRoleID] = useState(null); // Track the user's role
  const [selectedCourseID, setSelectedCourseID] = useState(null); // Track selected course
  const [currentView, setCurrentView] = useState("courses"); // Track current view (either 'display' or 'assessment')
  const [isSidenavVisible, setIsSidenavVisible] = useState(false); // State for sidenav visibility
  const logo = "path/to/your/logo.png"; // Replace with the actual path to your logo

  // Menu items
  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Profile", icon: "👤" },
    { name: "Cheating Behaviors", icon: "📋" },
    { name: "Logout", icon: "🚪" },
  ];

  useEffect(() => {
    // Check for userID in localStorage or location state
    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
    } else if (location.state?.userID) {
      localStorage.setItem("userID", location.state.userID);
      setUserID(location.state.userID);
    } else {
      // Redirect or handle the case when userID is not available
      navigate("/login"); // Redirect to login page if userID is not found
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Only fetch the role if the userID is set
    if (userID !== null) {
      axios
        .get(`/user/${userID}`) // Make a request to the /user/:userID endpoint
        .then((response) => {
          const { userInfo } = response.data;
          setRoleID(userInfo.roleID); // Set the roleID from the response

          // If roleID is "educator", redirect to login page
          if (userInfo.roleID === "educator") {
            localStorage.removeItem("userID");
            navigate("/login"); // Redirect if the user is an educator
          }
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
          localStorage.removeItem("userID");
          navigate("/login"); // Navigate to login on error
        });
    }
  }, [userID, navigate]); // Run this effect when userID changes

  // Function to handle course card click (to view assessments for the course)
  const handleCardClick = (courseID) => {
    setSelectedCourseID(courseID); // Set selected course
    setCurrentView("assessment"); // Switch to assessment view
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userID"); // Clear userID from localStorage on logout
    navigate("/"); // Redirect to the landing page
  };

  // Handle menu item clicks
  const handleMenuClick = (item) => {
    switch (item.name) {
      case "Profile":
        setCurrentView("profile"); // Set currentView to profile
        break;
      case "Dashboard":
        setCurrentView("courses"); // Set currentView to dashboard (course display)
        break;
      case "Cheating Behaviors":
        setCurrentView("cheating"); // Set currentView to cheating behaviors
        break;
      case "Logout":
        handleLogout(); // Handle logout click
        break;
      default:
        break;
    }
    // Removed setIsSidenavVisible(false); to keep the sidenav open
  };

  // Toggle sidenav visibility
  const toggleSidenav = () => {
    setIsSidenavVisible((prev) => !prev); // Toggle sidenav visibility
  };

  // Ensure that userID and roleID are both available before rendering
  if (userID === null || roleID === null) {
    return <div>Loading...</div>; // Render loading indicator until both are available
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
          onClose={toggleSidenav} // Pass the close handler
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
            {isSidenavVisible ? "❌" : "☰"}{" "}
            {/* Change icon based on visibility */}
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
          <Studentcheatingbehavior userID={userID} /> // Render cheating behavior component
        )}

        {currentView === "profile" && (
          <Profile userID={userID} /> // Pass userID as a prop to Profile
        )}
      </div>
    </div>
  );
}

export default StudentLayout;
