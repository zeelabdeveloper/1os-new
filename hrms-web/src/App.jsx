import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";

// Import all components directly
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";

import UserManagementCoco from "./pages/Coco/UserList";
import CreateUser from "./pages/Coco/CreateUser";
import Attendance from "./pages/Coco/Attendance";
import AdminRegularizationList from "./pages/Coco/RequestList";
import Store from "./pages/Coco/Store";

import Departments from "./pages/Permission/Departments";
import Roles from "./pages/Permission/Roles";
import Branch from "./pages/Permission/Branch";
import PermissionList from "./pages/Permission/PermissionList";

import Letter from "./pages/Content/Letter";
import StoreGroup from "./pages/Store/StoreGroup";
import Staff from "./pages/Store/Staff";

import Indicators from "./pages/Performance/Indicators";

import Appraisals from "./pages/Performance/Appraisals";

import ManageMyAppraisals from "./pages/Performance/ManageMyAppraisals";
import Feedback from "./pages/Performance/Feedback";
import Reviews from "./pages/Performance/Reviews";
import StaffListPage from "./pages/Staff/Employee";

import ViewStaff from "./pages/Staff/ViewStaff";
import DailyAttendance from "./pages/Attendance/Daily";
import MonthlyAttendance from "./pages/Attendance/Monthly";
import AttendanceReport from "./pages/Attendance/Report";
import Setup from "./pages/1os/Setup";
import Jobs from "./pages/Recruitment/Jobs";
import CreateJob from "./pages/Recruitment/Create";
import Applications from "./pages/Recruitment/Applications";
import Application from "./pages/Recruitment/Application";
import Candidates from "./pages/Recruitment/Candidates";
import Onboarding from "./pages/Recruitment/Onboarding";
import StartOnboarding from "./pages/Recruitment/Startonboarding";
import Interview from "./pages/Recruitment/Interview";
import Settings from "./pages/Settings";
import DeveloperSetting from "./pages/DeveloperSetting";
import EditProfile from "./pages/EditProfile";
import NewsPage from "./pages/Content/News";
import Faq from "./pages/Faq";
import GoalList from "./pages/Performance/Goals";
import ManageTeamAppraisals from "./pages/Performance/ManageTeamAppraisals";
import MyTaskManagement from "./pages/Performance/MyTaskManagement";
import TeamTaskManagement from "./pages/Performance/TeamTaskManagement";
import ViewProfile from "./pages/Profile";
import BankAccountListPage from "./pages/Account/AccountList";
import TeamMembers from "./pages/Team/Members";
import CreateEmployeeMain from "./pages/Staff/CreateEmployee";
import ApplicationTrack from "./pages/ApplicationTrack";
import Separation from "./pages/Recruitment/Separation";
import SeparationFromStaff from "./pages/SeparationFromStaff";
import NeedEmployee from "./pages/Support/NeedEmployee";
import ManagerRequest from "./pages/Support/ManagerRequest";
import Zone from "./pages/Permission/Zone";
import Coco from "./pages/Division/Coco";
import Sis from "./pages/Division/Sis";
import Fofo from "./pages/Division/Fofo";
import LineMessage from "./components/dashboard/LineMessage";
import PersonalSetting from "./pages/PersonalSetting";
import CompanyStats from "./pages/Recruitment/CompanyStats";
import JobLinkGenerate from "./pages/JobLinkGenerate";
import ApplyForJob from "./pages/ApplyForJob";
import GetReview from "./pages/Recruitment/GetReview";
 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" reverseOrder={false} />
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            >


              <Route path="/" element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="profiles" element={<ViewProfile />} />


              {/* Coco Routes */}
              <Route path="coco/userlist" element={<UserManagementCoco />} />
              <Route path="coco/createuser" element={<CreateUser />} />
              <Route path="coco/attendance" element={<Attendance />} />
              <Route
                path="coco/request-list"
                element={<AdminRegularizationList />}
              />
              <Route path="coco/store" element={<Store />} />
               
              {/* Account Routes */}
              <Route path="Account/list" element={<BankAccountListPage />} />

              {/* Team Routes */}
              <Route path="team/logs" element={<TeamMembers />} />

              {/* Permission Routes */}
              <Route path="permission/departments" element={<Departments />} />
              <Route path="permission/roles" element={<Roles />} />
              <Route path="permission/branches" element={<Branch />} />
              <Route path="permission/zones" element={<Zone />} />
              <Route
                path="permission/permissions-list"
                element={<PermissionList />}
              />
              {/* Division Routes */}
              <Route path="division/coco" element={<Coco />} />
              <Route path="division/fofo" element={<Fofo />} />
              <Route path="division/sis" element={<Sis />} />

              <Route
                path="permission/permissions-list"
                element={<PermissionList />}
              />

              {/* Support Routes */}
              <Route path="support/need-emp" element={<NeedEmployee />} />
              <Route
                path="support/manager-request"
                element={<ManagerRequest />}
              />

              {/* Content Routes */}
              <Route path="content/letter" element={<Letter />} />
              <Route path="content/news" element={<NewsPage />} />
              <Route path="content/line-message" element={<LineMessage />} />

              {/* Store Routes */}
              <Route path="store/storegroup" element={<StoreGroup />} />
              <Route path="store/staff" element={<Staff />} />

              {/* Performance Routes */}
              <Route path="performance/indicators" element={<Indicators />} />
              <Route path="performance/goals" element={<GoalList />} />
              <Route path="performance/appraisals" element={<Appraisals />} />
              <Route
                path="performance/appraisals/team"
                element={<ManageTeamAppraisals />}
              />

              <Route
                path="performance/appraisal"
                element={<ManageMyAppraisals />}
              />

              <Route path="performance/feedback" element={<Feedback />} />
              <Route path="performance/reviews" element={<Reviews />} />
              <Route
                path="performance/my-task"
                element={<MyTaskManagement />}
              />
              <Route
                path="performance/team-task"
                element={<TeamTaskManagement />}
              />

              {/* Staff Routes */}
              <Route path="staff/employees" element={<StaffListPage />} />
              <Route path="staff/create" element={<CreateEmployeeMain />} />
              <Route path="staff/employee" element={<ViewStaff />} />

              {/* Attendance Routes */}
              <Route path="attendance/daily" element={<DailyAttendance />} />
              <Route
                path="attendance/monthly"
                element={<MonthlyAttendance />}
              />
              <Route path="attendance/reports" element={<AttendanceReport />} />

              {/* System Setup */}
              <Route path="1os/setup" element={<Setup />} />

              {/* Recruitment Routes */}
              <Route path="recruitment/jobs" element={<Jobs />} />
              <Route path="recruitment/create" element={<CreateJob />} />
              <Route
                path="recruitment/applications"
                element={<Applications />}
              />
              <Route path="recruitment/application" element={<Application />} />
              <Route path="recruitment/stats" element={<CompanyStats />} />
              <Route path="recruitment/candidates" element={<Candidates />} />
              <Route path="recruitment/onboarding" element={<Onboarding />} />
              <Route path="recruitment/separation" element={<Separation />} />
              <Route path="recruitment/application/review" element={<GetReview />} />
              <Route
                path="recruitment/startonboarding"
                element={<StartOnboarding />}
              />
              <Route path="recruitment/interviews" element={<Interview />} />

              {/* Settings Routes */}
              <Route path="controllers" element={<Settings />} />
              <Route path="faq" element={<Faq />} />
              <Route path="developer-settings" element={<DeveloperSetting />} />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="separation" element={<SeparationFromStaff />} />
              <Route path="personal-settings" element={<PersonalSetting />} />
            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forget-pass" element={<ForgotPassword />} />
            <Route path="/generate/job/link" element={<JobLinkGenerate />} />

            <Route path="/apply/:jobId" element={<ApplyForJob />} />

            <Route path="/career/application" element={<ApplicationTrack />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
