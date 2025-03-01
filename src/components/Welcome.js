import React from "react";
import { Link } from "react-router-dom";
import { SparklesCore } from "./ui/sparkles";
import {
  SignedOut,
  SignInButton,
  useAuth
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function BankWelcomePage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  
  // Redirect logic after successful login
  useEffect(() => {
    if (isSignedIn) {
      // Redirect to dashboard or home page after successful login
      navigate("/login");
    }
  }, [isSignedIn, navigate]);
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <div className="w-full flex flex-col items-center text-center p-10">
        <h1 className="text-5xl font-bold mb-4">Welcome to Zenith Pay</h1>
        <p className="text-gray-400 text-xl mb-8">
          Your Trusted Finance Care Partner
        </p>
      
        <SignedOut>
        <SignInButton mode="modal">
          <button className="transition p-4 rounded-lg text-lg font-semibold z-10 animate-bounce" onClick={() =>localStorage.setItem("alert", "You have successfully signed up for Zenith Pay. Now, please connect your Zenith account to proceed.")}>
            <img
              src="/img1.jpg"
              alt="Bank"
              className="rounded-lg w-32 h-32 object-cover animate-custom-bounce"
            />
          </button></SignInButton>
        </SignedOut>
      </div>
      <div className="w-full absolute inset-0 min-h-screen z-0">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={0.8}
          particleDensity={200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-10 mb-8 z-10">
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="font-bold text-2xl mb-2">Personal Banking</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✓ Checking & Savings Accounts</li>
            <li>✓ Web Banking Application</li>
            <li>✓ Transaction Analytics</li>
            <li>✓ Balance Visulization</li>
          </ul>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg z-10">
          <h3 className="font-bold text-2xl mb-2">Business Banking</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✓ Business Accounts</li>
            <li>✓ Merchant Services</li>
            <li>✓ Business Loans</li>
            <li>✓ International Trade</li>
          </ul>
        </div>
      </div>

      {/* Contact & Hours */}
      <div className="bg-gray-700 p-8 rounded-lg w-full max-w-4xl mb-8 z-10">
        <h3 className="font-bold text-2xl mb-4 text-center">
          Bank Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Contact Details</h4>
            <p>
              <span className="font-semibold">Bank Name:</span> Zenith Bank
            </p>
            <p>
              <span className="font-semibold">Branch:</span> Downtown City
              Center
            </p>
            <p>
              <span className="font-semibold">Address:</span> 123 Financial
              District
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +1 (555) 123-4567
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              support@zenithbank.com
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Business Hours</h4>
            <p>
              <span className="font-semibold">Monday-Friday:</span> 9:00 AM -
              5:00 PM
            </p>
            <p>
              <span className="font-semibold">Saturday:</span> 10:00 AM - 2:00
              PM
            </p>
            <p>
              <span className="font-semibold">Sunday:</span> Closed
            </p>
            <p>
              <span className="font-semibold">ATM:</span> 24/7 Access
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-sm text-gray-400 text-center w-full p-4 z-10">
        <p className="mb-2">🔒 Bank-grade security with 256-bit encryption</p>
        <p>© 2025 Zenith Bank. All rights reserved. FDIC Insured.</p>
      </div>
    </div>
  );
}
