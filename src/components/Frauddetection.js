import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const AdvancedFraudDetection = () => {
  // State for user data
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    highRiskPercentage: "0.0",
    mediumRiskPercentage: "0.0",
    lowRiskPercentage: "0.0",
  });

  const maxRetries = 3;

  // Fetch user data and transactions
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const id = localStorage.getItem("id");

      if (!id) {
        throw new Error("User ID not found in localStorage");
      }

      const response = await fetch(`http://localhost:8080/api/users/${id}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("User data fetched successfully:", data);

      if (data && data.accountNumber) {
        setUserData(data);
      } else {
        throw new Error("Invalid user data received from API.");
      }

      if (data.transactions && data.transactions.length > 0) {
        const processedTransactions = processTransactionsWithRiskAnalysis(data.transactions);
        setTransactions(processedTransactions);
        updateTransactionStats(processedTransactions);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Process transactions with risk analysis
  const processTransactionsWithRiskAnalysis = (transactions) => {
    if (!transactions || transactions.length === 0) return [];

    // Calculate average amount for reference
    const averageAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

    return transactions.map((transaction) => {
      let riskScore = 0;
      const flags = [];

      // Amount analysis
      if (transaction.amount > averageAmount * 3) {
        riskScore += 30;
        flags.push("unusual_amount");
      } else if (transaction.amount > averageAmount * 1.5) {
        riskScore += 15;
        flags.push("high_amount");
      }

      // Transaction frequency analysis
      const transactionDate = new Date(transaction.timestamp);
      const recentTransactions = transactions.filter((t) => {
        const tDate = new Date(t.timestamp);
        return Math.abs(transactionDate - tDate) / 36e5 < 2 && t.id !== transaction.id;
      });

      if (recentTransactions.length > 3) {
        riskScore += 25;
        flags.push("velocity");
      } else if (recentTransactions.length > 1) {
        riskScore += 10;
        flags.push("frequent_activity");
      }

      // Time pattern analysis
      const hour = transactionDate.getHours();
      if (hour < 6 || hour > 23) {
        riskScore += 10;
        flags.push("unusual_time");
      }

      // Failed transaction penalty
      if (transaction.status === "FAILED") {
        riskScore += 15;
        flags.push("failed_transaction");
      }

      riskScore = Math.min(Math.round(riskScore), 100);
      if (flags.length === 0) flags.push("normal");

      return { ...transaction, riskScore, flags };
    });
  };

  // Update transaction stats
  const updateTransactionStats = (transactions) => {
    const totalTransactions = transactions.length;
    const highRiskCount = transactions.filter((t) => t.riskScore >= 70).length;
    const mediumRiskCount = transactions.filter((t) => t.riskScore >= 30 && t.riskScore < 70).length;
    const lowRiskCount = transactions.filter((t) => t.riskScore < 30).length;

    setTransactionStats({
      totalTransactions,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      highRiskPercentage: totalTransactions ? ((highRiskCount / totalTransactions) * 100).toFixed(1) : "0.0",
      mediumRiskPercentage: totalTransactions ? ((mediumRiskCount / totalTransactions) * 100).toFixed(1) : "0.0",
      lowRiskPercentage: totalTransactions ? ((lowRiskCount / totalTransactions) * 100).toFixed(1) : "0.0",
    });
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    setRetryCount(0);
    fetchUserData();
  };


  // Add error handling with fallback to cached data
  useEffect(() => {
    if (error) {
      const cachedTransactions = localStorage.getItem("cachedTransactions");
      if (cachedTransactions) {
        console.log("Using cached transaction data due to fetch error");
        setTransactions(JSON.parse(cachedTransactions));
        setIsUsingCachedData(true);
      }
    }
  }, [error]);
  
  // Cache successful transaction fetches
  useEffect(() => {
    if (transactions.length > 0 && !isUsingCachedData) {
      localStorage.setItem("cachedTransactions", JSON.stringify(transactions));
      localStorage.setItem("lastTransactionFetch", new Date().toISOString());
    }
  }, [transactions, isUsingCachedData]);

  // States for dashboard
  const [filter, setFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [timeRange, setTimeRange] = useState("30");
  const [riskLevel, setRiskLevel] = useState("all");

  // Filter transactions based on selected filters
  const filteredTransactions = transactions
    .filter((t) => {
      // Filter by time range
      const txDate = new Date(t.timestamp);
      const today = new Date();
      const daysDifference = Math.floor(
        (today - txDate) / (1000 * 60 * 60 * 24)
      );
      return daysDifference <= parseInt(timeRange);
    })
    .filter((t) => {
      // Filter by risk level
      if (riskLevel === "all") return true;
      if (riskLevel === "high") return t.riskScore >= 70;
      if (riskLevel === "medium") return t.riskScore >= 30 && t.riskScore < 70;
      if (riskLevel === "low") return t.riskScore < 30;
      return true;
    })
    .filter((t) => {
      // Filter by transaction type
      if (filter === "all") return true;
      return t.transactionType === filter;
    });

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get background color based on risk score
  const getRiskColor = (score) => {
    if (score < 30) return "bg-green-900 text-green-100";
    if (score < 70) return "bg-yellow-900 text-yellow-100";
    return "bg-red-900 text-red-100";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-blue-400">
        Transaction Fraud Risk Analysis
      </h1>
      <h2 className="text-lg text-gray-400 mb-6">
        Account: {userData ? userData.accountNumber : "Loading..."} | {userData ? userData.fullName : "Loading..."}
      </h2>

      {/* Error and Loading States */}
      {isLoading && (
        <div className="p-4 bg-blue-900 text-blue-100 rounded mb-4">
          Loading transaction data...
        </div>
      )}
      {error && !isUsingCachedData && (
        <div className="p-4 bg-red-900 text-red-100 rounded mb-4">
          Error: {error}
        </div>
      )}
      {isUsingCachedData && (
        <div className="p-4 bg-yellow-900 text-yellow-100 rounded mb-4">
          Using cached data due to connection issues.
        </div>
      )}

      {/* Refresh Controls */}
      <div className="mb-4">
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-4 disabled:bg-blue-800 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
        <button
          onClick={() => setIsManuallyPaused(!isManuallyPaused)}
          className={`px-4 py-2 ${
            isManuallyPaused ? "bg-green-600" : "bg-red-600"
          } text-white rounded`}
        >
          {isManuallyPaused ? "Resume Auto-Refresh" : "Pause Auto-Refresh"}
        </button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-gray-400 text-sm">Total Transactions</h3>
          <p className="text-2xl font-bold text-white">
            {transactionStats.totalTransactions}
          </p>
        </div>
        <div className="bg-green-900 p-4 rounded border border-green-800">
          <h3 className="text-green-300 text-sm">Low Risk</h3>
          <p className="text-2xl font-bold text-green-100">
            {transactionStats.lowRiskCount}
          </p>
          <p className="text-sm text-green-300">
            {transactionStats.lowRiskPercentage}%
          </p>
        </div>
        <div className="bg-yellow-900 p-4 rounded border border-yellow-800">
          <h3 className="text-yellow-300 text-sm">Medium Risk</h3>
          <p className="text-2xl font-bold text-yellow-100">
            {transactionStats.mediumRiskCount}
          </p>
          <p className="text-sm text-yellow-300">
            {transactionStats.mediumRiskPercentage}%
          </p>
        </div>
        <div className="bg-red-900 p-4 rounded border border-red-800">
          <h3 className="text-red-300 text-sm">High Risk</h3>
          <p className="text-2xl font-bold text-red-100">
            {transactionStats.highRiskCount}
          </p>
          <p className="text-sm text-red-300">
            {transactionStats.highRiskPercentage}%
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
        <h2 className="text-lg font-semibold mb-3 text-blue-300">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Transaction Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
            >
              <option value="all">All Transactions</option>
              <option value="CREDIT">Credit Only</option>
              <option value="DEBIT">Debit Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk (70+)</option>
              <option value="medium">Medium Risk (30-69)</option>
              <option value="low">Low Risk (0-29)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risk Score Timeline */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
  <h2 className="text-lg font-semibold mb-3 text-blue-300">Risk Score Timeline</h2>
  {filteredTransactions.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={filteredTransactions}>
        <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#6b7280", color: "#f9fafb" }} />
        <Line
          type="monotone"
          dataKey="riskScore"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: "#3b82f6", r: 5 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="text-gray-400 text-center py-4">No transactions match the current filters</div>
  )}
</div>

      {/* Transaction Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-300">
          Transaction List
        </h2>
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-gray-700 rounded">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left text-gray-300">Date</th>
                  <th className="px-4 py-2 text-left text-gray-300">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-300">Type</th>
                  <th className="px-4 py-2 text-left text-gray-300">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-gray-300">Status</th>
                  <th className="px-4 py-2 text-left text-gray-300">
                    Risk Score
                  </th>
                  <th className="px-4 py-2 text-left text-gray-300">Flags</th>
                  <th className="px-4 py-2 text-left text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id || index}
                    className={`hover:bg-gray-700 border-b border-gray-700`}
                  >
                    <td className="px-4 py-2">
                      {formatTime(transaction.timestamp)}
                    </td>
                    <td className="px-4 py-2">
                      ₹{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{transaction.transactionType}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {transaction.referenceNumber}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === "COMPLETED"
                            ? "bg-green-800 text-green-100"
                            : transaction.status === "PENDING"
                            ? "bg-yellow-800 text-yellow-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-bold">
                      <span
                        className={`px-2 py-1 rounded ${getRiskColor(
                          transaction.riskScore
                        )}`}
                      >
                        {transaction.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {transaction.flags.slice(0, 2).map((flag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                          >
                            {flag}
                          </span>
                        ))}
                        {transaction.flags.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded">
                            +{transaction.flags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-gray-800 border border-gray-700 rounded text-center text-gray-400">
            No transactions match the current filters
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl border border-gray-700 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-300">
                Transaction Details
              </h2>
              <div
                className={`px-3 py-1 rounded-full ${
                  selectedTransaction.riskScore >= 70
                    ? "bg-red-900 text-red-100"
                    : selectedTransaction.riskScore >= 30
                    ? "bg-yellow-900 text-yellow-100"
                    : "bg-green-900 text-green-100"
                }`}
              >
                Risk Score: {selectedTransaction.riskScore}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400">Transaction ID</p>
                <p className="text-gray-100 font-mono text-sm break-all">
                  {selectedTransaction.transactionId || selectedTransaction.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Reference Number</p>
                <p className="text-gray-100 font-mono text-sm">
                  {selectedTransaction.referenceNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Amount</p>
                <p className="text-gray-100 text-xl font-bold">
                  ₹{selectedTransaction.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Transaction Type</p>
                <p className="text-gray-100">
                  {selectedTransaction.transactionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Timestamp</p>
                <p className="text-gray-100">
                  {new Date(selectedTransaction.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p
                  className={`font-bold ${
                    selectedTransaction.status === "COMPLETED"
                      ? "text-green-400"
                      : selectedTransaction.status === "PENDING"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedTransaction.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-gray-100">
                  {selectedTransaction.location || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Device</p>
                <p className="text-gray-100">
                  {selectedTransaction.device || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">IP Address</p>
                <p className="text-gray-100 font-mono">
                  {selectedTransaction.ipAddress || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Account</p>
                <p className="text-gray-100 font-mono">
                  {userData.accountNumber}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-300">
                Risk Factors
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTransaction.flags.map((flag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
                  >
                    {flag}
                  </span>
                ))}
              </div>

              <div className="p-3 bg-gray-700 rounded">
                <p className="text-gray-200 mb-2">
                  {selectedTransaction.riskScore >= 70
                    ? "⚠️ High Risk: This transaction has been flagged as potentially fraudulent."
                    : selectedTransaction.riskScore >= 30
                    ? "⚠️ Medium Risk: This transaction shows some unusual patterns."
                    : "✓ Low Risk: This transaction appears to be legitimate."}
                </p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  {selectedTransaction.flags.includes("unusual_amount") && (
                    <li>
                      Transaction amount (₹
                      {selectedTransaction.amount.toFixed(2)}) is significantly
                      higher than the average transaction amount
                    </li>
                  )}
                  {selectedTransaction.flags.includes("high_amount") && (
                    <li>
                      Transaction amount is higher than typical for this account
                    </li>
                  )}
                  {selectedTransaction.flags.includes("location_mismatch") && (
                    <li>
                      Transaction location ({selectedTransaction.location}) is
                      not a common location for this account
                    </li>
                  )}
                  {selectedTransaction.flags.includes("unusual_device") && (
                    <li>
                      Transaction was made from a device (
                      {selectedTransaction.device}) not frequently used by this
                      user
                    </li>
                  )}
                  {selectedTransaction.flags.includes("velocity") && (
                    <li>
                      Multiple transactions detected within a short time period
                    </li>
                  )}
                  {selectedTransaction.flags.includes("frequent_activity") && (
                    <li>Higher than usual transaction frequency</li>
                  )}
                  {selectedTransaction.flags.includes("unusual_time") && (
                    <li>
                      Transaction occurred at an unusual time (
                      {new Date(selectedTransaction.timestamp).getHours()}:00)
                    </li>
                  )}
                  {selectedTransaction.flags.includes("failed_transaction") && (
                    <li>
                      This transaction has failed, which may indicate attempted
                      fraud
                    </li>
                  )}
                  {selectedTransaction.flags.includes("suspicious_ip") && (
                    <li>
                      IP address has been associated with suspicious activity
                    </li>
                  )}
                  {selectedTransaction.flags.includes("normal") && (
                    <li>No suspicious patterns detected in this transaction</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                Mark as Reviewed
              </button>
              {selectedTransaction.riskScore >= 50 && (
                <button className="px-4 py-2 bg-red-600 text-white rounded">
                  Flag as Fraud
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFraudDetection;
