import React, { useState } from "react";
import { SparklesCore } from "./ui/sparkles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const SignupForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        addharNumber: "",
        email: "",
        phonenumber: "",
        password: "",
        balance: "10000.00",  // Default balance as per response
        savingAmount: "2500.00",  // Default savings
        isActive: true, // Default user status
      });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080"; // ✅ Ensure correct backend URL

  // ✅ Function to send OTP
  const sendOtp = async () => {
    if (!formData.phonenumber) {
      setError("Please enter your phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("Sending OTP to:", formData.phonenumber);
      await axios.post(`${BASE_URL}/api/otp/send-otp`, {
        phone: `+91${formData.phonenumber}`,
      });
      setOtpSent(true);
      localStorage.setItem("alert", "OTP sent successfully. Please check your phone.");
    } catch (error) {
      console.error("OTP Send Error:", error);
      localStorage.setItem("alert", "Failed to send OTP. Try again.");
      setError("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  // ✅ Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Submitting Data:", formData); // 🔍 Debugging

    try {
        const response = await axios.post(`http://localhost:8080/api/users`, formData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("Signup Success:", response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("name", formData.fullName);
        localStorage.setItem("phone", formData.phonenumber);
        sendOtp();
        navigate("/home");
    } catch (err) {
        console.error("Signup Error:", err);
        localStorage.setItem("alert", "Failed to register. Please try again.");
        if (err.response) {
            console.log("Error Data:", err.response.data);
            console.log("Error Status:", err.response.status);
        }

        setError("Failed to register. Please try again.");
    }
    setLoading(false);
};

  // ✅ Function to handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl z-10">
        <h2 className="text-center text-3xl font-bold text-white">Sign Up</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(formData).map((key, index) => (
              <div key={key} className={index === Object.keys(formData).length - 1 ? "col-span-2" : ""}>
                <label className="text-white block text-sm font-medium mb-2" htmlFor={key}>
                  {key.replace("_", " ").toUpperCase()}
                </label>
                <input
                  id={key}
                  name={key}
                  type={key === "password" ? "password" : "text"}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${key.replace("_", " ")}`}
                  required
                />
              </div>
            ))}

            {/* OTP Input (Full Width) */}
            {otpSent && (
              <div className="col-span-2">
                <label className="text-white block text-sm font-medium mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  required
                />
              </div>
            )}

            {/* Send OTP Button (Full Width) */}
            
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 font-semibold text-lg transition duration-300 ease-in-out"
          >
            <div className="py-2 px-4 rounded-md bg-gray-800 hover:bg-gray-900 text-white shadow-md inline-block">
              Already have an account?{" "}
              <span className="text-blue-400">Sign In</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
