import React, { useState } from 'react';

const LoanManagementDashboard = ({ loans, currentUser }) => {
  const [activeTab, setActiveTab] = useState('borrowed');

  // Filter loans for current user
  const userLoans = loans.filter(
    loan => loan.borrower === currentUser.username || loan.lender === currentUser.username
  );

  // Separate active and pending loans
  const activeLoansBorrowed = userLoans.filter(
    loan => loan.status === 'active' && loan.borrower === currentUser.username
  );

  const activeLoansFunded = userLoans.filter(
    loan => loan.status === 'active' && loan.lender === currentUser.username
  );

  // Loan Card Component
  const LoanCard = ({ loan, type }) => {
    const calculateMonthlyPayment = () => {
      const principal = loan.amount;
      const monthlyRate = loan.interestRate / 100 / 12;
      const numberOfPayments = loan.duration;

      return (
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      ).toFixed(2);
    };

    return (
      <div className="border border-gray-700 rounded-lg p-6  
                      transform transition-all duration-300 hover:scale-105">
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
              ${loan.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Interest Rate</p>
            <p className="text-yellow-400 font-bold">
              {loan.interestRate}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-gray-200">
              {loan.duration} months
            </p>
          </div>
          <div>
            <p className="text-gray-400">Monthly Payment</p>
            <p className="text-blue-400 font-bold">
              ${calculateMonthlyPayment()}
            </p>
          </div>
        </div>

        {type === 'funded' && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400">Borrower</p>
            <p className="text-white font-semibold">
              {loan.borrower}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 h-full p-6 m-10 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
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
            Loans Borrowed
          </button>
          <button
            onClick={() => setActiveTab('funded')}
            className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 
                        ${activeTab === 'funded' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Loans Funded
          </button>
        </div>

        {/* Borrowed Loans Section */}
        {activeTab === 'borrowed' && (
          <div>
            <h3 className="text-2xl text-white mb-4">
              Active Loans Borrowed
            </h3>
            {activeLoansBorrowed.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto text-gray-500 mb-4"
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
                <p className="text-gray-400 text-xl">
                  No active loans borrowed
                </p>
              </div>
            ) : (
              activeLoansBorrowed.map(loan => (
                <LoanCard key={loan.id} loan={loan} type="borrowed" />
              ))
            )}
          </div>
        )}

        {/* Funded Loans Section */}
        {activeTab === 'funded' && (
          <div>
            <h3 className="text-2xl text-white mb-4">
              Active Loans Funded
            </h3>
            {activeLoansFunded.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto text-gray-500 mb-4"
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
                <p className="text-gray-400 text-xl">
                  No active loans funded
                </p>
              </div>
            ) : (
              activeLoansFunded.map(loan => (
                <LoanCard key={loan.id} loan={loan} type="funded" />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanManagementDashboard;