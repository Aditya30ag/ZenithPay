import './App.css';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState } from 'react';
import BankWelcomePage from './components/Welcome';
// import Footer from './components/Footer';
import LoginForm from './components/Login';
import Otp from './components/Otp';
import ZenithDashboard from './components/Home';
import SignupForm from './components/Signupform';
// Protected Route Component
const ProtectedRoute = ({ children, requiredAuth, redirectPath }) => {
  // Check if the required token exists in localStorage
  const isAuthenticated = () => {
    if (requiredAuth === 'token') {
      return localStorage.getItem('token');
    } else if (requiredAuth === 'otpToken') {
      return localStorage.getItem('otpToken');
    }
    return false;
  };

  // If not authenticated, redirect to specified path
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// AuthRedirect Component - prevents going back to auth pages if already authenticated
const AuthRedirect = ({ children, authType, redirectTo }) => {
  const hasToken = () => {
    if (authType === 'token') {
      return localStorage.getItem('token');
    } else if (authType === 'otpToken') {
      return localStorage.getItem('otpToken');
    }
    return false;
  };

  // If already authenticated, redirect to specified path
  if (hasToken()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

function App() {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <BankWelcomePage />
    },
    {
      path: "/login",
      element: (
        <AuthRedirect authType="token" redirectTo="/otp">
          <LoginForm />
        </AuthRedirect>
      )
    },
    {
      path: "/signup",
      element: (
        <AuthRedirect authType="token" redirectTo="/otp">
          <SignupForm/>
        </AuthRedirect>
      )
    },
    {
      path: "/otp",
      element: (
        <AuthRedirect authType="otpToken" redirectTo="/home">
          <ProtectedRoute requiredAuth="token" redirectPath="/login">
            <Otp />
          </ProtectedRoute>
        </AuthRedirect>
      )
    },
    {
      path: "/home",
      element: (
        <ProtectedRoute requiredAuth="otpToken" redirectPath="/otp">
          <ZenithDashboard />
        </ProtectedRoute>
      )
    },
    {
      path: "/checkbalance",
      element: (
        <ProtectedRoute requiredAuth="otpToken" redirectPath="/otp">
          <div>Check Balance Component</div>
        </ProtectedRoute>
      )
    },
    {
      path: "/payment",
      element: (
        <ProtectedRoute requiredAuth="otpToken" redirectPath="/otp">
          <div>Payment Component</div>
        </ProtectedRoute>
      )
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;