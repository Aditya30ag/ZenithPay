import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoanManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('borrowed');
  const [activeLoansBorrowed, setActiveLoansBorrowed] = useState([]);
  const [activeLoansFunded, setActiveLoansFunded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("id");
        
        // Fetch active borrowed loans
        const borrowedResponse = await axios.get(`http://localhost:8080/api/loans/userloanisactive/${userId}`);
        
        // Fetch active funded loans (you may need to adjust this endpoint)
        // const fundedResponse = await axios.get(`http://localhost:8080/api/loans/fundedloansisactive/${userId}`);
        
        setActiveLoansBorrowed(borrowedResponse.data || []);
        // setActiveLoansFunded(fundedResponse.data || []);
      } catch (err) {
        console.error("Error fetching loans:", err);
        setError("Failed to load loan data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Loan Card Component
  const LoanCard = ({ loan, type }) => {
    const calculateMonthlyPayment = () => {
      const principal = loan.loanAmount;
      const monthlyRate = loan.interestRate / 100 / 12;
      const numberOfPayments = loan.tenureMonths;

      return (
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      ).toFixed(2);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return (
      <div className="border border-gray-700 rounded-lg p-6 mb-4 transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h4 className="text-xl font-semibold text-blue-400">
            {type === 'borrowed' ? 'Borrowed Loan' : 'Funded Loan'}
          </h4>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm uppercase">
            {loan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Loan Amount</p>
            <p className="text-green-400 font-bold">
              ${loan.loanAmount?.toLocaleString() || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Interest Rate</p>
            <p className="text-yellow-400 font-bold">
              {loan.interestRate || 'N/A'}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-gray-200">
              {loan.tenureMonths || 'N/A'} months
            </p>
          </div>
          <div>
            <p className="text-gray-400">Monthly Payment</p>
            <p className="text-blue-400 font-bold">
              ${calculateMonthlyPayment()}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Start Date</p>
            <p className="text-gray-200">
              {formatDate(loan.startDate)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">End Date</p>
            <p className="text-gray-200">
              {formatDate(loan.endDate)}
            </p>
          </div>
        </div>

        {type === 'funded' && loan.user && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400">Borrower</p>
            <p className="text-white font-semibold">
              {loan.user.username || 'Anonymous'}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-center">
            <div className="h-6 bg-gray-700 rounded w-48 mb-4 mx-auto"></div>
            <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div className="flex justify-center items-center h-40 text-red-500 text-center">
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
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto bg-gray-900 min-w-screen rounded-xl mt-4">
      <div className="mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          My Loan Dashboard
        </h2>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 
                        ${activeTab === 'borrowed' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Borrowed
          </button>
          <button
            onClick={() => setActiveTab('funded')}
            className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 
                        ${activeTab === 'funded' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Funded
          </button>
        </div>

        {/* Borrowed Loans Section */}
        {activeTab === 'borrowed' && (
          <div>
            <h3 className="text-xl text-white mb-4">
              Active Loans Borrowed
            </h3>
            {activeLoansBorrowed.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-500 mb-4"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-gray-400 text-lg">
                  No active loans borrowed
                </p>
              </div>
            ) : (
              <div>
                {activeLoansBorrowed.map(loan => (
                  <LoanCard key={loan.id} loan={loan} type="borrowed" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Funded Loans Section */}
        {activeTab === 'funded' && (
          <div>
            <h3 className="text-xl text-white mb-4">
              Active Loans Funded
            </h3>
            {activeLoansFunded.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-500 mb-4"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                <p className="text-gray-400 text-lg">
                  No active loans funded
                </p>
              </div>
            ) : (
              <div>
                {activeLoansFunded.map(loan => (
                  <LoanCard key={loan.id} loan={loan} type="funded" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanManagementDashboard;