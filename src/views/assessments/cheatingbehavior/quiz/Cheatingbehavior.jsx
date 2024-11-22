import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./cheatingbehavior.module.css";

// Register the components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Cheatingbehavior({ userID, mcqID }) {
  // User data state
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    profilepic: "",
  });

  const [cheatingBehaviors, setCheatingBehaviors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  // Fetch user data based on userID
  useEffect(() => {
    if (userID) {
      fetch(`https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserData(data.userInfo); // Set user data
          } else {
            setError(data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setError("Error fetching user data");
        });
    } else {
      setError("User ID is required");
    }
  }, [userID]);

  // Fetch cheating behaviors
  useEffect(() => {
    if (userID && mcqID) {
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/getmcqcheating/${userID}/${mcqID}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const combinedBehaviors = [
              ...data.cheatingBehaviors.faceMovement.map((behavior) => ({
                type: "Face Movement",
                timestamp: behavior.timestamp,
                id: behavior.ucbFM_ID,
              })),
              ...data.cheatingBehaviors.multiplePeople.map((behavior) => ({
                type: "Multiple People",
                timestamp: behavior.timestamp,
                id: behavior.ucbMP_ID,
              })),
              ...data.cheatingBehaviors.shortcutKeys.map((behavior) => ({
                type: "Shortcut Keys",
                timestamp: behavior.timestamp,
                id: behavior.ucbSK_ID,
                details: behavior.shortcutkeys, // Adding details for shortcut keys
              })),
              ...data.cheatingBehaviors.smartphone.map((behavior) => ({
                type: "Smartphone",
                timestamp: behavior.timestamp,
                id: behavior.ucbSP_ID,
              })),
              ...data.cheatingBehaviors.switchTabs.map((behavior) => ({
                type: "Switch Tabs",
                timestamp: behavior.timestamp,
                id: behavior.ucbST_ID,
              })),
              ...data.cheatingBehaviors.noPerson.map((behavior) => ({
                type: "No Person",
                timestamp: behavior.timestamp,
                id: behavior.ucbNP_ID,
              })),
            ];

            setCheatingBehaviors(combinedBehaviors);
          } else {
            setError(data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching cheating behaviors:", error);
          setError("Error fetching cheating behaviors");
        })
        .finally(() => setLoading(false));
    } else {
      setError("User ID and MCQ ID are required");
      setLoading(false);
    }
  }, [userID, mcqID]);

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(0); // Reset to the first page when the filter changes
  };

  // Filter the cheating behaviors based on the selected filter for the table only
  const filteredBehaviors =
    filter === "All"
      ? cheatingBehaviors
      : cheatingBehaviors.filter((behavior) => behavior.type === filter);

  // Count the occurrences of each type of cheating behavior for the bar chart
  const behaviorCounts = {
    "Face Movement": 0,
    "Multiple People": 0,
    "Shortcut Keys": 0,
    Smartphone: 0,
    "Switch Tabs": 0,
    "No Person": 0,
  };

  // Count all behaviors regardless of the filter for the chart
  cheatingBehaviors.forEach((behavior) => {
    behaviorCounts[behavior.type]++;
  });

  // Calculate total behaviors
  const totalBehaviors = Object.values(behaviorCounts).reduce(
    (a, b) => a + b,
    0
  );

  // Filter out behaviors that have a count of zero
  const filteredBehaviorCounts = Object.entries(behaviorCounts).filter(
    ([type, count]) => count > 0
  );

  // Determine most and least common behaviors
  const mostCommon =
    filteredBehaviorCounts.length > 0
      ? filteredBehaviorCounts.reduce((prev, curr) => {
          return prev[1] > curr[1] ? prev : curr;
        })
      : ["None", 0];

  const leastCommon =
    filteredBehaviorCounts.length > 0
      ? filteredBehaviorCounts.reduce((prev, curr) => {
          return prev[1] < curr[1] ? prev : curr;
        })
      : ["None", 0];

  const mostCommonPercentage =
    totalBehaviors > 0
      ? ((mostCommon[1] / totalBehaviors) * 100).toFixed(2)
      : 0;
  const leastCommonPercentage =
    totalBehaviors > 0
      ? ((leastCommon[1] / totalBehaviors) * 100).toFixed(2)
      : 0;

  // Prepare data for the Bar chart
  const chartData = {
    labels: Object.keys(behaviorCounts),
    datasets: [
      {
        label: "Cheating Behavior Count",
        data: Object.values(behaviorCounts),
        backgroundColor: [
          "rgba(52, 152, 219, 0.6)", // Blue - Face Movement
          "rgba(231, 76, 60, 0.6)", // Red - Multiple People
          "rgba(243, 156, 18, 0.6)", // Orange - Shortcut Keys
          "rgba(46, 204, 113, 0.6)", // Green - Smartphone
          "rgba(155, 89, 182, 0.6)", // Purple - Switch Tabs
          "rgba(52, 73, 94, 0.6)", // Dark Gray - No Person
        ],
      },
    ],
  };

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

  if (loading) {
    return <div className={styles.loader}></div>; // Updated loading spinner
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // Calculate pagination
  const totalFilteredBehaviors = filteredBehaviors.length;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalFilteredBehaviors);
  const paginatedBehaviors = filteredBehaviors.slice(startIndex, endIndex);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cheating Behavior</h1>

      {/* Display User Information */}
      <div className={styles.userInfo}>
        <div className={styles.combineduserinfo}>
          <div className={styles.first}>
            <div className={styles.profilePicContainer}>
              {userData.profilepic && (
                <img
                  src={`data:image/jpeg;base64,${userData.profilepic}`} // Adjust MIME type if necessary
                  alt={`${userData.firstname} ${userData.lastname}`}
                  className={styles.profilePic}
                />
              )}
            </div>
            <p className={styles.userName}>
              First name: {userData.firstname} <br />
              Last name: {userData.lastname}
            </p>
          </div>
          <div className={styles.second}>
            <div className={styles.cheatinginfo}>
              <h2 className={styles.subtitle}>Overview</h2>
              <p>
                The most common cheating behavior detected by the website is{" "}
                <strong>{mostCommon[0]}</strong> with the percentage of{" "}
                <strong>{mostCommonPercentage}%</strong>.
              </p>
              <p>
                The least common cheating behavior detected by the website is{" "}
                <strong>{leastCommon[0]}</strong> with the percentage of{" "}
                <strong>{leastCommonPercentage}%</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <h2 className={styles.subtitle}>Data Visualization</h2>
      <div className={styles.combinedContainer}>
        <div className={styles.chartContainer}>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
        <div className={styles.behaviorSummary}>
          {Object.entries(behaviorCounts).map(([type, count]) => {
            const percentage =
              totalBehaviors > 0
                ? ((count / totalBehaviors) * 100).toFixed(2)
                : 0;
            return (
              <div key={type} className={styles.behaviorCard}>
                <p className={styles.total}>{count}</p>
                <p className={styles.type}>{type}</p>
                <p>Percentage: {percentage}%</p> {/* Display percentage here */}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.tableContainer}>
        <label htmlFor="behaviorFilter" className={styles.filterLabel}>
          Filter by Behavior Type:
        </label>
        <select
          id="behaviorFilter"
          className={styles.filterSelect}
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="All">All</option>
          <option value="Face Movement">Face Movement</option>
          <option value="Multiple People">Multiple People</option>
          <option value="Shortcut Keys">Shortcut Keys</option>
          <option value="Smartphone">Smartphone</option>
          <option value="Switch Tabs">Switch Tabs</option>
          <option value="No Person">No Person</option>
        </select>

        {paginatedBehaviors.length > 0 ? (
          <>
            <table className={styles.behaviorTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBehaviors.map((behavior, index) => (
                  <tr key={`${behavior.id}-${index}`}>
                    <td>{behavior.type}</td>
                    <td>{formatTimestamp(behavior.timestamp)}</td>{" "}
                    {/* Format the timestamp */}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                <img
                  src="/logo/previous.svg"
                  alt="Previous"
                  className={styles.paginationIcon}
                />
              </button>
              <span>
                Page {currentPage + 1} of{" "}
                {Math.ceil(totalFilteredBehaviors / rowsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(totalFilteredBehaviors / rowsPerPage) - 1
                    )
                  )
                }
                disabled={
                  currentPage >=
                  Math.ceil(totalFilteredBehaviors / rowsPerPage) - 1
                }
              >
                <img
                  src="/logo/next.svg"
                  alt="Next"
                  className={styles.paginationIcon}
                />
              </button>
            </div>
          </>
        ) : (
          <p className={styles.noBehaviors}>No cheating behaviors found.</p>
        )}
      </div>
    </div>
  );
}

export default Cheatingbehavior;
