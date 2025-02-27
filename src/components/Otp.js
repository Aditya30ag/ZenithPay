import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Building2, Camera, Shield, AlertCircle, KeyRound } from "lucide-react";
import axios from "axios";
import CameraAi from './CameraAi';
import ObjectAi from './ObjectAi';

const Otp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const phone = localStorage.getItem('phone');

  const BASE_URL = "http://localhost:5000";  // Change to your backend URL

  // Handle OTP Input Change
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) setError("");
    
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace, Arrow Keys
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && otpRefs.current[index - 1]) {
        otpRefs.current[index - 1].focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      e.preventDefault();
    }
    else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Verify OTP Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const submittedOtp = otp.join("");

      if (!submittedOtp || submittedOtp.length !== 6) {
        throw new Error("Please enter a complete 6-digit code");
      }
      const phone = localStorage.getItem('phone');
      const response = await axios.post(`${BASE_URL}/api/otp/verify-otp`, { phone, otp: submittedOtp });

      if (response.data.success) {
        setSuccess("Verification successful");
        localStorage.setItem("otpToken",response.data.otpToken);
        setTimeout(() => navigate('/home'), 1000);
        localStorage.setItem('alert', "Welcome to your dashboard. Here you can view your account summary, add to savings, and see recent transactions.");
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-16 w-16 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Secure Banking Verification
          </h2>
          <p className="mt-2 text-gray-400">
            Enhanced Security Authentication System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full border border-gray-700">
              <div className="flex items-center mb-4">
                <Camera className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-200">Facial Recognition</h3>
              </div>
              <CameraAi/>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full border border-gray-700">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-200">Security Scan</h3>
              </div>
              <ObjectAi/>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 shadow-xl rounded-2xl p-8 mt-8 border border-gray-800 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <KeyRound className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-200 mb-2">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-400">
                Enter your phone number to receive an OTP for verification.
              </p>
            </div>

            {/* Custom Alert */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                An OTP has been sent to {phone}. This code will expire in 2 minutes.
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center space-x-3 mt-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-14 h-14 text-center text-xl font-semibold bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 outline-none"
                />
              ))}
            </div>

            {/* Error & Success Messages */}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {success && <p className="text-green-400 text-center">{success}</p>}

            {/* Verify OTP Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition duration-300 hover:bg-green-700 disabled:bg-green-400"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Otp;