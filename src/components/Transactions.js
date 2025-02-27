import React, { useState, useEffect } from 'react';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        // Get user ID from localStorage (fallback to 1)
        const userId = localStorage.getItem('id') || '1';

        // Fetch transaction data from API
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        console.log("Fetched Transactions:", userData.transactions);
        localStorage.setItem('alert', "Here, you can view your account summary, add funds to your savings, and track recent transactions. You can also see the total number of transactions and categorize them as debit or credit and also analyisis the amount as well");
        setTransactions(userData.transactions || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate total transactions by type
  const transactionsByType = transactions.reduce((acc, curr) => {
    if (!acc[curr.transactionType]) {
      acc[curr.transactionType] = 0;
    }
    acc[curr.transactionType] += curr.amount;
    return acc;
  }, {});

  if (isLoading) {
    return <div className="text-center py-12">Loading transactions...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <p>Please check that your backend is running and accessible.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 rounded-lg shadow-lg text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Transaction Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Total Transactions</h2>
          <p className="text-3xl font-bold text-white">₹{transactions.reduce((sum, item) => sum + item.amount, 0)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Credit Transactions</h2>
          <p className="text-3xl font-bold text-emerald-400">₹{transactionsByType['CREDIT'] || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Debit Transactions</h2>
          <p className="text-3xl font-bold text-red-400">₹{transactionsByType['DEBIT'] || 0}</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Date</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Reference</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Amount</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">{transaction.referenceNumber}</td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">₹{transaction.amount.toLocaleString()}</td>
                    <td className={`py-2 px-4 border-b border-gray-700 ${transaction.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.transactionType}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">{transaction.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    No transactions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
