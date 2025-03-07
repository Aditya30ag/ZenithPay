import React, { useState, useEffect } from "react";
import ParticleCanvas from "./ParticleCanvas";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAmount, setSavingAmount] = useState("");
  const [accountNumber, setaccountNumber] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

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
     
      setaccountNumber(data.accountNumber);
      setUserData(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSavings = async () => {
    const id = localStorage.getItem("id");
    if (!id) {
      alert("User ID not found. Please log in again.");
      return;
    }

    const amountToSave = parseFloat(savingAmount);
    if (!savingAmount || isNaN(amountToSave) || amountToSave <= 0) {
      alert("Please enter a valid savings amount.");
      return;
    }

    if (amountToSave > userData.balance) {
      alert("Insufficient balance to save this amount.");
      return;
    }

    try {
      const newBalance = userData.balance - amountToSave;
      const newSavings = userData.savingAmount + amountToSave;

      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          balance: newBalance,
          savingAmount: newSavings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update savings.");
      }

      // Update local state after a successful API call
      setUserData((prevData) => ({
        ...prevData,
        balance: newBalance,
        savingAmount: newSavings,
      }));
      console.log("Savings updated successfully:");
      setSavingAmount(""); // Reset input field
      alert("Savings updated successfully!");
      localStorage.setItem("alert","Savings updated successfully!");
    } catch (err) {
      console.error("Error updating savings:", err);
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <p>Please check that your backend is running and accessible.</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">No user data available</div>
        <p>Please check your login status and try again.</p>
      </div>
    );
  }
  const recentTransactions = userData.transactions
    ? [...userData.transactions]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    : [];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ParticleCanvas />
      <h1 className="text-2xl font-bold mb-6">Welcome, {userData.fullName}</h1>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="text-slate-400">Current Balance</div>
          <div className="text-2xl font-bold mt-2">
            ₹{userData.balance.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Account: {userData.accountNumber}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="text-slate-400">Savings Amount</div>
          <div className="text-2xl font-bold mt-2">
            ₹{userData.savingAmount.toLocaleString()}
          </div>
        </div>

        
      </div>

      {/* Add to Savings Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Add to Savings</h2>
        <div className="flex gap-4">
          <input
            type="number"
            value={savingAmount}
            onChange={(e) => setSavingAmount(e.target.value)}
            className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded"
            placeholder="Enter amount to save"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleAddSavings}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add to Savings
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        {recentTransactions.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-slate-400 py-2">Date</th>
                <th className="text-slate-400 py-2">Reference</th>
                <th className="text-slate-400 py-2">Amount</th>
                <th className="text-slate-400 py-2">Type</th>
                <th className="text-slate-400 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-slate-800">
                  <td className="py-2">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">{transaction.referenceNumber}</td>
                  <td className="py-2">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td
                    className={`py-2 ${
                      transaction.transactionType === "CREDIT"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {transaction.transactionType}
                  </td>
                  <td className="py-2">{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-400">No transactions available.</p>
        )}
      </div>
    </div>
  );
}
