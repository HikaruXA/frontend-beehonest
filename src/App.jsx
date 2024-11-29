import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./views/register/Register";
import Login from "./views/login/Login";
import Landing from "./views/landing/Landing";
import EducatorLayout from "./views/layouts/educators/Educatorlayout";
import StudentLayout from "./views/layouts/students/Studentlayout";
import CreateCourse from "./views/courses/educators/create/Createcourse";
import Educatorassessment from "./views/assessments/educators/Educatorsassessment";
import Studentassessment from "./views/assessments/students/Studentassessment";
import Createquiz from "./views/quizzes/educators/create/Createquiz";
import Createidentification from "./views/identification/educators/create/Createidentification";
import Quizdisplay from "./views/quizzes/students/quizdisplay/Quizdisplay";
import Identificationdisplay from "./views/identification/students/identificationdisplay/Identificationdisplay";
import Viewsubmission from "./views/assessments/educators/view/quiz/Viewsubmission";
import Viewidentificationsubmission from "./views/assessments/educators/view/identification/Viewidentificationsubmission";
import Identificationdetection from "./views/identification/detection/Identificationdetection";
import Profile from "./views/profile/Profile";
import Upload from "./views/docs/educator/Upload";
import Test from "./views/docs/test/Test";
import Viewdocs from "./views/docs/view/Viewdocs";
import Cheatingbehavior from "./views/assessments/cheatingbehavior/quiz/Cheatingbehavior";
import Identificationcheatingbehavior from "./views/assessments/cheatingbehavior/identification/Identificationcheatingbehavior";
import Courserespondents from "./views/courses/respondents/Courserespondents";
import Updatecourse from "./views/courses/educators/update/Updatecourse";
import Forgetpass from "./views/forgetpass/Forgetpass";
import Studentcheatingbehavior from "./views/studentcheatingbehavior/Studentcheatingbehavior";
import MCQanswers from "./views/quizzes/educators/answers/MCQanswers";
import Identificationanswers from "./views/identification/educators/answers/Identificationanswers";
import Quizdetection from "./views/quizzes/detection/Quizdetection";
import Termsandcondition from "./components/termsandcondition/Termsandcondition";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Verify from "./views/register/verify/Verify";
import Failed from "./views/register/failed/Failed";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/failed" element={<Failed />} />
        <Route
          path="/educatorlayout"
          element={
            <RoleProtectedRoute allowedRole="educator">
              <EducatorLayout />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/studentlayout"
          element={
            <RoleProtectedRoute allowedRole="student">
              <StudentLayout />
            </RoleProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/createcourse" element={<CreateCourse />} />
        <Route path="/educatorassessment" element={<Educatorassessment />} />
        <Route path="/studentassessment" element={<Studentassessment />} />
        <Route path="/createquiz" element={<Createquiz />} />
        <Route path="/quizdisplay" element={<Quizdisplay />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/test" element={<Test />} />
        <Route path="/viewdocs" element={<Viewdocs />} />
        <Route path="/cheatingbehavior" element={<Cheatingbehavior />} />
        <Route path="/viewsubmission" element={<Viewsubmission />} />
        <Route path="/courserespondents" element={<Courserespondents />} />
        <Route path="/updatecourse" element={<Updatecourse />} />
        <Route path="/forgetpass" element={<Forgetpass />} />
        <Route path="/mcqanswers" element={<MCQanswers />} />
        <Route path="/quizdetection" element={<Quizdetection />} />
        <Route path="/termsandconditions" element={<Termsandcondition />} />

        <Route
          path="/identificationanswers"
          element={<Identificationanswers />}
        />
        <Route
          path="/studentcheatingbehavior"
          element={<Studentcheatingbehavior />}
        />
        <Route
          path="/identificationcheatingbehavior"
          element={<Identificationcheatingbehavior />}
        />
        <Route
          path="identificationdetection"
          element={<Identificationdetection />}
        />
        <Route
          path="/createidentification"
          element={<Createidentification />}
        />
        <Route
          path="/identificationdisplay"
          element={<Identificationdisplay />}
        />
        <Route path="/viewsubmission" element={<Viewsubmission />} />
        <Route
          path="/viewidentificationsubmission"
          element={<Viewidentificationsubmission />}
        />

        {/* Add StudentLayout */}
      </Routes>
    </Router>
  );
}

export default App;
