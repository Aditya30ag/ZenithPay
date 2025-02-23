import React, { useState } from "react";
import { SparklesCore } from "./ui/sparkles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    addhar_number: "",
    phonenumber: "",
    email: "",
    password: "",
  });

  const BASE_URL = "http://localhost:5000";  // Change to your backend URL

  // Function to send OTP
  const sendOtp = async (phone) => {
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }
    console.log(phone);
    setError("");
    setLoading(true);
    phone="+91"+phone;
    console.log(phone);
    try {
      const response = await axios.post(`${BASE_URL}/api/otp/send-otp`, { phone });
      console.log("otp sent");
    } catch (error) {
      setError("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {  // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Handle successful login here (e.g., store token, redirect user)
      // Example: localStorage.setItem('token', data.token);
      // Example: window.location.href = '/dashboard';
      console.log(data);
      localStorage.setItem("token",data.token);
      
      localStorage.setItem("fullname",data.user.userdetails.full_name);
      localStorage.setItem("id",data.user.id);
      sendOtp(formData.phonenumber);
      if(sendOtp(formData.phonenumber)){
        localStorage.setItem("phone",`+91${formData.phonenumber}`);
        navigate('/otp');
        window.location.reload();
      }
      
      
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6">
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
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl z-10">
        
        <divc className="text-center z-10">
          <h2 className="text-center text-3xl font-bold text-white z-10">
            Login
          </h2>
        </divc>

        <form className="mt-8 space-y-6 z-10" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="addhar_number"
                className="text-white block text-sm font-medium mb-2"
              >
                Aadhar Number
              </label>
              <input
                id="addhar_number"
                name="addhar_number"
                type="text"
                value={formData.addhar_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Aadhar Number"
              />
            </div>

            <div>
              <label
                htmlFor="phonenumber"
                className="text-white block text-sm font-medium mb-2"
              >
                Phone Number
              </label>
              <input
                id="phonenumber"
                name="phonenumber"
                type="tel"
                value={formData.phonenumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Phone Number"
              />
            </div>

            

            <div>
              <label
                htmlFor="email"
                className="text-white block text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Email Address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-white block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
      <Link
        to="/signup"
        className="text-blue-500 hover:text-blue-700 font-semibold text-lg transition duration-300 ease-in-out"
      >
        <div className="py-2 px-4 rounded-md bg-gray-800 hover:bg-gray-900 text-white shadow-md inline-block">
          Don't have an account? <span className="text-blue-400">Sign up</span>
        </div>
      </Link>
    </div>
      </div>
      
    </div>
  );
};

export default LoginForm;
