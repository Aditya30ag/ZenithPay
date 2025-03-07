import React, { useState } from "react";

const LoanCreationForm = ({ onCreateLoan }) => {
  const [loanDetails, setLoanDetails] = useState({
    amount: "",
    interestRate: "",
    tenureMonths: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!loanDetails.amount || parseFloat(loanDetails.amount) <= 0) {
      newErrors.amount = "Please enter a valid loan amount";
    }

    // Interest Rate validation
    if (
      !loanDetails.interestRate ||
      parseFloat(loanDetails.interestRate) <= 0 ||
      parseFloat(loanDetails.interestRate) > 50
    ) {
      newErrors.interestRate = "Interest rate must be between 0% and 50%";
    }

    // Tenure validation
    if (
      !loanDetails.tenureMonths ||
      parseInt(loanDetails.tenureMonths) <= 0 ||
      parseInt(loanDetails.tenureMonths) > 60
    ) {
      newErrors.tenureMonths = "Loan tenure must be between 1 and 60 months";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateLoan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const newLoan = {
      userId: localStorage.getItem("id"),
      amount: parseFloat(loanDetails.amount),
      interestRate: parseFloat(loanDetails.interestRate),
      tenureMonths: parseInt(loanDetails.tenureMonths),
    };

    try {
      const response = await fetch("http://localhost:8080/api/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLoan),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Loan created successfully:", responseData);
        onCreateLoan(responseData);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        setLoanDetails({
          amount: "",
          interestRate: "",
          tenureMonths: "",
        });
        setErrors({});
      } else {
        console.error("Error creating loan:", await response.json());
      }
    } catch (error) {
      console.error("Failed to create loan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLoanDetails((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full md:w-2/3 lg:w-1/2 px-4 mx-auto">
      <div className="w-full bg-gray-800 shadow-2xl rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 p-4 sm:p-6 border-b border-gray-700">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-white">
            Create Loan Request
          </h3>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {showSuccessMessage && (
            <div className="bg-green-800 text-green-100 p-3 rounded-md text-center">
              Loan request submitted successfully!
            </div>
          )}
          
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Enter loan amount"
                value={loanDetails.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={`w-full pl-8 pr-4 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? "border-2 border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500 border border-gray-600"
                }`}
              />
            </div>
            {errors.amount && <p className="text-red-400 text-sm mt-2">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="Enter interest rate"
                value={loanDetails.interestRate}
                onChange={(e) => handleInputChange("interestRate", e.target.value)}
                className={`w-full pr-10 pl-4 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.interestRate
                    ? "border-2 border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500 border border-gray-600"
                }`}
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
            {errors.interestRate && <p className="text-red-400 text-sm mt-2">{errors.interestRate}</p>}
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Loan Tenure
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Enter loan tenure"
                value={loanDetails.tenureMonths}
                onChange={(e) => handleInputChange("tenureMonths", e.target.value)}
                className={`w-full pr-16 pl-4 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.tenureMonths
                    ? "border-2 border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500 border border-gray-600"
                }`}
              />
              <span className="absolute right-3 top-3 text-gray-400">Months</span>
            </div>
            {errors.tenureMonths && <p className="text-red-400 text-sm mt-2">{errors.tenureMonths}</p>}
          </div>

          {loanDetails.amount && loanDetails.interestRate && loanDetails.tenureMonths && (
            <div className="bg-gray-700 p-4 rounded-md">
              <h4 className="text-white font-medium mb-2">Loan Summary</h4>
              <div className="text-gray-300 text-sm space-y-1">
                <p>Principal: ${parseFloat(loanDetails.amount).toLocaleString()}</p>
                <p>Interest Rate: {loanDetails.interestRate}%</p>
                <p>Tenure: {loanDetails.tenureMonths} months</p>
                <p className="text-white font-medium pt-2">
                  Est. Monthly Payment: $
                  {(
                    (parseFloat(loanDetails.amount) * (parseFloat(loanDetails.interestRate) / 100 / 12) * 
                    Math.pow(1 + parseFloat(loanDetails.interestRate) / 100 / 12, parseInt(loanDetails.tenureMonths))) / 
                    (Math.pow(1 + parseFloat(loanDetails.interestRate) / 100 / 12, parseInt(loanDetails.tenureMonths)) - 1)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleCreateLoan}
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} 
              text-white py-3 rounded-md transition duration-300 focus:outline-none focus:ring-2 
              focus:ring-blue-500 transform hover:scale-102 active:scale-98`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Create Loan Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCreationForm;