import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import SideNav from "../../../components/sidenav/Sidenav";
import EducatorsDisplay from "../../courses/educators/display/Educatorsdisplay";
import EducatorAssessment from "../../assessments/educators/Educatorsassessment";
import CreateCourse from "../../courses/educators/create/Createcourse";
import CreateIdentification from "../../identification/educators/create/Createidentification";
import Profile from "../../profile/Profile";
import CreateQuiz from "../../quizzes/educators/create/Createquiz"; // Assuming this import is needed
import styles from "./educatorlayout.module.css";

function EducatorLayout() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate to landing page

  // Initialize userID as null
  const [userID, setUserID] = useState(null);

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
      navigate("/login"); // Redirect to a login page or handle appropriately
    }
  }, [location.state, navigate]);

  const [selectedCourseID, setSelectedCourseID] = useState(null);
  const [currentView, setCurrentView] = useState("courses");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false); // Track if creating a quiz
  const [isSidenavVisible, setIsSidenavVisible] = useState(false); // State for sidenav visibility
  const logo = "path/to/your/logo.png"; // Path to the logo image

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Profile", icon: "👤" },
    { name: "Logout", icon: "🚪" },
  ];

  const handleCardClick = (courseID) => {
    setSelectedCourseID(courseID);
    setCurrentView("assessment");
  };

  const handleAddCourseClick = () => {
    setCurrentView("createCourse");
  };

  const handleCreateIdentificationClick = () => {
    setCurrentView("createIdentification");
  };

  const handleCourseCreated = () => {
    setCurrentView("courses");
    setSelectedCourseID(null);
  };

  const handleIdentificationCreated = () => {
    setCurrentView("assessment");
  };

  const handleQuizCreated = () => {
    setIsCreatingQuiz(false); // Reset quiz creation state after a quiz is created
    setCurrentView("assessment"); // Return to assessment view
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userID"); // Clear userID from localStorage on logout
    navigate("/"); // Redirect to the landing page
  };

  const handleMenuClick = (item) => {
    switch (item.name) {
      case "Profile":
        setCurrentView("profile"); // Set currentView to profile
        break;
      case "Dashboard":
        setCurrentView("courses");
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

  // Ensure that userID is not null before rendering dependent components
  if (userID === null) {
    return null; // You could return a loading indicator here if desired
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

        {currentView === "createCourse" && (
          <CreateCourse userID={userID} onCourseCreated={handleCourseCreated} />
        )}
        {currentView === "createIdentification" && (
          <CreateIdentification
            userID={userID}
            courseID={selectedCourseID}
            onIdentificationCreated={handleIdentificationCreated}
          />
        )}
        {currentView === "assessment" && selectedCourseID && (
          <EducatorAssessment
            userID={userID}
            courseID={selectedCourseID}
            onCreateIdentification={handleCreateIdentificationClick}
            onCreateQuiz={() => setIsCreatingQuiz(true)} // Trigger quiz creation
          />
        )}
        {currentView === "courses" && (
          <EducatorsDisplay
            userID={userID}
            onCardClick={handleCardClick}
            onAddCourseClick={handleAddCourseClick}
          />
        )}
        {isCreatingQuiz && (
          <CreateQuiz
            userID={userID}
            courseID={selectedCourseID}
            onQuizCreated={handleQuizCreated} // Pass the handler for quiz creation
          />
        )}
        {currentView === "profile" && (
          <Profile userID={userID} /> // Pass userID as a prop to Profile
        )}
      </div>
    </div>
  );
}

export default EducatorLayout;
