import React, { useEffect, useState } from "react";
import axios from "axios";

const LoanFundingList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await axios.get(`http://localhost:8080/api/loans/user/${id}`);
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
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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

  // Filter loans based on status
  const availableLoans = loans.filter(
    (loan) => loan.status === "PENDING" 
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };

  return (
    <div className="w-full p-4 mx-auto bg-gray-900 mt-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 text-center">Requested Loans</h2>

        {availableLoans.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M20 12a8 8 0 01-8 8m8-8a8 8 0 00-8-8m8 8h-8" />
              </svg>
              <p className="text-gray-400 text-lg">No available loans requested at the moment</p>
              <p className="text-gray-500 mt-2 text-sm">Check back later for new opportunities</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile view - Enhanced cards with more details */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {availableLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-400">Loan</h3>
                    <span className="text-green-400 font-bold">₹{loan.loanAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-2 mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Borrower:</span>
                      <span className="text-gray-200">{loan.user.fullName || loan.user.username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Account:</span>
                      <span className="text-gray-200">{loan.user.accountNumber}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-gray-200">{loan.tenureMonths} months</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interest:</span>
                      <span className="text-yellow-400">{loan.interestRate}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Repayment:</span>
                      <span className="text-green-400">₹{loan.totalRepaymentAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Period:</span>
                      <span className="text-gray-200 text-xs">{formatDate(loan.startDate)} - {formatDate(loan.endDate)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-2 mt-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-gray-200">{loan.user.phonenumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-gray-200 text-xs">{loan.user.email}</span>
                    </div>
                  </div>
                  
                  <button
                    className="w-full mt-3 py-2 bg-blue-600 text-white text-sm rounded flex items-center justify-center"
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <span>View Full Details</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Tablet and desktop view - Now with consistent width */}
            <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-3">
              {availableLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-400">Loan</h3>
                    <span className="text-green-400 font-bold">₹{loan.loanAmount.toLocaleString()}</span>
                  </div>

                  
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-gray-200">{loan.tenureMonths} months</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interest:</span>
                      <span className="text-yellow-400">{loan.interestRate}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Repayment:</span>
                      <span className="text-green-400">₹{loan.totalRepaymentAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Period:</span>
                      <span className="text-gray-200">{formatDate(loan.startDate)} - {formatDate(loan.endDate)}</span>
                    </div>
                  </div>
                  
                  <button
                    className="w-full mt-3 py-2 bg-blue-600 text-white text-sm rounded flex items-center justify-center"
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <span>View Full Details</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detailed Loan Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-90vh overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400">Loan Details</h3>
                <button 
                  onClick={handleCloseModal} 
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-b border-gray-700 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">Borrower Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Full Name:</p>
                    <p className="text-white">{selectedLoan.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Username:</p>
                    <p className="text-white">{selectedLoan.user.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone:</p>
                    <p className="text-white">{selectedLoan.user.phonenumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email:</p>
                    <p className="text-white">{selectedLoan.user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-700 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">Loan Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loan Amount:</span>
                    <span className="text-green-400 font-bold">₹{selectedLoan.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interest Rate:</span>
                    <span className="text-yellow-400">{selectedLoan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tenure:</span>
                    <span className="text-white">{selectedLoan.tenureMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Repayment:</span>
                    <span className="text-green-400 font-bold">₹{selectedLoan.totalRepaymentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date:</span>
                    <span className="text-white">{formatDate(selectedLoan.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End Date:</span>
                    <span className="text-white">{formatDate(selectedLoan.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-blue-400 font-semibold">{selectedLoan.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-700 pb-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">Financial Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-green-400">₹{selectedLoan.user.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Savings Amount:</span>
                    <span className="text-green-400">₹{selectedLoan.user.savingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanFundingList;