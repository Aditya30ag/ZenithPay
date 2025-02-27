import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
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
        localStorage.setItem('alert', "Here you can view your account summary, add to savings, and see recent transactions.");
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

  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <p>Please check that your backend is running and accessible.</p>
      </div>
    );
  }

  // Calculate total transactions by type
  const transactionsByType = transactions.reduce((acc, curr) => {
    if (!acc[curr.transactionType]) {
      acc[curr.transactionType] = 0;
    }
    acc[curr.transactionType] += curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(transactionsByType).map(key => ({
    name: key,
    value: transactionsByType[key]
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

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
      
      {/* Transaction History Chart */}
      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Transaction History</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={transactions}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.25rem', color: '#e5e7eb' }}
              itemStyle={{ color: '#e5e7eb' }}
              labelStyle={{ color: '#e5e7eb' }}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
            <Bar dataKey="amount" fill="#6366f1" name="Transaction Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Transaction Type Distribution */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Transaction Types</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.25rem', color: '#e5e7eb' }}
              itemStyle={{ color: '#e5e7eb' }}
              labelStyle={{ color: '#e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
