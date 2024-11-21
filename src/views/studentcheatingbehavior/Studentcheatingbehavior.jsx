import React, { useState, useEffect } from "react";
import styles from "./studentcheatingbehavior.module.css"; // Import your CSS module

function Studentcheatingbehavior({ userID }) {
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [mcqLogs, setMcqLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBehavior, setSelectedBehavior] = useState("All");
  const [userInfo, setUserInfo] = useState({
    firstname: "",
    lastname: "",
    profilepic: null,
    roleID: "",
  }); // State to store user info

  const [cheatingPage, setCheatingPage] = useState(0);
  const [mcqPage, setMcqPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
        );
        const data = await response.json();

        if (data.success) {
          const fetchedProfilePic = data.userInfo.profilepic
            ? `data:image/jpeg;base64,${data.userInfo.profilepic}`
            : null;

          setUserInfo({
            firstname: data.userInfo.firstname,
            lastname: data.userInfo.lastname,
            profilepic: fetchedProfilePic,
            roleID: data.userInfo.roleID || "",
          });
        } else {
          console.error("Error fetching user info:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchCheatingBehavior = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/usercheatingbehavior/${userID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user cheating behavior data");
        }
        const data = await response.json();
        setCheatingLogs(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchMcqBehavior = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/mcqusercheatingbehavior/${userID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch MCQ cheating behavior data");
        }
        const data = await response.json();
        setMcqLogs(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserInfo(),
        fetchCheatingBehavior(),
        fetchMcqBehavior(),
      ]);
      setLoading(false);
    };

    fetchData();
  }, [userID]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Utility function to format timestamps
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options).replace(",", "");
  };

  // Function to count behavior types
  const countBehaviors = (logs) => {
    const behaviorCount = {
      faceMovement: 0,
      multiplePeople: 0,
      shortcutKeys: 0,
      smartphone: 0,
      switchTabs: 0,
      noPerson: 0,
    };

    logs.forEach((log) => {
      switch (log.behaviorType) {
        case "Face Movement":
          behaviorCount.faceMovement += 1;
          break;
        case "Multiple People":
          behaviorCount.multiplePeople += 1;
          break;
        case "Shortcut Keys":
          behaviorCount.shortcutKeys += 1;
          break;
        case "Smartphone":
          behaviorCount.smartphone += 1;
          break;
        case "Switch Tabs":
          behaviorCount.switchTabs += 1;
          break;
        case "No Person":
          behaviorCount.noPerson += 1;
          break;
        default:
          break;
      }
    });

    return behaviorCount;
  };

  const cheatingBehaviorCounts = countBehaviors(cheatingLogs);
  const mcqBehaviorCounts = countBehaviors(mcqLogs);

  const totalBehaviorCounts = {
    faceMovement:
      cheatingBehaviorCounts.faceMovement + mcqBehaviorCounts.faceMovement,
    multiplePeople:
      cheatingBehaviorCounts.multiplePeople + mcqBehaviorCounts.multiplePeople,
    shortcutKeys:
      cheatingBehaviorCounts.shortcutKeys + mcqBehaviorCounts.shortcutKeys,
    smartphone:
      cheatingBehaviorCounts.smartphone + mcqBehaviorCounts.smartphone,
    switchTabs:
      cheatingBehaviorCounts.switchTabs + mcqBehaviorCounts.switchTabs,
    noPerson: cheatingBehaviorCounts.noPerson + mcqBehaviorCounts.noPerson,
  };

  const filterLogs = (logs) => {
    return selectedBehavior === "All"
      ? logs
      : logs.filter((log) => log.behaviorType === selectedBehavior);
  };

  const filteredCheatingLogs = filterLogs(cheatingLogs);
  const filteredMcqLogs = filterLogs(mcqLogs);

  const cheatingStartIndex = cheatingPage * rowsPerPage;
  const cheatingEndIndex = cheatingStartIndex + rowsPerPage;
  const mcqStartIndex = mcqPage * rowsPerPage;
  const mcqEndIndex = mcqStartIndex + rowsPerPage;

  // Calculate total pages for cheating and MCQ logs
  const totalCheatingPages = Math.ceil(
    filteredCheatingLogs.length / rowsPerPage
  );
  const totalMcqPages = Math.ceil(filteredMcqLogs.length / rowsPerPage);

  return (
    <div>
      <div className={styles.userInfo}>
        <div className={styles.profilePicContainer}>
          {userInfo.profilepic ? (
            <img
              src={userInfo.profilepic}
              alt="Profile"
              className={styles.profilePic}
            />
          ) : (
            <div className={styles.defaultPic}>No Image</div>
          )}
        </div>
        <div className={styles.fullname}>
          <p>First Name: {userInfo.firstname}</p>
          <p>Last Name: {userInfo.lastname}</p>
        </div>
      </div>

      {/* Behavior Cards */}
      <div className={styles.behaviorCardsContainer}>
        <div className={styles.behaviorCard}>
          <p className={styles.total}>{totalBehaviorCounts.faceMovement}</p>
          <p className={styles.type}>Face Movement</p>
        </div>
        <div className={styles.behaviorCard}>
          <p className={styles.total}>{totalBehaviorCounts.multiplePeople}</p>
          <p className={styles.type}>Multiple People</p>
        </div>
        <div className={styles.behaviorCard}>
          <p className={styles.total}>{totalBehaviorCounts.shortcutKeys}</p>
          <p className={styles.type}>Shortcut Keys</p>
        </div>
        <div className={styles.behaviorCard}>
          <p className={styles.total}>{totalBehaviorCounts.smartphone}</p>
          <p className={styles.type}>Smartphone</p>
        </div>
        <div className={styles.behaviorCard}>
          <p className={styles.total}>{totalBehaviorCounts.switchTabs}</p>
          <p className={styles.type}>Switch Tabs</p>
        </div>
        <div className={styles.behaviorCard}>
          <p className={styles.total}> {totalBehaviorCounts.noPerson}</p>
          <p className={styles.type}>No Person</p>
        </div>
      </div>

      {/* Behavior filter dropdown */}
      <label htmlFor="behaviorFilter">Filter by Behavior: </label>
      <select
        id="behaviorFilter"
        value={selectedBehavior}
        onChange={(e) => setSelectedBehavior(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Face Movement">Face Movement</option>
        <option value="Multiple People">Multiple People</option>
        <option value="Shortcut Keys">Shortcut Keys</option>
        <option value="Smartphone">Smartphone</option>
        <option value="Switch Tabs">Switch Tabs</option>
        <option value="No Person">No Person</option>
      </select>

      {/* First Table: Display Cheating Behavior Logs */}
      <h3>Cheating Behavior Logs</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Course Title</th>
            <th>Identification Title</th>
            <th>Behavior Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredCheatingLogs
            .slice(cheatingStartIndex, cheatingEndIndex)
            .map((log, index) => (
              <tr key={index}>
                <td>{cheatingStartIndex + index + 1}</td>
                <td>{log.courseTitle}</td>
                <td>{log.identificationTitle}</td>
                <td>{log.behaviorType}</td>
                <td>{formatTimestamp(log.timestamp)}</td>{" "}
                {/* Format the timestamp */}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination for Cheating Behavior Logs */}
      <div className={styles.nextandprevious}>
        <button
          className={styles.paginationButton}
          onClick={() => setCheatingPage(cheatingPage - 1)}
          disabled={cheatingPage === 0}
        >
          <img
            src="/logo/previous.svg"
            alt="Previous"
            className={styles.paginationIcon}
          />
        </button>
        <span>
          Page {cheatingPage + 1} of {totalCheatingPages}
        </span>
        <button
          className={styles.paginationButton}
          onClick={() => setCheatingPage(cheatingPage + 1)}
          disabled={cheatingEndIndex >= filteredCheatingLogs.length}
        >
          <img
            src="/logo/next.svg"
            alt="Next"
            className={styles.paginationIcon}
          />
        </button>
      </div>

      {/* Second Table: Display MCQ Details */}
      <h3>MCQ Cheating Behavior Logs</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Course Title</th>
            <th>MCQ Title</th>
            <th>MCQ Description</th>
            <th>Behavior Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredMcqLogs
            .slice(mcqStartIndex, mcqEndIndex)
            .map((log, index) => (
              <tr key={index}>
                <td>{mcqStartIndex + index + 1}</td>
                <td>{log.courseTitle}</td>
                <td>{log.mcqTitle}</td>
                <td>{log.mcqDescription}</td>
                <td>{log.behaviorType}</td>
                <td>{formatTimestamp(log.timestamp)}</td>{" "}
                {/* Format the timestamp */}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination for MCQ Cheating Behavior Logs */}
      <div className={styles.nextandprevious}>
        <button
          className={styles.paginationButton}
          onClick={() => setMcqPage(mcqPage - 1)}
          disabled={mcqPage === 0}
        >
          <img
            src="/logo/previous.svg"
            alt="Previous"
            className={styles.paginationIcon}
          />
        </button>
        <span>
          Page {mcqPage + 1} of {totalMcqPages}
        </span>
        <button
          className={styles.paginationButton}
          onClick={() => setMcqPage(mcqPage + 1)}
          disabled={mcqEndIndex >= filteredMcqLogs.length}
        >
          <img
            src="/logo/next.svg"
            alt="Next"
            className={styles.paginationIcon}
          />
        </button>
      </div>
    </div>
  );
}

export default Studentcheatingbehavior;
