import React, { useEffect, useState } from "react";
import axios from "axios";

const Loanfundinglistother = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [expandedLoanIds, setExpandedLoanIds] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await axios.get(`http://localhost:8080/api/loans/exclude/${id}`);
        console.log(response.data);
        setLoans(response.data);
      } catch (err) {
        setError("Failed to fetch loans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 p-4">
        <div className="animate-pulse text-center">
          <div className="h-6 bg-gray-700 rounded w-48 mb-4 mx-auto"></div>
          <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-32 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-red-500 p-4 text-center">
        <div>
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter loans based on the new response format
  const availableLoans = loans.filter(
    (loan) => loan.status === "PENDING" 
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleFundLoan = (loanId) => {
    // Implement funding logic here
    console.log(`Funding loan with ID: ₹{loanId}`);
    // You would typically make an API call here
  };

  const toggleExpanded = (loanId) => {
    setExpandedLoanIds(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId) 
        : [...prev, loanId]
    );
  };

  // Modal for loan details
  const LoanDetailsModal = ({ loan, onClose, onFund }) => {
    if (!loan) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-md relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-5">
            <div className="mb-4 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Loan Request Details</h3>
              <p className="text-gray-300 text-sm">Borrower: {loan.user.username || "Anonymous"}</p>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-green-400 font-semibold">₹{loan.loanAmount.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Interest Rate:</span>
                <span className="text-yellow-400">{loan.interestRate || "N/A"}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-gray-200">{loan.tenureMonths || "N/A"} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Repayment:</span>
                <span className="text-green-400 font-semibold">₹{loan.totalRepaymentAmount.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date:</span>
                <span className="text-gray-200">{formatDate(loan.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Date:</span>
                <span className="text-gray-200">{formatDate(loan.endDate)}</span>
              </div>
            </div>

            <div className="mb-4 pb-2 border-b border-gray-700">
              <h4 className="text-md font-semibold text-white mb-2">Borrower Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-gray-200">{loan.user.username}</span>
                </div>
                {loan.user.fullName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="text-gray-200">{loan.user.fullName}</span>
                  </div>
                )}
                {loan.user.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account:</span>
                    <span className="text-gray-200">{loan.user.accountNumber}</span>
                  </div>
                )}
                {loan.user.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-gray-200">{loan.user.email}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-gray-200">{loan.user.phonenumber}</span>
                    </div>
              </div>
            </div>
            <div className="border-b border-gray-700 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">Financial Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-green-400">₹{loan.user.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Savings Amount:</span>
                    <span className="text-green-400">₹{loan.user.savingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            <div className="mt-5">
              <button
                onClick={() => onFund(loan.id)}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
              >
                Fund This Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-w-screen p-4 mx-auto bg-gray-900 mt-4">
      <div className="mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 text-center">Fund Other Loans</h2>

        {availableLoans.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M20 12a8 8 0 01-8 8m8-8a8 8 0 00-8-8m8 8h-8" />
              </svg>
              <p className="text-gray-400 text-lg">No available loans at the moment</p>
              <p className="text-gray-500 mt-2 text-sm">Check back later for new opportunities</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {availableLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-blue-400">Loan</h3>
                  <span className="text-green-400 font-bold">₹{loan.loanAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-gray-200">{loan.tenureMonths} months</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Interest:</span>
                  <span className="text-yellow-400">{loan.interestRate}%</span>
                </div>
                
                {expandedLoanIds.includes(loan.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Borrower:</span>
                        <span className="text-gray-200">{loan.user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Repayment:</span>
                        <span className="text-green-400 font-semibold">₹{loan.totalRepaymentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Period:</span>
                        <span className="text-gray-200">{formatDate(loan.startDate)} to {formatDate(loan.endDate)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex mt-3 gap-2">
                  <button
                    className="flex-1 py-2 bg-gray-700 text-gray-200 text-sm rounded hover:bg-gray-600 transition duration-300"
                    onClick={() => toggleExpanded(loan.id)}
                  >
                    {expandedLoanIds.includes(loan.id) ? "View Less" : "View More"}
                  </button>
                  <button
                    className="flex-1 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-300"
                    onClick={() => setSelectedLoan(loan)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <LoanDetailsModal 
          loan={selectedLoan} 
          onClose={() => setSelectedLoan(null)} 
          onFund={handleFundLoan}
        />
      )}
    </div>
  );
};

export default Loanfundinglistother;