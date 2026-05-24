import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SkillSearch from "./pages/SkillSearch";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Community from "./pages/Community";
import RequestsBoard from "./pages/RequestsBoard";
import BarterMatch from "./pages/BarterMatch";
import Roadmaps from "./pages/Roadmaps";
import Guidelines from "./pages/Guidelines";

// Helper component for private routes
function ProtectedRoute({ children }) {
  let parsedUser = null;
  try {
    const u = localStorage.getItem("user");
    if (u && u !== "undefined" && u !== "null") {
      parsedUser = JSON.parse(u);
    }
  } catch (e) {
    localStorage.removeItem("user");
  }

  if (!parsedUser || !parsedUser.email) {
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }
  return children;
}

// Helper component for public routes
function PublicRoute({ children }) {
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <SkillSearch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/community" 
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute>
              <RequestsBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/match" 
          element={
            <ProtectedRoute>
              <BarterMatch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roadmaps" 
          element={
            <ProtectedRoute>
              <Roadmaps />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guidelines" 
          element={
            <ProtectedRoute>
              <Guidelines />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 