import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout.jsx';
import LandingLayout from './components/LandingLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocumentList from './pages/DocumentList.jsx';
import DocumentDetail from './pages/DocumentDetail.jsx';
import VerificationResults from './pages/VerificationResults.jsx';
import About from './pages/About.jsx';
import Documentation from './pages/Documentation.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Landing Page - Full Width with Header/Footer */}
            <Route element={<LandingLayout />}>
              <Route path="/welcome" element={<LandingPage />} />
            </Route>
            
            {/* Routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/verification-results" element={<VerificationResults />} />
              <Route path="/about" element={<About />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
