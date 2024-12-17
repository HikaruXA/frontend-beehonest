import React, { useEffect, useState } from "react";
import { Pie, Line } from "react-chartjs-2";
import styles from "./report.module.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Report({ userID }) {
  const [cheatingCounts, setCheatingCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [courses, setCourses] = useState([]);

  // Filter states
  const [cheatingTypeFilter, setCheatingTypeFilter] = useState("");
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const instructorID = userID;

  // New state for MCQ Assessment Cheating Summary
  const [mcqCheatingData, setMcqCheatingData] = useState([]);
  const [mcqLoading, setMcqLoading] = useState(false);

  const downloadPDF = async () => {
    const input = document.querySelector(`.${styles.reportContainer}`);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const imageWidth = pdfWidth - 2 * margin;
      const imageHeight = (imgProps.height * imageWidth) / imgProps.width;

      // Split the image into pages manually
      const pageHeight = pdfHeight - 2 * margin;

      for (let position = 0; position < imageHeight; position += pageHeight) {
        if (position > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin - position,
          imageWidth,
          imageHeight
        );
      }

      pdf.save(`cheating_report_${selectedCourse}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // New state for Course Identification Cheating Summary
  const [
    courseIdentificationCheatingData,
    setCourseIdentificationCheatingData,
  ] = useState([]);
  const [courseIdentificationLoading, setCourseIdentificationLoading] =
    useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const generatePieChartAnalysis = (cheatingTotals) => {
    const totalIncidents = Object.values(cheatingTotals).reduce(
      (a, b) => a + b,
      0
    );
    const sortedTypes = Object.entries(cheatingTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    const mostCommonType = sortedTypes[0];
    const leastCommonType = sortedTypes[sortedTypes.length - 1];
    const percentages = sortedTypes.map((item) => ({
      ...item,
      percentage: ((item.count / totalIncidents) * 100).toFixed(2),
    }));

    return (
      <div className={styles.analysisSection}>
        <h3>Cheating Incidents Analysis</h3>
        <p>Total Cheating Incidents: {totalIncidents}</p>
        <p>
          Most Common Cheating Type: {mostCommonType.type} (
          {mostCommonType.count} incidents,{" "}
          {((mostCommonType.count / totalIncidents) * 100).toFixed(2)}%)
        </p>
        <p>
          Least Common Cheating Type: {leastCommonType.type} (
          {leastCommonType.count} incidents,{" "}
          {((leastCommonType.count / totalIncidents) * 100).toFixed(2)}%)
        </p>
        <h4>Detailed Breakdown:</h4>
        <ul>
          {percentages.map((item) => (
            <li key={item.type}>
              {item.type}: {item.count} incidents ({item.percentage}%)
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const generateLineChartAnalysis = (cheatingCounts) => {
    if (cheatingCounts.length === 0) return null;

    const dateGroups = cheatingCounts.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

    const dailyTotals = Object.entries(dateGroups).map(([date, items]) => ({
      date,
      total: items.length,
      types: [...new Set(items.map((item) => item.cheatingType))],
    }));

    const sortedDays = dailyTotals.sort((a, b) => b.total - a.total);
    const mostActiveDay = sortedDays[0];
    const leastActiveDay = sortedDays[sortedDays.length - 1];

    return (
      <div className={styles.analysisSection}>
        <h3>Least and Most Active</h3>

        <p>
          Most Active Day: {mostActiveDay.date} with {mostActiveDay.total}{" "}
          incidents
        </p>
        <p>
          Least Active Day: {leastActiveDay.date} with {leastActiveDay.total}{" "}
          incidents
        </p>
        <h4>Daily Cheating Type Variety:</h4>
        <ul>
          {sortedDays.map((day) => (
            <li key={day.date}>
              {day.date}: {day.total} incidents (Types: {day.types.join(", ")})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const generateStudentTotalsAnalysis = (cheatingCounts, userDetails) => {
    const studentTotals = calculateStudentCheatingTotals(cheatingCounts);

    const studentRankings = Object.entries(studentTotals)
      .map(([studentName, types]) => ({
        studentName,
        totalIncidents: Object.values(types).reduce((a, b) => a + b, 0),
        types,
      }))
      .sort((a, b) => b.totalIncidents - a.totalIncidents);

    const topStudent = studentRankings[0];
    const bottomStudent = studentRankings[studentRankings.length - 1];

    return (
      <div className={styles.analysisSection}>
        <h3>Student Cheating Behavior Analysis</h3>
        <p>Total Students with Cheating Incidents: {studentRankings.length}</p>
        <p>
          Most Problematic Student: {topStudent.studentName} with{" "}
          {topStudent.totalIncidents} incidents
        </p>
        <p>
          Least Problematic Student: {bottomStudent.studentName} with{" "}
          {bottomStudent.totalIncidents} incidents
        </p>
        <h4>Student Ranking by Total Cheating Incidents:</h4>
        <ol>
          {studentRankings.map((student) => (
            <li key={student.studentName}>
              {student.studentName}: {student.totalIncidents} total incidents
              <ul>
                {Object.entries(student.types).map(([type, count]) => (
                  <li key={type}>
                    {type}: {count} incidents
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    );
  };
  const generateMCQCheatingAnalysis = (mcqCheatingData) => {
    if (!mcqCheatingData || mcqCheatingData.length === 0) return null;

    const totalAssessments = mcqCheatingData.length;
    const totalCheatingCases = mcqCheatingData.reduce(
      (sum, assessment) => sum + assessment.total_cheating_cases,
      0
    );

    const cheatingTypeKeys = [
      "facemovement_cases",
      "multiplepeople_cases",
      "noperson_cases",
      "shortcutkeys_cases",
      "smartphone_cases",
      "switchtabs_cases",
    ];

    const typeTotals = cheatingTypeKeys.reduce((acc, key) => {
      acc[key] = mcqCheatingData.reduce(
        (sum, assessment) => sum + assessment[key],
        0
      );
      return acc;
    }, {});

    const mostCommonCheatingType = cheatingTypeKeys.reduce((a, b) =>
      typeTotals[a] > typeTotals[b] ? a : b
    );

    const typeNameMap = {
      facemovement_cases: "Face Movement",
      multiplepeople_cases: "Multiple People",
      noperson_cases: "No Person Detected",
      shortcutkeys_cases: "Shortcut Keys",
      smartphone_cases: "Smartphone Usage",
      switchtabs_cases: "Tab Switching",
    };

    return (
      <div className={styles.analysisSection}>
        <h3>MCQ Assessment Cheating Analysis</h3>
        <p>Total Assessments Analyzed: {totalAssessments}</p>
        <p>Total Cheating Cases: {totalCheatingCases}</p>
        <p>
          Most Common Cheating Type: {typeNameMap[mostCommonCheatingType]}(
          {typeTotals[mostCommonCheatingType]} cases)
        </p>
        <h4>Detailed Cheating Type Breakdown:</h4>
        <ul>
          {cheatingTypeKeys.map((key) => (
            <li key={key}>
              {typeNameMap[key]}: {typeTotals[key]} cases (
              {((typeTotals[key] / totalCheatingCases) * 100).toFixed(2)}%)
            </li>
          ))}
        </ul>
        <h4>Assessment-Level Insights:</h4>
        <ul>
          {mcqCheatingData.map((assessment) => (
            <li key={assessment.title}>
              {assessment.title}: {assessment.total_cheating_cases} total cases
              <ul>
                {cheatingTypeKeys.map(
                  (key) =>
                    assessment[key] > 0 && (
                      <li key={key}>
                        {typeNameMap[key]}: {assessment[key]} cases
                      </li>
                    )
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const generateCourseIdentificationCheatingAnalysis = (
    courseIdentificationCheatingData
  ) => {
    if (
      !courseIdentificationCheatingData ||
      courseIdentificationCheatingData.length === 0
    )
      return null;

    const totalAssessments = courseIdentificationCheatingData.length;
    const totalCheatingCases = courseIdentificationCheatingData.reduce(
      (sum, assessment) => sum + assessment.total_cheating_cases,
      0
    );

    const cheatingTypeKeys = [
      "facemovement_cases",
      "multiplepeople_cases",
      "noperson_cases",
      "shortcutkeys_cases",
      "smartphone_cases",
      "switchtabs_cases",
    ];

    const typeTotals = cheatingTypeKeys.reduce((acc, key) => {
      acc[key] = courseIdentificationCheatingData.reduce(
        (sum, assessment) => sum + assessment[key],
        0
      );
      return acc;
    }, {});

    const mostCommonCheatingType = cheatingTypeKeys.reduce((a, b) =>
      typeTotals[a] > typeTotals[b] ? a : b
    );

    const typeNameMap = {
      facemovement_cases: "Face Movement",
      multiplepeople_cases: "Multiple People",
      noperson_cases: "No Person Detected",
      shortcutkeys_cases: "Shortcut Keys",
      smartphone_cases: "Smartphone Usage",
      switchtabs_cases: "Tab Switching",
    };

    return (
      <div className={styles.analysisSection}>
        <h3>Course Identification Assessment Cheating Analysis</h3>
        <p>Total Assessments Analyzed: {totalAssessments}</p>
        <p>Total Cheating Cases: {totalCheatingCases}</p>
        <p>
          Most Common Cheating Type: {typeNameMap[mostCommonCheatingType]}(
          {typeTotals[mostCommonCheatingType]} cases)
        </p>
        <h4>Detailed Cheating Type Breakdown:</h4>
        <ul>
          {cheatingTypeKeys.map((key) => (
            <li key={key}>
              {typeNameMap[key]}: {typeTotals[key]} cases (
              {((typeTotals[key] / totalCheatingCases) * 100).toFixed(2)}%)
            </li>
          ))}
        </ul>
        <h4>Assessment-Level Insights:</h4>
        <ul>
          {courseIdentificationCheatingData.map((assessment) => (
            <li key={assessment.title}>
              {assessment.title}: {assessment.total_cheating_cases} total cases
              <ul>
                {cheatingTypeKeys.map(
                  (key) =>
                    assessment[key] > 0 && (
                      <li key={key}>
                        {typeNameMap[key]}: {assessment[key]} cases
                      </li>
                    )
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const generateSuggestions = (
    cheatingTotals,
    cheatingCounts,
    userDetails,
    mcqCheatingData,
    courseIdentificationCheatingData
  ) => {
    const totalIncidents = Object.values(cheatingTotals).reduce(
      (a, b) => a + b,
      0
    );
    const studentTotals = calculateStudentCheatingTotals(cheatingCounts);

    // Find the student with the highest total cheating incidents
    const studentRankings = Object.entries(studentTotals)
      .map(([studentName, types]) => ({
        studentName,
        totalIncidents: Object.values(types).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.totalIncidents - a.totalIncidents);

    const highestCheatingStudent = studentRankings[0];

    // Find the MCQ assessment with the most cheating cases
    const highestMcqCheatingAssessment =
      mcqCheatingData.length > 0
        ? mcqCheatingData.reduce((max, assessment) =>
            assessment.total_cheating_cases > max.total_cheating_cases
              ? assessment
              : max
          )
        : null;

    // Find the Course Identification assessment with the most cheating cases
    const highestCourseIdentificationCheatingAssessment =
      courseIdentificationCheatingData.length > 0
        ? courseIdentificationCheatingData.reduce((max, assessment) =>
            assessment.total_cheating_cases > max.total_cheating_cases
              ? assessment
              : max
          )
        : null;

    const suggestions = [
      // Suggestion 1: If total incidents > 50, talk with whole class
      totalIncidents > 50
        ? "Consider talking with the whole class about academic integrity."
        : null,

      // Suggestion 2: Talk with/counsel highest cheating student
      highestCheatingStudent && highestCheatingStudent.totalIncidents > 0
        ? `Consider counseling or providing guidance to ${highestCheatingStudent.studentName} who has the highest number of cheating incidents (${highestCheatingStudent.totalIncidents}).`
        : null,

      // Suggestion 3: MCQ Assessment - create new version if high cheating
      highestMcqCheatingAssessment &&
      highestMcqCheatingAssessment.total_cheating_cases > 0
        ? `Consider creating a new version of the MCQ assessment "${highestMcqCheatingAssessment.title}" due to high cheating incidents (${highestMcqCheatingAssessment.total_cheating_cases} cases).`
        : null,

      // Suggestion 4: Course Identification Assessment - create new version if high cheating
      highestCourseIdentificationCheatingAssessment &&
      highestCourseIdentificationCheatingAssessment.total_cheating_cases > 0
        ? `Consider creating a new version of the Course Identification assessment "${highestCourseIdentificationCheatingAssessment.title}" due to high cheating incidents (${highestCourseIdentificationCheatingAssessment.total_cheating_cases} cases).`
        : null,
    ].filter(Boolean);

    return (
      <div className={styles.suggestionsSection}>
        <h3>Recommendations</h3>
        {suggestions.length > 0 ? (
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        ) : (
          <p>No significant recommendations at this time.</p>
        )}
      </div>
    );
  };

  // Pagination logic for filtered cheating counts

  const calculateStudentCheatingTotals = (data) => {
    const studentCheatingTotals = {};

    data.forEach((item) => {
      const studentName = userDetails[item.userID] || "Unknown";
      const { cheatingType } = item;

      if (!studentCheatingTotals[studentName]) {
        studentCheatingTotals[studentName] = {};
      }

      studentCheatingTotals[studentName][cheatingType] =
        (studentCheatingTotals[studentName][cheatingType] || 0) + 1;
    });

    return studentCheatingTotals;
  };

  useEffect(() => {
    // Fetch courses for the instructor
    fetch(
      `https://backend-bhonest-a110b63abc0c.herokuapp.com/courses/${instructorID}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setCourses(data.courses);
          // Optionally set the first course as default
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0].courseID);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setError(err.message);
      });
  }, [instructorID]);

  // New useEffect to fetch Course Identification Cheating Summary
  useEffect(() => {
    if (selectedCourse) {
      setCourseIdentificationLoading(true);
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/summarycourseidentification/${selectedCourse}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setCourseIdentificationCheatingData(data.cheatingData);
          }
          setCourseIdentificationLoading(false);
        })
        .catch((err) => {
          console.error(
            "Error fetching Course Identification cheating data:",
            err
          );
          setCourseIdentificationLoading(false);
        });
    }
  }, [selectedCourse]);

  // New useEffect to fetch MCQ Assessment Cheating Summary
  useEffect(() => {
    if (selectedCourse) {
      setMcqLoading(true);
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/summarymcqassessment/${selectedCourse}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setMcqCheatingData(data.cheatingData);
          }
          setMcqLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching MCQ cheating data:", err);
          setMcqLoading(false);
        });
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Only fetch cheating data if a course is selected
    if (selectedCourse) {
      setLoading(true);
      fetch(
        `https://backend-bhonest-a110b63abc0c.herokuapp.com/cheating-count-courses/${instructorID}/${selectedCourse}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setCheatingCounts(data.cheatingData);

          const uniqueUserIDs = [
            ...new Set(data.cheatingData.map((item) => item.userID)),
          ];

          return Promise.all(
            uniqueUserIDs.map((userID) =>
              fetch(
                `https://backend-bhonest-a110b63abc0c.herokuapp.com/user/${userID}`
              )
                .then((response) => response.json())
                .then((userData) => ({
                  userID,
                  fullName: userData.success
                    ? `${userData.userInfo.firstname || ""} ${
                        userData.userInfo.lastname || ""
                      }`.trim()
                    : "Unknown",
                }))
            )
          );
        })
        .then((userDetailsArray) => {
          const userDetailsMap = userDetailsArray.reduce((acc, user) => {
            acc[user.userID] = user.fullName;
            return acc;
          }, {});
          setUserDetails(userDetailsMap);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [instructorID, selectedCourse]);

  const calculateCheatingTotals = (data) => {
    return data.reduce((acc, item) => {
      const { cheatingType } = item;
      acc[cheatingType] = (acc[cheatingType] || 0) + 1;
      return acc;
    }, {});
  };

  const prepareCheatingTimeSeriesData = (data) => {
    const typeDateCounts = {};

    data.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      const { cheatingType } = item;

      if (!typeDateCounts[cheatingType]) {
        typeDateCounts[cheatingType] = {};
      }

      typeDateCounts[cheatingType][date] =
        (typeDateCounts[cheatingType][date] || 0) + 1;
    });

    const allDates = [
      ...new Set(
        data.map((item) => new Date(item.timestamp).toLocaleDateString())
      ),
    ].sort((a, b) => new Date(a) - new Date(b));

    const colorPalette = [
      {
        border: "rgba(255, 99, 132, 1)",
        background: "rgba(255, 99, 132, 0.2)",
      },
      {
        border: "rgba(54, 162, 235, 1)",
        background: "rgba(54, 162, 235, 0.2)",
      },
      {
        border: "rgba(255, 206, 86, 1)",
        background: "rgba(255, 206, 86, 0.2)",
      },
      {
        border: "rgba(75, 192, 192, 1)",
        background: "rgba(75, 192, 192, 0.2)",
      },
      {
        border: "rgba(153, 102, 255, 1)",
        background: "rgba(153, 102, 255, 0.2)",
      },
    ];

    const datasets = Object.keys(typeDateCounts).map((cheatingType, index) => {
      const color = colorPalette[index % colorPalette.length];
      return {
        label: cheatingType,
        data: allDates.map((date) => typeDateCounts[cheatingType][date] || 0),
        borderColor: color.border,
        backgroundColor: color.background,
        tension: 0.1,
      };
    });

    return {
      labels: allDates,
      datasets: datasets,
    };
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Cheating Incidents by Type Over Time", // Removed (Filtered)
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Filter only the detailed log table
  const filteredCheatingCounts = cheatingCounts.filter(
    (item) =>
      (!cheatingTypeFilter || item.cheatingType === cheatingTypeFilter) &&
      (!studentNameFilter || userDetails[item.userID] === studentNameFilter)
  );

  // Always use full dataset for totals and charts
  const cheatingTotals = calculateCheatingTotals(cheatingCounts);
  const filteredCheatingTotals = calculateCheatingTotals(
    filteredCheatingCounts
  );

  // Prepare chart data (using full dataset)
  const pieChartData = {
    labels: Object.keys(cheatingTotals),
    datasets: [
      {
        data: Object.values(cheatingTotals),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Overall Cheating Types Distribution",
      },
    },
  };

  // Get unique filter options
  const uniqueCheatingTypes = [
    ...new Set(cheatingCounts.map((item) => item.cheatingType)),
  ];
  const uniqueStudentNames = [
    ...new Set(
      cheatingCounts
        .map((item) => userDetails[item.userID] || "Unknown")
        .filter((name) => name !== "Unknown")
    ),
  ];
  const totalPages = Math.ceil(filteredCheatingCounts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedCheatingCounts = filteredCheatingCounts.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Pagination handler methods
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h1 className={styles.reportTitle}>Cheating Report</h1>
        <h2 className={styles.reportSubtitle}>
          <button onClick={downloadPDF} className={styles.downloadButton}>
            Download PDF
          </button>
        </h2>
      </div>
      <div className={styles.courseSelectionContainer}>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Select a Course</option>
          {courses.map((course) => (
            <option key={course.courseID} value={course.courseID}>
              {course.courseCode} - {course.title}
            </option>
          ))}
        </select>
      </div>

      {cheatingCounts.length > 0 ? (
        <>
          <div className={styles.chartsContainer}>
            <div className={styles.chartContainer}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className={styles.chartContainer}>
              <Line
                data={prepareCheatingTimeSeriesData(cheatingCounts)} // Changed to use full dataset
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Total Counts Table (Unfiltered) */}
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Cheating Type</th>
                  <th>Total Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cheatingTotals).map(([cheatingType, count]) => (
                  <tr key={cheatingType}>
                    <td>{cheatingType}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Filters */}
          <div className={styles.filtersContainer}>
            <select
              value={cheatingTypeFilter}
              onChange={(e) => setCheatingTypeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Cheating Types</option>
              {uniqueCheatingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={studentNameFilter}
              onChange={(e) => setStudentNameFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Students</option>
              {uniqueStudentNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.tableWrapper}>
            {/* Detailed Log Table (Filtered and Paginated) */}
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cheating Type</th>
                  <th>Student Name</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCheatingCounts.map((item, index) => (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.cheatingType}</td>
                    <td>{userDetails[item.userID] || "Loading..."}</td>
                    <td>{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.paginationContainer}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              &lt;
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              &gt;
            </button>
          </div>
          <div className={styles.tableWrapper}>
            {/* New Table: Student Cheating Behavior Totals */}
            <h2 className={styles.tableTitle}>
              Student Cheating Behavior Totals
            </h2>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  {uniqueCheatingTypes.map((type) => (
                    <th key={type}>{type}</th>
                  ))}
                  <th>Total Incidents</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  calculateStudentCheatingTotals(cheatingCounts)
                ).map(([studentName, cheatingTypes]) => (
                  <tr key={studentName}>
                    <td>{studentName}</td>
                    {uniqueCheatingTypes.map((type) => (
                      <td key={type}>{cheatingTypes[type] || 0}</td>
                    ))}
                    <td>
                      {Object.values(cheatingTypes).reduce(
                        (total, count) => total + count,
                        0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mcqCheatingData.length > 0 && (
            <div className={styles.mcqSummaryContainer}>
              <h2 className={styles.tableTitle}>
                MCQ Assessment Cheating Summary
              </h2>
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Face Movement</th>
                      <th>Multiple People</th>
                      <th>No Person</th>
                      <th>Shortcut Keys</th>
                      <th>Smartphone</th>
                      <th>Switch Tabs</th>
                      <th>Total Cheating Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mcqCheatingData.map((assessment, index) => (
                      <tr key={index}>
                        <td>{assessment.title}</td>
                        <td>{assessment.facemovement_cases}</td>
                        <td>{assessment.multiplepeople_cases}</td>
                        <td>{assessment.noperson_cases}</td>
                        <td>{assessment.shortcutkeys_cases}</td>
                        <td>{assessment.smartphone_cases}</td>
                        <td>{assessment.switchtabs_cases}</td>
                        <td>
                          <strong>{assessment.total_cheating_cases}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {courseIdentificationCheatingData.length > 0 && (
            <div className={styles.courseIdentificationSummaryContainer}>
              <h2 className={styles.tableTitle}>
                Course Identification Cheating Summary
              </h2>
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Face Movement</th>
                      <th>Multiple People</th>
                      <th>No Person</th>
                      <th>Shortcut Keys</th>
                      <th>Smartphone</th>
                      <th>Switch Tabs</th>
                      <th>Total Cheating Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseIdentificationCheatingData.map(
                      (assessment, index) => (
                        <tr key={index}>
                          <td>{assessment.title}</td>
                          <td>{assessment.facemovement_cases}</td>
                          <td>{assessment.multiplepeople_cases}</td>
                          <td>{assessment.noperson_cases}</td>
                          <td>{assessment.shortcutkeys_cases}</td>
                          <td>{assessment.smartphone_cases}</td>
                          <td>{assessment.switchtabs_cases}</td>
                          <td>
                            <strong>{assessment.total_cheating_cases}</strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="analysisandsuggestion">
            <div className="Analysis">
              <div className="piechartanalysis">
                {generatePieChartAnalysis(cheatingTotals)}
              </div>
              <div className="linechartanalysis">
                {generateLineChartAnalysis(cheatingCounts)}
              </div>
              <div className="studenttotalanalysis">
                {generateStudentTotalsAnalysis(cheatingCounts, userDetails)}
              </div>
              <div className="mcqcheatingsummary">
                {generateMCQCheatingAnalysis(mcqCheatingData)}
              </div>
              <div className="identificationcheatingsummary">
                {generateCourseIdentificationCheatingAnalysis(
                  courseIdentificationCheatingData
                )}
              </div>
            </div>
            <div className="Suggestion">
              {generateSuggestions(
                cheatingTotals,
                cheatingCounts,
                userDetails,
                mcqCheatingData,
                courseIdentificationCheatingData
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.noData}>
          No cheating data found for this course.
        </div>
      )}
    </div>
  );
}

export default Report;
