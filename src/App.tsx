// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { EnrollmentProvider } from "./context/EnrollmentContext";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AnnouncementManager from "./pages/admin/AnnouncementManager";
import UserManager from "./pages/admin/UserManager";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import InstructorRoute from "./components/auth/InstructorRoute";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";

const App = () => (
  <AuthProvider>
    <SettingsProvider>
      <EnrollmentProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Admin Login Route (Public but distinct) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes (Protected) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path="announcements"
                    element={<AnnouncementManager />}
                  />
                  <Route path="users" element={<UserManager />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Instructor Routes (Protected) */}
              <Route element={<InstructorRoute />}>
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/ınstructor" element={<InstructorDashboard />} />
              </Route>

              {/* Public Routes with Navbar/Footer */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow flex flex-col">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route
                          path="/announcements"
                          element={<Announcements />}
                        />
                        <Route
                          path="/announcements/:id"
                          element={<AnnouncementDetail />}
                        />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route
                          path="/payment/:courseId"
                          element={<Payment />}
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route
                          path="/forgot-password"
                          element={<ForgotPassword />}
                        />
                        <Route
                          path="/reset-password"
                          element={<ResetPassword />}
                        />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </EnrollmentProvider>
    </SettingsProvider>
  </AuthProvider>
);

export default App;
