import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../../../components/sidenav/Sidenav";
import EducatorsDisplay from "../../courses/educators/display/Educatorsdisplay";
import EducatorAssessment from "../../assessments/educators/Educatorsassessment";
import CreateCourse from "../../courses/educators/create/Createcourse";
import CreateIdentification from "../../identification/educators/create/Createidentification";
import Profile from "../../profile/Profile";
import CreateQuiz from "../../quizzes/educators/create/Createquiz";
import styles from "./educatorlayout.module.css";

function EducatorLayout() {
  const navigate = useNavigate();

  // Initialize userID state
  const [userID, setUserID] = useState(null);
  const [selectedCourseID, setSelectedCourseID] = useState(null);
  const [currentView, setCurrentView] = useState("courses");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isSidenavVisible, setIsSidenavVisible] = useState(false);
  const logo = "path/to/your/logo.png";

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Profile", icon: "👤" },
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
    setIsCreatingQuiz(false);
    setCurrentView("assessment");
  };

  // Handle logout and clear userID from localStorage
  const handleLogout = () => {
    localStorage.removeItem("userID");
    navigate("/");
  };

  const handleMenuClick = (item) => {
    switch (item.name) {
      case "Profile":
        setCurrentView("profile");
        break;
      case "Dashboard":
        setCurrentView("courses");
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

  // Ensure that userID is set before rendering dependent components
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
            onCreateQuiz={() => setIsCreatingQuiz(true)}
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
            onQuizCreated={handleQuizCreated}
          />
        )}
        {currentView === "profile" && <Profile userID={userID} />}
      </div>
    </div>
  );
}

export default EducatorLayout;
